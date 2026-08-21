import { z } from "zod";

import {
  BadRequestError,
  ForbiddenError,
  getApiContext,
  rateLimiters,
  validateRequest,
  withErrorHandling,
} from "~/lib/api";
import sql from "~/lib/db/db";
import { MESSAGE_REACTION_EMOJIS } from "~/lib/messaging/constants";

const schema = z.object({ emoji: z.enum(MESSAGE_REACTION_EMOJIS) });

export const POST = (req: Request, { params }: { params: Promise<{ conversationId: string; messageId: string }> }) =>
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
    const { emoji } = await validateRequest(req, schema);
    const [message] = await sql<{ id: string }[]>`
      SELECT m.id FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      JOIN venues v ON v.id = c.venue_id
      WHERE m.id = ${messageId} AND c.id = ${conversationId}
        AND v.owner_id IS NOT NULL
        AND (c.user_id = ${session.user.id} OR v.owner_id = ${session.user.id})
    `;

    if (!message) {
      throw new ForbiddenError("You do not have access to this message");
    }

    const reactionLockKey = `${session.user.id}:${emoji}`;

    const [result] = await sql<{ active: boolean }[]>`
      WITH locked AS (
        SELECT pg_advisory_xact_lock(hashtext(${messageId}), hashtext(${reactionLockKey}))
      ), del AS (
        DELETE FROM message_reactions
        USING locked
        WHERE message_id = ${messageId} AND user_id = ${session.user.id} AND emoji = ${emoji}
        RETURNING 1
      ), ins AS (
        INSERT INTO message_reactions (message_id, user_id, emoji)
        SELECT ${messageId}, ${session.user.id}, ${emoji}
        WHERE NOT EXISTS (SELECT 1 FROM del)
        ON CONFLICT (message_id, user_id, emoji) DO NOTHING
        RETURNING 1
      )
      SELECT EXISTS (SELECT 1 FROM ins) AS active
    `;

    return Response.json({ active: Boolean(result?.active), emoji });
  });
