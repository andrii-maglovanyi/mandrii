import { z } from "zod";

import { BadRequestError, ForbiddenError, getApiContext, rateLimiters, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";
import { getConversationForUser } from "~/lib/messaging/conversation-access";

export const dynamic = "force-dynamic";

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
