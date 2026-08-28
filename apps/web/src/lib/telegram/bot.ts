import { captureException } from "@sentry/nextjs";
import { Bot } from "grammy";
import sql from "../db/db";

import { privateConfig } from "../config/private";
import { sendMessagePushNotification } from "../web-push";
import { getSenderColour } from "~/lib/messaging/sender";
import { getReviewTelegramDeliveryOutcome } from "~/lib/telegram/review-delivery";
import { getReviewQuestions, toReviewQuestionSetVersion } from "~/lib/reviews/questions";
import { UrlHelper } from "~/lib/url-helper";

export const bot = new Bot(privateConfig.telegram.token);

export function formatUserTelegramMessage({
  body,
  isConsecutiveCustomerMessage,
  replyBody,
  userName,
}: {
  body: string;
  isConsecutiveCustomerMessage: boolean;
  replyBody?: null | string;
  userName: string;
}) {
  const quotedReply = replyBody ? `↩ ${replyBody}\n\n` : "";
  const senderLabel = `${getSenderColour(userName).emoji} ${userName}`;
  return isConsecutiveCustomerMessage ? `${quotedReply}${body}` : `${senderLabel}\n\n${quotedReply}${body}`;
}

export async function sendQrScanTelegramNotification({
  contentId,
  contentType,
}: {
  contentId: string;
  contentType: "event" | "venue";
}) {
  const [content] = await sql<Array<{ name: string; telegram_chat_id: null | number }>>`
    SELECT ${contentType === "venue" ? sql`name` : sql`COALESCE(title_en, title_uk)`} AS name, telegram_chat_id
    FROM ${contentType === "venue" ? sql`venues` : sql`events`}
    WHERE id = ${contentId} AND telegram_user_id IS NOT NULL AND telegram_qr_notifications_enabled
  `;
  if (!content?.telegram_chat_id) return;
  await bot.api.sendMessage(content.telegram_chat_id, `📱 Your ${contentType} QR code was scanned: ${content.name}`);
}

const escapeTelegramHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");

export async function sendVenueReviewTelegramNotification({
  rating: _rating,
  reviewBody: _reviewBody,
  reviewerId,
  venueId,
}: {
  rating: number;
  reviewBody: string;
  reviewerId: string;
  venueId: string;
}) {
  const [venue] = await sql<Array<{ telegram_chat_id: null | number }>>`
    SELECT CASE
      WHEN v.telegram_user_id IS NOT NULL AND v.telegram_review_notifications_enabled THEN v.telegram_chat_id
      ELSE NULL
    END AS telegram_chat_id
    FROM venues v
    WHERE v.id = ${venueId}
  `;

  if (!venue?.telegram_chat_id) return;

  await sql`
    INSERT INTO review_telegram_deliveries (content_rating_id, telegram_chat_id)
    SELECT r.id, ${venue.telegram_chat_id}
    FROM content_ratings r
    WHERE r.user_id = ${reviewerId} AND r.venue_id = ${venueId}
    ON CONFLICT (content_rating_id) DO UPDATE SET
      telegram_chat_id = EXCLUDED.telegram_chat_id,
      status = 'PENDING',
      attempts = 0,
      next_attempt_at = NOW(),
      locked_at = NULL,
      last_error = NULL,
      delivered_at = NULL
  `;

  // Vercel Hobby cron runs infrequently. Try one queued delivery now while
  // retaining the durable queue for retries and the scheduled fallback.
  deliverPendingReviewTelegramNotifications(1).catch((error) => {
    console.error("Immediate Telegram review delivery failed:", error);
  });
}

export async function sendEventReviewTelegramNotification({
  eventId,
  reviewerId,
}: {
  eventId: string;
  reviewerId: string;
}) {
  const [event] = await sql<Array<{ telegram_chat_id: null | number }>>`
    SELECT COALESCE(
      CASE WHEN e.telegram_user_id IS NOT NULL AND e.telegram_review_notifications_enabled THEN e.telegram_chat_id END,
      CASE WHEN v.telegram_user_id IS NOT NULL AND v.telegram_review_notifications_enabled THEN v.telegram_chat_id END
    ) AS telegram_chat_id
    FROM events e LEFT JOIN venues v ON v.id = e.venue_id WHERE e.id = ${eventId}
  `;
  if (!event?.telegram_chat_id) return;
  await sql`INSERT INTO review_telegram_deliveries (content_rating_id, telegram_chat_id)
    SELECT id, ${event.telegram_chat_id} FROM content_ratings
    WHERE user_id = ${reviewerId} AND event_id = ${eventId}
    ON CONFLICT (content_rating_id) DO UPDATE SET
      telegram_chat_id = EXCLUDED.telegram_chat_id,
      status = 'PENDING',
      attempts = 0,
      next_attempt_at = NOW(),
      locked_at = NULL,
      last_error = NULL,
      delivered_at = NULL`;
  deliverPendingReviewTelegramNotifications(1).catch((error) =>
    console.error("Immediate Telegram event review delivery failed:", error),
  );
}

// Local polling uses the same bot token as the deployed webhook. It must be
// explicitly enabled so running the app locally can never disconnect production.
if (process.env.NODE_ENV === "development" && process.env.TELEGRAM_LOCAL_POLLING === "true") {
  bot.api
    .deleteWebhook()
    .then(() =>
      bot.start({
        onStart: () => {
          console.log("Telegram bot is polling for updates.");
        },
      }),
    )
    .catch((error) => {
      console.error("Telegram bot failed to start:", error);
    });
}

bot.command("start", async (ctx) => {
  const token = ctx.match;
  const chatId = ctx.chat.id;

  if (!token) {
    return ctx.reply("Welcome to Mandrii! To link your venue, please use the integration link on your dashboard.");
  }

  if (ctx.chat.type !== "private" || !ctx.from) {
    return ctx.reply("For privacy, link your venue from a private chat with Mandrii Bot.");
  }

  try {
    const [link] = await sql<{ event_id: null | string; venue_id: null | string }[]>`
      UPDATE telegram_link_tokens
      SET used_at = NOW()
      WHERE token = ${token}
        AND used_at IS NULL
        AND expires_at > NOW()
      RETURNING venue_id, event_id
    `;

    if (!link) {
      return ctx.reply(
        "This Telegram linking request is invalid or has expired. Please create a new one from your dashboard.",
      );
    }

    if (link.event_id) {
      await sql`UPDATE events SET telegram_chat_id = ${chatId}, telegram_user_id = ${ctx.from.id} WHERE id = ${link.event_id}`;
      await ctx.reply("Your event is now successfully linked! You will receive review notifications here. ✅");
    } else {
      await sql`UPDATE venues SET telegram_chat_id = ${chatId}, telegram_user_id = ${ctx.from.id} WHERE id = ${link.venue_id}`;
      await ctx.reply("Your venue is now successfully linked! You will receive customer messages here. ✅");
    }
  } catch (error) {
    console.error("Link error:", error);
    await ctx.reply("There was an issue linking your account. Please try again.");
  }
});

// Replaces /unsubscribe
bot.command("unlink", async (ctx) => {
  const chatId = ctx.chat.id;

  if (ctx.chat.type !== "private" || !ctx.from) {
    return ctx.reply("Open a private chat with Mandrii Bot to unlink your venue.");
  }

  await sql`
    WITH unlinked_venues AS (
      UPDATE venues
      SET telegram_chat_id = NULL, telegram_user_id = NULL, telegram_review_notifications_enabled = false, telegram_qr_notifications_enabled = false
      WHERE telegram_chat_id = ${chatId} AND telegram_user_id = ${ctx.from.id}
      RETURNING id
    ), unlinked_events AS (
      UPDATE events
      SET telegram_chat_id = NULL, telegram_user_id = NULL, telegram_review_notifications_enabled = false, telegram_qr_notifications_enabled = false
      WHERE telegram_chat_id = ${chatId} AND telegram_user_id = ${ctx.from.id}
      RETURNING id
    ), cancelled_deliveries AS (
      UPDATE telegram_message_deliveries delivery
      SET status = 'CANCELLED', locked_at = NULL
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE delivery.message_id = m.id
        AND c.venue_id IN (SELECT id FROM unlinked_venues)
        AND delivery.status IN ('PENDING', 'PROCESSING')
    )
    UPDATE telegram_link_tokens
    SET used_at = NOW()
    WHERE (venue_id IN (SELECT id FROM unlinked_venues) OR event_id IN (SELECT id FROM unlinked_events))
      AND used_at IS NULL
  `;

  await ctx.reply("Your linked venues and events have been unlinked.");
});

export async function sendUserMessageToVenue(
  conversationId: string,
  userText: string,
  userName: string,
  replyToMessageId?: string,
) {
  // 1. Get the business chat_id linked to this conversation
  const [conversation] = await sql<{ owner_id: string; telegram_chat_id: null | string }[]>`
    SELECT CASE WHEN b.telegram_user_id IS NOT NULL THEN b.telegram_chat_id ELSE NULL END AS telegram_chat_id,
           b.owner_id
    FROM conversations c
    JOIN venues b ON c.venue_id = b.id
    WHERE c.id = ${conversationId}
  `;

  if (!conversation) throw new Error("Conversation is not available.");

  const [message] = await sql<{ id: string }[]>`
    INSERT INTO messages (conversation_id, sender_type, body, reply_to_message_id)
    VALUES (${conversationId}, 'USER', ${userText}, ${replyToMessageId ?? null})
    RETURNING id
  `;

  await sql`
    UPDATE conversations
    SET owner_archived_at = NULL, user_archived_at = NULL
    WHERE id = ${conversationId}
  `;

  if (conversation.telegram_chat_id) await deliverPendingTelegramMessages({ messageId: message.id });

  await sendMessagePushNotification(conversationId, conversation.owner_id, userName, userText).catch((error) => {
    console.error("Web Push notification failed:", error);
  });
  return { success: true };
}

type TelegramDelivery = {
  attempts: number;
  id: string;
  message_id: string;
  telegram_chat_id: number;
};

const MAX_TELEGRAM_DELIVERY_ATTEMPTS = 8;

type ReviewTelegramDelivery = { attempts: number; id: string; telegram_chat_id: number };

export async function deliverPendingReviewTelegramNotifications(limit = 10) {
  const deliveries = await sql.begin(
    (transaction) => transaction<ReviewTelegramDelivery[]>`
    WITH due AS (
      SELECT id FROM review_telegram_deliveries
      WHERE (status = 'PENDING' AND next_attempt_at <= NOW())
         OR (status = 'PROCESSING' AND locked_at < NOW() - INTERVAL '10 minutes')
      ORDER BY next_attempt_at, created_at LIMIT ${limit} FOR UPDATE SKIP LOCKED
    )
    UPDATE review_telegram_deliveries d SET status = 'PROCESSING', locked_at = NOW(), attempts = d.attempts + 1
    FROM due WHERE d.id = due.id
    RETURNING d.id, d.telegram_chat_id, d.attempts
  `,
  );
  await Promise.all(deliveries.map(deliverReviewTelegramNotification));
  return deliveries.length;
}

async function deliverReviewTelegramNotification(delivery: ReviewTelegramDelivery) {
  try {
    const [review] = await sql<
      Array<{
        aspect_ratings: Record<string, number>;
        body: string;
        content_context: string;
        content_name: string;
        content_slug: string;
        content_type: "event" | "venue";
        question_set: number;
        rating: number;
        reviewer: null | string;
      }>
    >`
      SELECT r.review_body AS body, r.rating, r.aspect_ratings, r.review_question_set AS question_set, u.name AS reviewer,
             COALESCE(v.name, e.title_en, e.title_uk, 'your content') AS content_name,
             COALESCE(v.category, e.type) AS content_context,
             COALESCE(v.slug, e.slug) AS content_slug,
             CASE WHEN r.venue_id IS NULL THEN 'event' ELSE 'venue' END AS content_type
      FROM review_telegram_deliveries d JOIN content_ratings r ON r.id = d.content_rating_id
      LEFT JOIN venues v ON v.id = r.venue_id
      LEFT JOIN events e ON e.id = r.event_id
      LEFT JOIN users u ON u.id = r.user_id
      WHERE d.id = ${delivery.id} AND r.review_status = 'PUBLISHED' AND d.telegram_chat_id = ${delivery.telegram_chat_id}
    `;
    if (!review) throw new Error("Review notification is no longer deliverable");
    const aspectRatings = getReviewQuestions(
      review.content_type,
      review.content_context,
      toReviewQuestionSetVersion(review.question_set),
    )
      .map((question) => {
        const rating = review.aspect_ratings[question.key];
        return rating ? `• ${escapeTelegramHtml(question.label)}: <b>${rating}/5</b>` : null;
      })
      .filter(Boolean)
      .join("\n");
    const reviewUrl = UrlHelper.buildUrl(`/${review.content_type}s/${review.content_slug}#Reviews`);
    await bot.api.sendMessage(
      delivery.telegram_chat_id,
      `<b>⭐ New ${review.rating}/5 review</b> for <b>${escapeTelegramHtml(review.content_name)}</b>\n\n` +
        `<b>${escapeTelegramHtml(review.reviewer || "A community member")}</b>\n` +
        `${escapeTelegramHtml(review.body.replace(/\s+/g, " ").slice(0, 280))}` +
        (aspectRatings ? `\n\n<b>Ratings</b>\n${aspectRatings}` : ""),
      {
        link_preview_options: { is_disabled: true },
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: [[{ text: "Open review", url: reviewUrl }]] },
      },
    );
    await sql`UPDATE review_telegram_deliveries SET status = ${getReviewTelegramDeliveryOutcome(delivery.attempts).status}, delivered_at = NOW(), locked_at = NULL, last_error = NULL WHERE id = ${delivery.id}`;
  } catch (error: any) {
    const outcome = getReviewTelegramDeliveryOutcome(delivery.attempts, true);
    await sql`UPDATE review_telegram_deliveries SET status = ${outcome.status}, locked_at = NULL, last_error = ${String(error?.description ?? error?.message ?? "Telegram delivery failed").slice(0, 1000)}, next_attempt_at = NOW() + (${outcome.delaySeconds} * INTERVAL '1 second') WHERE id = ${delivery.id}`;
    captureException(error, {
      tags: { integration: "telegram", operation: "review_delivery", terminal: String(outcome.status === "FAILED") },
    });
  }
}

export async function deliverPendingTelegramMessages({
  limit = 25,
  messageId,
}: { limit?: number; messageId?: string } = {}) {
  const deliveries = await sql.begin(
    async (transaction) =>
      transaction<TelegramDelivery[]>`
      WITH due_deliveries AS (
        SELECT id
        FROM telegram_message_deliveries
        WHERE (
          (status = 'PENDING' AND next_attempt_at <= NOW())
          OR (status = 'PROCESSING' AND locked_at < NOW() - INTERVAL '10 minutes')
        )
        ${messageId ? sql`AND message_id = ${messageId}` : sql``}
        ORDER BY next_attempt_at, created_at
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      UPDATE telegram_message_deliveries delivery
      SET status = 'PROCESSING', locked_at = NOW(), attempts = delivery.attempts + 1
      FROM due_deliveries
      WHERE delivery.id = due_deliveries.id
      RETURNING delivery.id, delivery.message_id, delivery.telegram_chat_id, delivery.attempts
    `,
  );

  await Promise.all(deliveries.map(deliverTelegramMessage));
  return deliveries.length;
}

async function deliverTelegramMessage(delivery: TelegramDelivery) {
  const [message] = await sql<
    Array<{
      body: string;
      conversation_id: string;
      created_at: string;
      reply_to_message_id: null | string;
      telegram_chat_id: null | number;
      user_name: null | string;
    }>
  >`
    SELECT m.body, m.conversation_id, m.created_at, m.reply_to_message_id,
           v.telegram_chat_id, u.name AS user_name
    FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    JOIN venues v ON v.id = c.venue_id
    JOIN users u ON u.id = c.user_id
    WHERE m.id = ${delivery.message_id}
      AND m.sender_type = 'USER'
      AND m.deleted_at IS NULL
      AND v.telegram_chat_id = ${delivery.telegram_chat_id}
  `;

  if (!message) {
    await sql`
      UPDATE telegram_message_deliveries
      SET status = 'CANCELLED', locked_at = NULL
      WHERE id = ${delivery.id}
    `;
    return;
  }

  try {
    const [previousMessage] = await sql<
      Array<{
        conversation_id: string;
        created_at: string;
        sender_type: "USER" | "VENUE";
        telegram_message_id: null | number;
      }>
    >`
      SELECT conversation_id, created_at, sender_type, telegram_message_id
      FROM messages
      WHERE telegram_chat_id = ${delivery.telegram_chat_id}
        AND id <> ${delivery.message_id}
        AND deleted_at IS NULL
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    `;
    const [replyToMessage] = message.reply_to_message_id
      ? await sql<{ body: string; telegram_message_id: null | number }[]>`
          SELECT body, telegram_message_id
          FROM messages
          WHERE id = ${message.reply_to_message_id} AND deleted_at IS NULL
        `
      : [];
    const isConsecutiveCustomerMessage =
      previousMessage?.sender_type === "USER" &&
      previousMessage.conversation_id === message.conversation_id &&
      previousMessage.telegram_message_id != null &&
      new Date(message.created_at).getTime() - new Date(previousMessage.created_at).getTime() < 5 * 60 * 1_000;
    const telegramResponse = await bot.api.sendMessage(
      delivery.telegram_chat_id,
      formatUserTelegramMessage({
        body: message.body,
        isConsecutiveCustomerMessage,
        replyBody: replyToMessage?.body,
        userName: message.user_name || "Customer",
      }),
      {
        reply_parameters: replyToMessage?.telegram_message_id
          ? { message_id: replyToMessage.telegram_message_id }
          : undefined,
      },
    );

    await sql.begin(async (transaction) => {
      await transaction`
        UPDATE messages
        SET telegram_chat_id = ${delivery.telegram_chat_id},
            telegram_message_id = ${telegramResponse.message_id},
            telegram_delivered_at = NOW()
        WHERE id = ${delivery.message_id}
      `;
      await transaction`
        UPDATE telegram_message_deliveries
        SET status = 'DELIVERED', delivered_at = NOW(), locked_at = NULL, last_error = NULL
        WHERE id = ${delivery.id}
      `;
    });
  } catch (error: any) {
    const errorMessage = String(error?.description ?? error?.message ?? "Telegram delivery failed").slice(0, 1_000);
    const terminal = delivery.attempts >= MAX_TELEGRAM_DELIVERY_ATTEMPTS;
    const retryDelaySeconds = Math.min(60 * 60, 2 ** Math.min(delivery.attempts, 11));
    await sql`
      UPDATE telegram_message_deliveries
      SET status = ${terminal ? "FAILED" : "PENDING"},
          locked_at = NULL,
          last_error = ${errorMessage},
          next_attempt_at = NOW() + (${retryDelaySeconds} * INTERVAL '1 second')
      WHERE id = ${delivery.id}
    `;
    captureException(error, { tags: { integration: "telegram", operation: "message_delivery" } });
  }
}

// Listen for incoming text messages on Telegram
bot.on("message:text", async (ctx) => {
  const replyToMessage = ctx.message.reply_to_message;

  // Ignore standard messages; we only care about replies to bot messages
  if (!replyToMessage) return;

  const originalTelegramMessageId = replyToMessage.message_id;
  const replyText = ctx.message.text;

  try {
    // 1. Find which conversation this reply belongs to using the original message_id
    const [originalMessage] = await sql<{ conversation_id: string; id: string; user_id: string }[]>`
      SELECT m.id, m.conversation_id, c.user_id
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      JOIN venues v ON v.id = c.venue_id
      WHERE m.telegram_chat_id = ${ctx.chat.id} AND m.telegram_message_id = ${originalTelegramMessageId}
        AND m.deleted_at IS NULL
        AND v.telegram_chat_id = ${ctx.chat.id}
        AND v.telegram_user_id = ${ctx.from.id}
    `;

    if (originalMessage) {
      const [message] = await sql`
        INSERT INTO messages (conversation_id, sender_type, body, reply_to_message_id, telegram_chat_id, telegram_message_id)
        VALUES (
          ${originalMessage.conversation_id},
          'VENUE',
          ${replyText},
          ${originalMessage.id},
          ${ctx.chat.id},
          ${ctx.message.message_id}
        )
        ON CONFLICT (telegram_chat_id, telegram_message_id)
          WHERE telegram_chat_id IS NOT NULL AND telegram_message_id IS NOT NULL
          DO NOTHING
        RETURNING id
      `;

      if (message) {
        await sql`
          UPDATE conversations
          SET owner_archived_at = NULL, user_archived_at = NULL
          WHERE id = ${originalMessage.conversation_id}
        `;
        await sendMessagePushNotification(
          originalMessage.conversation_id,
          originalMessage.user_id,
          "Venue",
          replyText,
        ).catch((error) => {
          console.error("Web Push notification failed:", error);
        });
      }
    }
  } catch (error) {
    console.error("Routing error:", error);
    await ctx.reply("Failed to route message back to the user.");
  }
});

// Telegram emits edits as a distinct update type. Only update messages that
// were originally written by the venue in Telegram; bot-sent customer
// forwards remain the source of truth for web-originated customer messages.
bot.on("edited_message:text", async (ctx) => {
  try {
    await sql`
      UPDATE messages m
      SET body = ${ctx.editedMessage.text}, edited_at = NOW(), edited_by_user_id = NULL
      FROM conversations c
      JOIN venues v ON v.id = c.venue_id
      WHERE m.conversation_id = c.id
        AND m.telegram_chat_id = ${ctx.chat.id}
        AND m.telegram_message_id = ${ctx.editedMessage.message_id}
        AND m.sender_type = 'VENUE'
        AND m.telegram_delivered_at IS NULL
        AND m.deleted_at IS NULL
        AND m.body IS DISTINCT FROM ${ctx.editedMessage.text}
        AND v.telegram_chat_id = ${ctx.chat.id}
        AND v.telegram_user_id = ${ctx.from?.id ?? null}
    `;
  } catch (error) {
    console.error("Telegram message edit routing failed:", error);
  }
});

bot.catch((error) => {
  console.error("Telegram bot error:", error.error);
});
