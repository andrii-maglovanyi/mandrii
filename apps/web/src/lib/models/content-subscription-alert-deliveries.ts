import { constants } from "~/lib/constants";
import sql from "~/lib/db/db";
import { UrlHelper } from "~/lib/url-helper";

export const CONTENT_ALERT_DELIVERY_FREQUENCIES = ["DAILY", "IMMEDIATE", "WEEKLY"] as const;
export type ContentAlertDeliveryFrequency = (typeof CONTENT_ALERT_DELIVERY_FREQUENCIES)[number];

export type ContentAlertDeliveryPreferences = {
  emailEnabled: boolean;
  frequency: ContentAlertDeliveryFrequency;
  pushEnabled: boolean;
  pushSubscribed: boolean;
  pushSupported: boolean;
  telegramEnabled: boolean;
  telegramLinked: boolean;
};

export type ContentAlertDeliveryPreferenceUpdate = Partial<
  Pick<ContentAlertDeliveryPreferences, "emailEnabled" | "frequency" | "pushEnabled" | "telegramEnabled">
>;

type DeliveryChannel = "EMAIL" | "TELEGRAM" | "WEB_PUSH";
type DeliveryRow = {
  alert_id: string;
  attempts: number;
  body: null | string;
  channel: DeliveryChannel;
  email: string;
  href: string;
  id: string;
  recipient_id: string;
  telegram_chat_id: null | number;
  title: string;
};

const MAX_DELIVERY_ATTEMPTS = 8;
// A daily digest should remain a digest, not turn one slow recipient into an
// unbounded provider request after an outage.
const MAX_DELIVERIES_PER_RECIPIENT_CHANNEL = 10;

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");

const isContentAlertWebPushConfigured = async () => (await import("~/lib/web-push")).isWebPushConfigured();

export const getContentAlertDeliveryRetryOutcome = (attempts: number) => {
  if (attempts >= MAX_DELIVERY_ATTEMPTS) return { delaySeconds: null, status: "FAILED" as const };
  return {
    delaySeconds: Math.min(86_400, 60 * 2 ** Math.max(0, attempts - 1)),
    status: "PENDING" as const,
  };
};

export async function getContentAlertDeliveryPreferences(userId: string): Promise<ContentAlertDeliveryPreferences> {
  const [preferences] = await sql<
    Array<{
      email_enabled: boolean;
      frequency: ContentAlertDeliveryFrequency;
      push_enabled: boolean;
      push_subscribed: boolean;
      telegram_enabled: boolean;
      telegram_linked: boolean;
    }>
  >`
    SELECT user_account.content_alert_email_notifications_enabled AS email_enabled,
           user_account.content_alert_telegram_notifications_enabled AS telegram_enabled,
           user_account.content_alert_push_notifications_enabled AS push_enabled,
           user_account.content_alert_delivery_frequency AS frequency,
           user_account.telegram_chat_id IS NOT NULL AND user_account.telegram_user_id IS NOT NULL AS telegram_linked,
           EXISTS (SELECT 1 FROM push_subscriptions subscription WHERE subscription.user_id = user_account.id) AS push_subscribed
    FROM users user_account
    WHERE user_account.id = ${userId}
  `;

  return {
    emailEnabled: preferences?.email_enabled ?? false,
    frequency: preferences?.frequency ?? "IMMEDIATE",
    pushEnabled: preferences?.push_enabled ?? false,
    pushSubscribed: preferences?.push_subscribed ?? false,
    pushSupported: await isContentAlertWebPushConfigured(),
    telegramEnabled: preferences?.telegram_enabled ?? false,
    telegramLinked: preferences?.telegram_linked ?? false,
  };
}

export async function updateContentAlertDeliveryPreferences(
  userId: string,
  preferences: ContentAlertDeliveryPreferenceUpdate,
) {
  const updated = await sql.begin(async (transaction) => {
    const [user] = await transaction<
      Array<{
        email_enabled: boolean;
        frequency: ContentAlertDeliveryFrequency;
        push_enabled: boolean;
        push_subscribed: boolean;
        telegram_enabled: boolean;
        telegram_linked: boolean;
      }>
    >`
      UPDATE users user_account
      SET content_alert_email_notifications_enabled = COALESCE(
            ${preferences.emailEnabled ?? null}, user_account.content_alert_email_notifications_enabled
          ),
          content_alert_telegram_notifications_enabled = COALESCE(
            ${preferences.telegramEnabled ?? null}, user_account.content_alert_telegram_notifications_enabled
          )
            AND user_account.telegram_chat_id IS NOT NULL
            AND user_account.telegram_user_id IS NOT NULL,
          content_alert_push_notifications_enabled = COALESCE(
            ${preferences.pushEnabled ?? null}, user_account.content_alert_push_notifications_enabled
          )
            AND EXISTS (SELECT 1 FROM push_subscriptions subscription WHERE subscription.user_id = user_account.id),
          content_alert_delivery_frequency = COALESCE(
            ${preferences.frequency ?? null}, user_account.content_alert_delivery_frequency
          ),
          content_alert_delivery_preferences_updated_at = NOW()
      WHERE user_account.id = ${userId}
      RETURNING content_alert_email_notifications_enabled AS email_enabled,
                content_alert_telegram_notifications_enabled AS telegram_enabled,
                content_alert_push_notifications_enabled AS push_enabled,
                content_alert_delivery_frequency AS frequency,
                telegram_chat_id IS NOT NULL AND telegram_user_id IS NOT NULL AS telegram_linked,
                EXISTS (SELECT 1 FROM push_subscriptions subscription WHERE subscription.user_id = user_account.id) AS push_subscribed
    `;

    if (preferences.frequency) {
      // Frequency changes should affect alerts already queued for this person,
      // rather than leaving them at the previous schedule until the next day.
      await transaction`
        UPDATE content_subscription_alert_deliveries
        SET next_attempt_at = public.content_alert_delivery_next_attempt_at(${preferences.frequency})
        WHERE recipient_id = ${userId} AND status = 'PENDING'
      `;
    }
    return user;
  });

  return {
    emailEnabled: updated?.email_enabled ?? false,
    frequency: updated?.frequency ?? "IMMEDIATE",
    pushEnabled: updated?.push_enabled ?? false,
    pushSubscribed: updated?.push_subscribed ?? false,
    pushSupported: await isContentAlertWebPushConfigured(),
    telegramEnabled: updated?.telegram_enabled ?? false,
    telegramLinked: updated?.telegram_linked ?? false,
  } satisfies ContentAlertDeliveryPreferences;
}

async function cancelDisabledDeliveries() {
  await sql`
    UPDATE content_subscription_alert_deliveries delivery
    SET status = 'CANCELLED', locked_at = NULL
    FROM users user_account
    WHERE delivery.recipient_id = user_account.id
      AND delivery.status IN ('PENDING', 'PROCESSING')
      AND (
        (delivery.channel = 'EMAIL' AND NOT user_account.content_alert_email_notifications_enabled)
        OR (delivery.channel = 'TELEGRAM' AND (
          NOT user_account.content_alert_telegram_notifications_enabled
          OR user_account.telegram_chat_id IS NULL
          OR user_account.telegram_user_id IS NULL
        ))
        OR (delivery.channel = 'WEB_PUSH' AND NOT user_account.content_alert_push_notifications_enabled)
      )
  `;
}

async function claimDeliveryGroups(limit: number): Promise<DeliveryRow[]> {
  return sql.begin(
    (transaction) => transaction<DeliveryRow[]>`
      WITH due_candidates AS (
        SELECT delivery.id, delivery.recipient_id, delivery.channel
        FROM content_subscription_alert_deliveries delivery
        JOIN users user_account ON user_account.id = delivery.recipient_id
        WHERE (
          (delivery.status = 'PENDING' AND delivery.next_attempt_at <= NOW())
          OR (delivery.status = 'PROCESSING' AND delivery.locked_at < NOW() - INTERVAL '10 minutes')
        )
          AND (
            (delivery.channel = 'EMAIL' AND user_account.content_alert_email_notifications_enabled)
            OR (delivery.channel = 'TELEGRAM' AND user_account.content_alert_telegram_notifications_enabled
              AND user_account.telegram_chat_id IS NOT NULL AND user_account.telegram_user_id IS NOT NULL)
            OR (delivery.channel = 'WEB_PUSH' AND user_account.content_alert_push_notifications_enabled)
          )
        ORDER BY delivery.next_attempt_at, delivery.created_at
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      ), due AS (
        -- Do not turn a bounded cron batch into an unbounded provider request.
        -- The advisory lock prevents two workers from delivering the same
        -- recipient/channel concurrently.
        SELECT id, recipient_id, channel
        FROM (
          SELECT due_candidates.*,
                 ROW_NUMBER() OVER (PARTITION BY recipient_id, channel ORDER BY id) AS position
          FROM due_candidates
        ) ranked_candidates
        WHERE position <= ${MAX_DELIVERIES_PER_RECIPIENT_CHANNEL}
          AND pg_try_advisory_xact_lock(hashtext(recipient_id::text || ':' || channel))
      ), claimed AS (
        UPDATE content_subscription_alert_deliveries delivery
        SET status = 'PROCESSING', locked_at = NOW(), attempts = delivery.attempts + 1
        FROM due
        WHERE delivery.id = due.id
        RETURNING delivery.id, delivery.alert_id, delivery.recipient_id, delivery.channel, delivery.attempts
      )
      SELECT claimed.id, claimed.alert_id, claimed.recipient_id, claimed.channel, claimed.attempts,
             alert.title, alert.body, alert.href, user_account.email, user_account.telegram_chat_id
      FROM claimed
      JOIN content_subscription_alerts alert ON alert.id = claimed.alert_id
      JOIN users user_account ON user_account.id = claimed.recipient_id
      ORDER BY claimed.recipient_id, claimed.channel, alert.created_at, alert.id
    `,
  );
}

const getGroups = (deliveries: DeliveryRow[]) => {
  const groups = new Map<string, DeliveryRow[]>();
  for (const delivery of deliveries) {
    const key = `${delivery.recipient_id}:${delivery.channel}`;
    const group = groups.get(key);
    if (group) group.push(delivery);
    else groups.set(key, [delivery]);
  }
  return groups.values();
};

const sendEmail = async (delivery: DeliveryRow[]) => {
  const [first] = delivery;
  const [{ Resend }, { privateConfig }] = await Promise.all([import("resend"), import("~/lib/config/private")]);
  const title = delivery.length === 1 ? first.title : `${delivery.length} new updates on Mandrii`;
  const alertList = delivery
    .slice(0, 10)
    .map((alert) => `<li><a href="${escapeHtml(UrlHelper.buildUrl(alert.href))}">${escapeHtml(alert.title)}</a></li>`)
    .join("");
  const suffix = delivery.length > 10 ? `<p>Plus ${delivery.length - 10} more updates in Mandrii.</p>` : "";
  const result = await new Resend(privateConfig.email.resendApiKey).emails.send({
    from: constants.fromEmail("en"),
    html: `<p>You have new activity from the places, events and areas you follow.</p><ul>${alertList}</ul>${suffix}`,
    subject: title,
    to: first.email,
  });
  if (result.error) throw new Error(`Email delivery failed: ${result.error.message}`);
};

const sendTelegram = async (delivery: DeliveryRow[]) => {
  const [first] = delivery;
  if (!first.telegram_chat_id) throw new Error("Telegram is no longer linked");
  const { sendContentAlertTelegramNotification } = await import("~/lib/telegram/bot");
  await sendContentAlertTelegramNotification({ alerts: delivery, chatId: first.telegram_chat_id });
};

const sendWebPush = async (delivery: DeliveryRow[]) => {
  const [first] = delivery;
  const { sendContentAlertPushNotification } = await import("~/lib/web-push");
  return sendContentAlertPushNotification({ alerts: delivery, recipientUserId: first.recipient_id });
};

/** Delivers immediate alerts and coalesces daily alerts into one digest per channel. */
export async function deliverPendingContentSubscriptionAlertDeliveries({ limit = 50 }: { limit?: number } = {}) {
  await cancelDisabledDeliveries();
  const deliveries = (await claimDeliveryGroups(limit)) ?? [];
  let delivered = 0;
  let failed = 0;

  for (const group of getGroups(deliveries)) {
    try {
      if (!(await isGroupStillEnabled(group))) {
        await cancelClaimed(group.map((delivery) => delivery.id));
        continue;
      }

      let wasDelivered = true;
      if (group[0].channel === "EMAIL") await sendEmail(group);
      else if (group[0].channel === "TELEGRAM") await sendTelegram(group);
      else wasDelivered = await sendWebPush(group);

      if (wasDelivered) {
        await markDelivered(group.map((delivery) => delivery.id));
        delivered += group.length;
      } else {
        await cancelClaimed(group.map((delivery) => delivery.id));
      }
    } catch (error) {
      failed += group.length;
      await reschedule(group, error);
      console.error("Content subscription external alert delivery failed", error);
    }
  }

  return { claimed: deliveries.length, delivered, enqueued: 0, failed };
}

export async function getContentSubscriptionAlertDeliveryMetrics() {
  const [metrics] = await sql<
    Array<{
      failed: number;
      oldest_pending_at: Date | null;
      pending: number;
      processing: number;
    }>
  >`
    SELECT COUNT(*) FILTER (WHERE status = 'PENDING')::int AS pending,
           COUNT(*) FILTER (WHERE status = 'PROCESSING')::int AS processing,
           COUNT(*) FILTER (WHERE status = 'FAILED')::int AS failed,
           MIN(next_attempt_at) FILTER (WHERE status = 'PENDING') AS oldest_pending_at
    FROM content_subscription_alert_deliveries
  `;
  return metrics ?? { failed: 0, oldest_pending_at: null, pending: 0, processing: 0 };
}

async function cancelClaimed(deliveryIds: string[]) {
  await sql`
    UPDATE content_subscription_alert_deliveries
    SET status = 'CANCELLED', locked_at = NULL
    WHERE id = ANY(${deliveryIds}::uuid[]) AND status = 'PROCESSING'
  `;
}

async function isGroupStillEnabled(delivery: DeliveryRow[]) {
  const [first] = delivery;
  const [result] = await sql<Array<{ enabled: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM content_subscription_alert_deliveries delivery
      JOIN users user_account ON user_account.id = delivery.recipient_id
      WHERE delivery.id = ${first.id}
        AND delivery.status = 'PROCESSING'
        AND (
          (delivery.channel = 'EMAIL' AND user_account.content_alert_email_notifications_enabled)
          OR (delivery.channel = 'TELEGRAM' AND user_account.content_alert_telegram_notifications_enabled
            AND user_account.telegram_chat_id IS NOT NULL AND user_account.telegram_user_id IS NOT NULL)
          OR (delivery.channel = 'WEB_PUSH' AND user_account.content_alert_push_notifications_enabled)
        )
    ) AS enabled
  `;
  return result?.enabled ?? false;
}

async function markDelivered(deliveryIds: string[]) {
  await sql`
    UPDATE content_subscription_alert_deliveries
    SET status = 'DELIVERED', delivered_at = NOW(), locked_at = NULL, last_error = NULL
    WHERE id = ANY(${deliveryIds}::uuid[]) AND status = 'PROCESSING'
  `;
}

async function reschedule(deliveries: DeliveryRow[], error: unknown) {
  const message = (error instanceof Error ? error.message : String(error)).slice(0, 1000);
  await Promise.all(
    deliveries.map(async (delivery) => {
      const outcome = getContentAlertDeliveryRetryOutcome(delivery.attempts);
      await sql`
        UPDATE content_subscription_alert_deliveries
        SET status = ${outcome.status},
            locked_at = NULL,
            next_attempt_at = CASE
              WHEN ${outcome.delaySeconds} IS NULL THEN next_attempt_at
              ELSE NOW() + make_interval(secs => ${outcome.delaySeconds}::integer)
            END,
            last_error = ${message}
        WHERE id = ${delivery.id} AND status = 'PROCESSING'
      `;
    }),
  );
}
