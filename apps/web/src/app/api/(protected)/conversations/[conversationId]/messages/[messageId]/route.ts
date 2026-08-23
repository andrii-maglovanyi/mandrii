import { z } from "zod";

import { BadRequestError, ForbiddenError, getApiContext, rateLimiters, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";
import { getConversationForUser } from "~/lib/messaging/conversation-access";
import { bot, formatUserTelegramMessage } from "~/lib/telegram/bot";

export const dynamic = "force-dynamic";

const editMessageSchema = z.object({ body: z.string().trim().min(1).max(4096) });

export const PATCH = (req: Request, { params }: { params: Promise<{ conversationId: string; messageId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    const { conversationId, messageId } = await params;
    const { body } = editMessageSchema.parse(await req.json());

    if (!z.uuid().safeParse(conversationId).success || !z.uuid().safeParse(messageId).success) {
      throw new BadRequestError("A valid conversation and message ID are required");
    }

    const conversation = await getConversationForUser(conversationId, session.user.id);
    const senderType = conversation.is_owner ? "VENUE" : "USER";
    const [message] = await sql<
      Array<{
        body: string;
        created_at: string;
        edited_at: null | string;
        id: string;
        reply_to_body: null | string;
        sender_type: "USER" | "VENUE";
        telegram_chat_id: null | number;
        telegram_delivered_at: null | string;
        telegram_message_id: null | number;
        user_name: null | string;
      }>
    >`
      SELECT m.id, m.body, m.created_at, m.edited_at, m.sender_type, m.telegram_chat_id,
             m.telegram_message_id, m.telegram_delivered_at,
             parent.body AS reply_to_body, u.name AS user_name
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      JOIN users u ON u.id = c.user_id
      LEFT JOIN messages parent ON parent.id = m.reply_to_message_id AND parent.deleted_at IS NULL
      WHERE m.id = ${messageId}
        AND m.conversation_id = ${conversationId}
        AND m.sender_type = ${senderType}
        AND m.deleted_at IS NULL
    `;
    if (!message) throw new ForbiddenError("You can only edit your own active messages");

    // Telegram only lets a bot edit messages it originally sent. Incoming
    // messages from a venue owner must remain editable in Telegram itself.
    if (message.telegram_message_id && !message.telegram_delivered_at) {
      throw new BadRequestError("Messages sent from Telegram must be edited in Telegram");
    }

    if (message.body === body) return Response.json({ message });

    if (message.telegram_chat_id && message.telegram_message_id && message.telegram_delivered_at) {
      const [previousMessage] = await sql<
        Array<{ conversation_id: string; created_at: string; sender_type: "USER" | "VENUE"; telegram_message_id: null | number }>
      >`
        SELECT conversation_id, created_at, sender_type, telegram_message_id
        FROM messages
        WHERE telegram_chat_id = ${message.telegram_chat_id}
          AND deleted_at IS NULL
          AND (created_at, id) < (${message.created_at}, ${message.id})
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `;
      const isConsecutiveCustomerMessage =
        previousMessage?.sender_type === "USER" &&
        previousMessage.conversation_id === conversationId &&
        previousMessage.telegram_message_id != null &&
        new Date(message.created_at).getTime() - new Date(previousMessage.created_at).getTime() < 5 * 60 * 1_000;

      await bot.api.editMessageText(
        message.telegram_chat_id,
        message.telegram_message_id,
        formatUserTelegramMessage({
          body,
          isConsecutiveCustomerMessage,
          replyBody: message.reply_to_body,
          userName: message.user_name || "Customer",
        }),
      );
    }

    const [editedMessage] = await sql<Array<{ body: string; edited_at: string; id: string }>>`
      UPDATE messages
      SET body = ${body}, edited_at = NOW(), edited_by_user_id = ${session.user.id}
      WHERE id = ${messageId}
      RETURNING id, body, edited_at
    `;
    return Response.json({ message: editedMessage });
  });

export const DELETE = (req: Request, { params }: { params: Promise<{ conversationId: string; messageId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    const { conversationId, messageId } = await params;

    if (!z.uuid().safeParse(conversationId).success) {
      throw new BadRequestError("A valid conversation ID is required");
    }
    if (!z.uuid().safeParse(messageId).success) {
      throw new BadRequestError("A valid message ID is required");
    }

    const conversation = await getConversationForUser(conversationId, session.user.id);

    const senderType = conversation.is_owner ? "VENUE" : "USER";
    const [message] = await sql<Array<{ deleted_at: string; id: string }>>`
      WITH deleted_message AS (
        UPDATE messages
        SET deleted_at = NOW(), deleted_by_user_id = ${session.user.id}
        WHERE id = ${messageId}
          AND conversation_id = ${conversationId}
          AND sender_type = ${senderType}
          AND deleted_at IS NULL
        RETURNING id, deleted_at
      ), deleted_reactions AS (
        DELETE FROM message_reactions r
        USING deleted_message
        WHERE r.message_id = deleted_message.id
      )
      SELECT id, deleted_at FROM deleted_message
    `;
    if (!message) {
      throw new ForbiddenError("You can only delete your own active messages");
    }

    return Response.json({ message });
  });
