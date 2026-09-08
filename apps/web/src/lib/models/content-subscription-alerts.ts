import sql from "~/lib/db/db";
import { UUID } from "~/types/uuid";

import { deliverPendingContentSubscriptionAlertDeliveries } from "./content-subscription-alert-deliveries";

const MAX_ALERT_DELIVERY_ATTEMPTS = 8;
const MAX_AREA_RADIUS_METERS = 100_000;

export const getContentSubscriptionAlertRetryOutcome = (attempts: number) => {
  if (attempts >= MAX_ALERT_DELIVERY_ATTEMPTS) return { delaySeconds: null, status: "FAILED" as const };

  return {
    // Attempts are incremented while claiming a job, so the first failed
    // attempt waits one minute, then doubles up to one day.
    delaySeconds: Math.min(86_400, 60 * 2 ** Math.max(0, attempts - 1)),
    status: "PENDING" as const,
  };
};

export type ContentSubscriptionAlert = {
  body: null | string;
  createdAt: string;
  href: string;
  id: string;
  kind: "CONTENT_UPDATE" | "EVENT_CHANGED" | "EVENT_PUBLISHED" | "VENUE_PUBLISHED";
  readAt: null | string;
  title: string;
};

type AlertJob = {
  attempts: number;
  content_update_id: null | string;
  event_id: null | string;
  id: string;
  kind: ContentSubscriptionAlert["kind"];
  source_at: Date | string;
  venue_id: null | string;
};

type AlertRow = {
  body: null | string;
  created_at: Date | string;
  href: string;
  id: string;
  kind: ContentSubscriptionAlert["kind"];
  read_at: Date | null | string;
  title: string;
};

const toAlert = (row: AlertRow): ContentSubscriptionAlert => ({
  body: row.body,
  createdAt: new Date(row.created_at).toISOString(),
  href: row.href,
  id: row.id,
  kind: row.kind,
  readAt: row.read_at ? new Date(row.read_at).toISOString() : null,
  title: row.title,
});

async function deliverContentUpdate(job: AlertJob) {
  if (!job.content_update_id) return;

  await sql`
    INSERT INTO content_subscription_alerts (
      recipient_id, subscription_id, venue_id, event_id, content_update_id, kind, title, body, href
    )
    SELECT subscription.user_id, subscription.id, venue.id, NULL, update.id, 'CONTENT_UPDATE', venue.name, update.body,
           '/venues/' || venue.slug || '?update=' || update.id || '#Feed'
    FROM content_updates update
    JOIN venues venue ON venue.id = update.venue_id
    JOIN content_subscriptions subscription
      ON subscription.venue_id = update.venue_id AND subscription.updates_enabled
    WHERE update.id = ${job.content_update_id}
      AND subscription.user_id <> update.author_id
      AND subscription.created_at <= ${job.source_at}
    ON CONFLICT (recipient_id, content_update_id) WHERE content_update_id IS NOT NULL DO NOTHING
  `;

  await sql`
    INSERT INTO content_subscription_alerts (
      recipient_id, subscription_id, venue_id, event_id, content_update_id, kind, title, body, href
    )
    SELECT subscription.user_id, subscription.id, NULL, event.id, update.id, 'CONTENT_UPDATE', event.title_en, update.body,
           '/events/' || event.slug || '?update=' || update.id || '#Feed'
    FROM content_updates update
    JOIN events event ON event.id = update.event_id
    JOIN content_subscriptions subscription
      ON subscription.event_id = update.event_id AND subscription.updates_enabled
    WHERE update.id = ${job.content_update_id}
      AND subscription.user_id <> update.author_id
      AND subscription.created_at <= ${job.source_at}
    ON CONFLICT (recipient_id, content_update_id) WHERE content_update_id IS NOT NULL DO NOTHING
  `;

  // The coarse, constant-radius condition lets PostGIS use the GiST index. The
  // second condition remains the precise per-follow radius check.
  await sql`
    WITH target AS (
      SELECT update.id, update.author_id, update.body, update.venue_id, update.event_id,
             COALESCE(venue.name, event.title_en) AS title,
             COALESCE(venue.slug, event.slug) AS slug,
             COALESCE(venue.geo, event.geo) AS geo
      FROM content_updates update
      LEFT JOIN venues venue ON venue.id = update.venue_id
      LEFT JOIN events event ON event.id = update.event_id
      WHERE update.id = ${job.content_update_id}
    )
    INSERT INTO content_subscription_alerts (
      recipient_id, subscription_id, venue_id, event_id, content_update_id, kind, title, body, href
    )
    SELECT subscription.user_id, subscription.id, target.venue_id, target.event_id, target.id, 'CONTENT_UPDATE',
           target.title, target.body,
           CASE WHEN target.venue_id IS NOT NULL
             THEN '/venues/' || target.slug || '?update=' || target.id || '#Feed'
             ELSE '/events/' || target.slug || '?update=' || target.id || '#Feed'
           END
    FROM target
    JOIN content_subscriptions subscription
      ON subscription.area_geo IS NOT NULL
      AND subscription.updates_enabled
      AND target.geo IS NOT NULL
      AND ST_DWithin(subscription.area_geo, target.geo, ${MAX_AREA_RADIUS_METERS})
      AND ST_DWithin(subscription.area_geo, target.geo, subscription.area_radius_meters)
    WHERE subscription.user_id <> target.author_id
      AND subscription.created_at <= ${job.source_at}
    ON CONFLICT (recipient_id, content_update_id) WHERE content_update_id IS NOT NULL DO NOTHING
  `;
}

async function deliverEventPublished(job: AlertJob) {
  if (!job.event_id) return;

  await sql`
    INSERT INTO content_subscription_alerts (recipient_id, subscription_id, venue_id, event_id, kind, title, body, href)
    SELECT subscription.user_id, subscription.id, event.venue_id, event.id, 'EVENT_PUBLISHED', event.title_en,
           event.start_date::text, '/events/' || event.slug
    FROM events event
    JOIN content_subscriptions subscription
      ON subscription.venue_id = event.venue_id AND subscription.new_events_enabled
    WHERE event.id = ${job.event_id}
      AND event.status = 'ACTIVE'
      AND subscription.user_id <> event.user_id
      AND subscription.created_at <= ${job.source_at}
    ON CONFLICT (recipient_id, event_id, kind) WHERE kind = 'EVENT_PUBLISHED' DO NOTHING
  `;

  await sql`
    WITH target AS (
      SELECT event.id, event.venue_id, event.user_id, event.title_en, event.start_date, event.slug,
             COALESCE(event.geo, venue.geo) AS geo
      FROM events event
      LEFT JOIN venues venue ON venue.id = event.venue_id
      WHERE event.id = ${job.event_id} AND event.status = 'ACTIVE'
    )
    INSERT INTO content_subscription_alerts (recipient_id, subscription_id, venue_id, event_id, kind, title, body, href)
    SELECT subscription.user_id, subscription.id, target.venue_id, target.id, 'EVENT_PUBLISHED', target.title_en,
           target.start_date::text, '/events/' || target.slug
    FROM target
    JOIN content_subscriptions subscription
      ON subscription.area_geo IS NOT NULL
      AND subscription.new_events_enabled
      AND target.geo IS NOT NULL
      AND ST_DWithin(subscription.area_geo, target.geo, ${MAX_AREA_RADIUS_METERS})
      AND ST_DWithin(subscription.area_geo, target.geo, subscription.area_radius_meters)
    WHERE subscription.user_id <> target.user_id
      AND subscription.created_at <= ${job.source_at}
    ON CONFLICT (recipient_id, event_id, kind) WHERE kind = 'EVENT_PUBLISHED' DO NOTHING
  `;
}

async function deliverEventChanged(job: AlertJob) {
  if (!job.event_id) return;

  await sql`
    INSERT INTO content_subscription_alerts (recipient_id, subscription_id, event_id, alert_job_id, kind, title, body, href)
    SELECT subscription.user_id, subscription.id, event.id, ${job.id}, 'EVENT_CHANGED', event.title_en,
           CASE event.status
             WHEN 'CANCELLED' THEN 'This event was cancelled.'
             WHEN 'ARCHIVED' THEN 'This event is no longer active.'
             ELSE 'Event details have been updated.'
           END,
           '/events/' || event.slug
    FROM events event
    JOIN content_subscriptions subscription
      ON subscription.event_id = event.id AND subscription.event_changes_enabled
    WHERE event.id = ${job.event_id}
      AND subscription.user_id <> event.user_id
      AND subscription.created_at <= ${job.source_at}
    ON CONFLICT (recipient_id, alert_job_id) WHERE alert_job_id IS NOT NULL DO NOTHING
  `;
}

async function deliverVenuePublished(job: AlertJob) {
  if (!job.venue_id) return;

  await sql`
    INSERT INTO content_subscription_alerts (recipient_id, subscription_id, venue_id, kind, title, body, href)
    SELECT subscription.user_id, subscription.id, venue.id, 'VENUE_PUBLISHED', venue.name,
           COALESCE(venue.address, NULLIF(CONCAT_WS(', ', venue.city, venue.country), '')),
           '/venues/' || venue.slug
    FROM venues venue
    JOIN content_subscriptions subscription
      ON subscription.area_geo IS NOT NULL
      AND subscription.new_venues_enabled
      AND venue.geo IS NOT NULL
      AND ST_DWithin(subscription.area_geo, venue.geo, ${MAX_AREA_RADIUS_METERS})
      AND ST_DWithin(subscription.area_geo, venue.geo, subscription.area_radius_meters)
    WHERE venue.id = ${job.venue_id}
      AND venue.status = 'ACTIVE'
      AND subscription.user_id <> venue.user_id
      AND subscription.created_at <= ${job.source_at}
    ON CONFLICT (recipient_id, venue_id, kind) WHERE kind = 'VENUE_PUBLISHED' DO NOTHING
  `;
}

const deliver = async (job: AlertJob) => {
  switch (job.kind) {
    case "CONTENT_UPDATE":
      return deliverContentUpdate(job);
    case "EVENT_CHANGED":
      return deliverEventChanged(job);
    case "EVENT_PUBLISHED":
      return deliverEventPublished(job);
    case "VENUE_PUBLISHED":
      return deliverVenuePublished(job);
  }
};

async function claimAlertJobs(limit: number, jobId?: UUID) {
  return sql.begin(
    (transaction) => transaction<AlertJob[]>`
    WITH due AS (
      SELECT id
      FROM content_subscription_alert_jobs
      WHERE (
        (status = 'PENDING' AND next_attempt_at <= NOW())
        OR (status = 'PROCESSING' AND locked_at < NOW() - INTERVAL '10 minutes')
      )
      ${jobId ? sql`AND id = ${jobId}` : sql``}
      ORDER BY next_attempt_at, created_at
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    )
    UPDATE content_subscription_alert_jobs job
    SET status = 'PROCESSING', locked_at = NOW(), attempts = job.attempts + 1
    FROM due
    WHERE job.id = due.id
    RETURNING job.id, job.kind, job.content_update_id, job.event_id, job.venue_id, job.source_at, job.attempts
  `,
  );
}

async function markAlertJobDelivered(id: string) {
  await sql`
    UPDATE content_subscription_alert_jobs
    SET status = 'DELIVERED', delivered_at = NOW(), locked_at = NULL, last_error = NULL
    WHERE id = ${id} AND status = 'PROCESSING'
  `;
}

async function rescheduleAlertJob(job: AlertJob, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const outcome = getContentSubscriptionAlertRetryOutcome(job.attempts);
  await sql`
    UPDATE content_subscription_alert_jobs
    SET status = ${outcome.status},
        locked_at = NULL,
        next_attempt_at = CASE
          WHEN ${outcome.delaySeconds} IS NULL THEN next_attempt_at
          ELSE NOW() + make_interval(secs => ${outcome.delaySeconds}::integer)
        END,
        last_error = LEFT(${message}, 1000)
    WHERE id = ${job.id} AND status = 'PROCESSING'
  `;
}

/**
 * Processes durable alert jobs. Jobs are claimed with SKIP LOCKED, so cron and
 * post-response delivery can safely run at the same time without duplicates.
 */
export async function deliverPendingContentSubscriptionAlerts({
  jobId,
  limit = 20,
}: { jobId?: UUID; limit?: number } = {}) {
  const jobs = await claimAlertJobs(limit, jobId);
  let delivered = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      await deliver(job);
      await markAlertJobDelivered(job.id);
      delivered += 1;
    } catch (error) {
      failed += 1;
      await rescheduleAlertJob(job, error).catch((rescheduleError) => {
        console.error("Failed to reschedule content subscription alert job", rescheduleError);
      });
      console.error("Content subscription alert delivery failed", error);
    }
  }

  // The external outbox is independent from the in-app alert job. A channel
  // failure must never retry or duplicate the underlying follower alert.
  await deliverPendingContentSubscriptionAlertDeliveries({ limit: limit * 3 }).catch((error) => {
    console.error("Content subscription external alert delivery failed:", error);
  });

  return { claimed: jobs.length, delivered, failed };
}

export async function getContentSubscriptionAlerts(userId: UUID, limit = 50): Promise<ContentSubscriptionAlert[]> {
  const rows = await sql<AlertRow[]>`
    SELECT id, kind, title, body, href, read_at, created_at
    FROM content_subscription_alerts
    WHERE recipient_id = ${userId}
    ORDER BY created_at DESC, id DESC
    LIMIT ${limit}
  `;
  return rows.map(toAlert);
}

export async function getContentSubscriptionAlertJobMetrics() {
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
    FROM content_subscription_alert_jobs
  `;
  return metrics ?? { failed: 0, oldest_pending_at: null, pending: 0, processing: 0 };
}

export async function markContentSubscriptionAlertsRead(userId: UUID, alertId?: UUID): Promise<number> {
  if (alertId) {
    const rows = await sql<{ id: string }[]>`
      UPDATE content_subscription_alerts SET read_at = COALESCE(read_at, NOW())
      WHERE id = ${alertId} AND recipient_id = ${userId}
      RETURNING id
    `;
    return rows.length;
  }
  const rows = await sql<{ id: string }[]>`
    UPDATE content_subscription_alerts SET read_at = NOW()
    WHERE recipient_id = ${userId} AND read_at IS NULL
    RETURNING id
  `;
  return rows.length;
}
