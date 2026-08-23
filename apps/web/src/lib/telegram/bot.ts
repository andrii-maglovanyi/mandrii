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
      SET telegram_chat_id = ${chatId}
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

  await sql`
    UPDATE venues
    SET telegram_chat_id = NULL
    WHERE telegram_chat_id = ${chatId}
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
    SELECT b.telegram_chat_id, b.owner_id
    FROM conversations c
    JOIN venues b ON c.venue_id = b.id
    WHERE c.id = ${conversationId}
  `;

  if (!conversation) throw new Error("Conversation is not available.");

  const [previousMessage] = conversation.telegram_chat_id
    ? await sql<
        Array<{
          conversation_id: string;
          created_at: string;
          sender_type: "USER" | "VENUE";
          telegram_message_id: null | number;
        }>
      >`
        SELECT conversation_id, sender_type, created_at, telegram_message_id
        FROM messages
        WHERE telegram_chat_id = ${conversation.telegram_chat_id}
          AND deleted_at IS NULL
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `
    : [];

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

  if (conversation.telegram_chat_id) {
    try {
      const [replyToMessage] = replyToMessageId
        ? await sql<{ body: string; telegram_message_id: null | number }[]>`
          SELECT body, telegram_message_id FROM messages WHERE id = ${replyToMessageId} AND deleted_at IS NULL
        `
        : [];
      const isConsecutiveCustomerMessage =
        previousMessage?.sender_type === "USER" &&
        previousMessage.conversation_id === conversationId &&
        previousMessage.telegram_message_id != null &&
        Date.now() - new Date(previousMessage.created_at).getTime() < 5 * 60 * 1_000;
      const formattedMessage = formatUserTelegramMessage({
        body: userText,
        isConsecutiveCustomerMessage,
        replyBody: replyToMessage?.body,
        userName,
      });
      const telegramResponse = await bot.api.sendMessage(conversation.telegram_chat_id, formattedMessage, {
        reply_parameters: replyToMessage?.telegram_message_id
          ? { message_id: replyToMessage.telegram_message_id }
          : undefined,
      });

      await sql`
      UPDATE messages
      SET
        telegram_chat_id = ${conversation.telegram_chat_id},
        telegram_message_id = ${telegramResponse.message_id},
        telegram_delivered_at = NOW()
      WHERE id = ${message.id}
    `;
    } catch (error: any) {
      if (error.description?.includes("bot was blocked by the user")) {
        await sql`UPDATE venues SET telegram_chat_id = NULL WHERE telegram_chat_id = ${conversation.telegram_chat_id}`;
      }
      console.error("Telegram delivery failed for a persisted web message:", error);
    }
  }

  await sendMessagePushNotification(conversationId, conversation.owner_id, userName, userText).catch((error) => {
    console.error("Web Push notification failed:", error);
  });
  return { success: true };
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
    const [originalMessage] = await sql<{ conversation_id: string; user_id: string }[]>`
      SELECT m.conversation_id, c.user_id
      FROM messages m JOIN conversations c ON c.id = m.conversation_id
      WHERE m.telegram_chat_id = ${ctx.chat.id} AND m.telegram_message_id = ${originalTelegramMessageId}
        AND m.deleted_at IS NULL
    `;

    if (originalMessage) {
      const [message] = await sql`
        INSERT INTO messages (conversation_id, sender_type, body, telegram_chat_id, telegram_message_id)
        VALUES (${originalMessage.conversation_id}, 'VENUE', ${replyText}, ${ctx.chat.id}, ${ctx.message.message_id})
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

bot.catch((error) => {
  console.error("Telegram bot error:", error.error);
});
