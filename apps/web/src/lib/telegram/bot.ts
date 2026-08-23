import { captureException } from "@sentry/nextjs";
import { Bot } from "grammy";
import sql from "../db/db";

import { privateConfig } from "../config/private";
import { sendMessagePushNotification } from "../web-push";
import { getSenderColour } from "~/lib/messaging/sender";

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
    const [link] = await sql<{ venue_id: string }[]>`
      UPDATE telegram_link_tokens
      SET used_at = NOW()
      WHERE token = ${token}
        AND used_at IS NULL
        AND expires_at > NOW()
      RETURNING venue_id
    `;

    if (!link) {
      return ctx.reply(
        "This Telegram linking request is invalid or has expired. Please create a new one from your dashboard.",
      );
    }

    await sql`
      UPDATE venues
      SET telegram_chat_id = ${chatId}, telegram_user_id = ${ctx.from.id}
      WHERE id = ${link.venue_id}
    `;

    await ctx.reply("Your venue is now successfully linked! You will receive customer messages here. ✅");
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
      SET telegram_chat_id = NULL, telegram_user_id = NULL
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
    WHERE venue_id IN (SELECT id FROM unlinked_venues)
      AND used_at IS NULL
  `;

  await ctx.reply("Your venue has been unlinked. You will no longer receive customer messages.");
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
