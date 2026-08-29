import { after } from "next/server";
import { z } from "zod";

import { BadRequestError, getApiContext, rateLimiters, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";
import { getConversationForUser } from "~/lib/messaging/conversation-access";
import { deliverPendingTelegramMessages } from "~/lib/telegram/bot";

export const dynamic = "force-dynamic";

export const POST = (req: Request, { params }: { params: Promise<{ conversationId: string; messageId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.messagingAction.check(session.user.id);
    const { conversationId, messageId } = await params;

    if (!z.uuid().safeParse(conversationId).success || !z.uuid().safeParse(messageId).success) {
      throw new BadRequestError("A valid conversation and message ID are required");
    }

    const conversation = await getConversationForUser(conversationId, session.user.id);
    if (conversation.is_owner) throw new BadRequestError("Only the customer can retry this Telegram delivery");

    const [delivery] = await sql<Array<{ id: string }>>`
      INSERT INTO telegram_message_deliveries (message_id, telegram_chat_id, status, attempts, next_attempt_at, locked_at, last_error)
      SELECT m.id, v.telegram_chat_id, 'PENDING', 0, NOW(), NULL, NULL
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      JOIN venues v ON v.id = c.venue_id
      WHERE m.id = ${messageId}
        AND m.conversation_id = ${conversationId}
        AND m.sender_type = 'USER'
        AND m.deleted_at IS NULL
        AND v.telegram_chat_id IS NOT NULL
        AND v.telegram_message_notifications_enabled
      ON CONFLICT (message_id) DO UPDATE
      SET status = 'PENDING', attempts = 0, next_attempt_at = NOW(), locked_at = NULL, last_error = NULL,
          telegram_chat_id = EXCLUDED.telegram_chat_id
      RETURNING id
    `;
    if (!delivery) throw new BadRequestError("Telegram delivery cannot be retried for this message");

    after(() =>
      deliverPendingTelegramMessages({ limit: 1, messageId }).catch((error) => {
        console.error("Manual Telegram delivery retry failed:", error);
      }),
    );
    return Response.json({ queued: true });
  });
