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
import { sendMessagePushNotification } from "~/lib/web-push";

export const dynamic = "force-dynamic";

const messageSchema = z.object({
  body: z.string().trim().min(1).max(4096),
  replyToMessageId: z.uuid().optional(),
});

const messagePageSchema = z.object({
  before: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const messageCursorSchema = z.object({ createdAt: z.string().datetime({ offset: true }), id: z.uuid() });

type MessageReaction = { count: string; emoji: string; message_id: string; reacted: boolean };

function decodeMessageCursor(cursor: string | undefined) {
  if (!cursor) return null;

  try {
    return messageCursorSchema.parse(JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")));
  } catch {
    throw new BadRequestError("An invalid message cursor was provided");
  }
}

function encodeMessageCursor(message: { created_at: string; id: string }) {
  return Buffer.from(JSON.stringify({ createdAt: message.created_at, id: message.id })).toString("base64url");
}

async function getConversationForUser(conversationId: string, userId: string) {
  if (!z.uuid().safeParse(conversationId).success) {
    throw new BadRequestError("A valid conversation ID is required");
  }
  const [conversation] = await sql<{ id: string; is_owner: boolean; user_id: string; venue_id: string }[]>`
    SELECT c.id, c.venue_id, c.user_id, (v.owner_id = ${userId}) AS is_owner
    FROM conversations c JOIN venues v ON v.id = c.venue_id
    WHERE c.id = ${conversationId} AND v.owner_id IS NOT NULL
      AND (c.user_id = ${userId} OR v.owner_id = ${userId})
  `;
  if (!conversation) throw new ForbiddenError("You do not have access to this conversation");
  return conversation;
}

export const GET = (req: Request, { params }: { params: Promise<{ conversationId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    const { conversationId } = await params;
    const conversation = await getConversationForUser(conversationId, session.user.id);
    const url = new URL(req.url);
    const { before, limit } = messagePageSchema.parse({
      before: url.searchParams.get("before") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });
    const cursor = decodeMessageCursor(before);

    if (conversation.is_owner) {
      await sql`
        UPDATE conversations c
        SET owner_last_read_at = NOW()
        WHERE c.id = ${conversationId}
          AND EXISTS (
            SELECT 1 FROM messages m
            WHERE m.conversation_id = c.id
              AND m.sender_type = 'USER'
              AND m.created_at > COALESCE(c.owner_last_read_at, c.created_at)
          )
      `;
    } else {
      await sql`
        UPDATE conversations c
        SET user_last_read_at = NOW()
        WHERE c.id = ${conversationId}
          AND EXISTS (
            SELECT 1 FROM messages m
            WHERE m.conversation_id = c.id
              AND m.sender_type = 'VENUE'
              AND m.created_at > COALESCE(c.user_last_read_at, c.created_at)
          )
      `;
    }

    const messageRows = await sql<
      Array<{
        body: string;
        created_at: string;
        id: string;
        reply_to_body: null | string;
        reply_to_message_id: null | string;
        reply_to_sender_type: null | "USER" | "VENUE";
        sender_type: "USER" | "VENUE";
        telegram_delivered_at: null | string;
      }>
    >`
      SELECT m.id, m.body, m.sender_type, m.created_at, m.reply_to_message_id, m.telegram_delivered_at,
             parent.body AS reply_to_body, parent.sender_type AS reply_to_sender_type
      FROM messages m LEFT JOIN messages parent ON parent.id = m.reply_to_message_id
      WHERE m.conversation_id = ${conversationId}
        ${cursor ? sql`AND (m.created_at, m.id) < (${cursor.createdAt}, ${cursor.id})` : sql``}
      ORDER BY m.created_at DESC, m.id DESC
      LIMIT ${limit + 1}
    `;
    const hasMore = messageRows.length > limit;
    const newestFirstMessages = hasMore ? messageRows.slice(0, limit) : messageRows;
    const messageIds = newestFirstMessages.map((message) => message.id);
    const reactions = messageIds.length
      ? await sql<MessageReaction[]>`
          SELECT r.message_id, r.emoji, COUNT(*) AS count, BOOL_OR(r.user_id = ${session.user.id}) AS reacted
          FROM message_reactions r
          WHERE r.message_id IN ${sql(messageIds)}
          GROUP BY r.message_id, r.emoji
        `
      : [];
    const reactionsByMessageId = new Map<string, MessageReaction[]>();
    reactions.forEach((reaction) => {
      const messageReactions = reactionsByMessageId.get(reaction.message_id);
      if (messageReactions) {
        messageReactions.push(reaction);
      } else {
        reactionsByMessageId.set(reaction.message_id, [reaction]);
      }
    });
    const messages = newestFirstMessages
      .reverse()
      .map((message) => ({ ...message, reactions: reactionsByMessageId.get(message.id) ?? [] }));
    const oldestMessage = messages[0];

    return Response.json({
      hasMore,
      messages,
      nextCursor: hasMore && oldestMessage ? encodeMessageCursor(oldestMessage) : null,
    });
  });

export const POST = (req: Request, { params }: { params: Promise<{ conversationId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    const { conversationId } = await params;
    const { body, replyToMessageId } = await validateRequest(req, messageSchema);
    const conversation = await getConversationForUser(conversationId, session.user.id);

    if (!conversation.is_owner) throw new ForbiddenError("Only the venue owner can reply from the venue");

    if (replyToMessageId) {
      const [replyToMessage] = await sql<{ id: string }[]>`
        SELECT id FROM messages WHERE id = ${replyToMessageId} AND conversation_id = ${conversationId}
      `;
      if (!replyToMessage)
        throw new BadRequestError("The message being replied to does not belong to this conversation");
    }

    const [message] = await sql`
      INSERT INTO messages (conversation_id, sender_type, body, reply_to_message_id)
      VALUES (${conversationId}, 'VENUE', ${body}, ${replyToMessageId ?? null}) RETURNING id, body, sender_type, created_at, reply_to_message_id
    `;

    await sendMessagePushNotification(conversationId, conversation.user_id, session.user.name || "Venue").catch(
      (error) => {
        console.error("Web Push notification failed:", error);
      },
    );

    return Response.json({ message }, { status: 201 });
  });
