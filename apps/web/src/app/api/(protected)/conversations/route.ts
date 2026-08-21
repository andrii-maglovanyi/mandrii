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
import { sendUserMessageToVenue } from "~/lib/telegram/bot";

export const dynamic = "force-dynamic";

const startConversationSchema = z.object({
  body: z.string().trim().min(1).max(4096),
  replyToMessageId: z.uuid().optional(),
  venueId: z.uuid(),
});

const getMessagingVenue = async (venueId: string) => {
  const [venue] = await sql<{ owner_id: null | string; telegram_chat_id: null | string }[]>`
    SELECT owner_id, telegram_chat_id FROM venues WHERE id = ${venueId}
  `;
  if (!venue?.owner_id) throw new ForbiddenError("Messaging is not available for this venue");
  return venue;
};

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.messagingRead.check(session.user.id);
    const venueId = new URL(req.url).searchParams.get("venueId");
    if (!venueId || !z.uuid().safeParse(venueId).success) throw new BadRequestError("A valid venue ID is required");

    const venue = await getMessagingVenue(venueId);
    const owner = venue.owner_id === session.user.id;
    const conversations = owner
      ? await sql`
          SELECT c.id, c.created_at, u.name AS user_name,
                 latest_message.created_at AS last_message_at,
                 unread_messages.unread_count
          FROM conversations c
          JOIN users u ON u.id = c.user_id
          LEFT JOIN LATERAL (
            SELECT m.created_at
            FROM messages m
            WHERE m.conversation_id = c.id
            ORDER BY m.created_at DESC, m.id DESC
            LIMIT 1
          ) AS latest_message ON TRUE
          CROSS JOIN LATERAL (
            SELECT COUNT(*) AS unread_count
            FROM messages m
            WHERE m.conversation_id = c.id
              AND m.sender_type = 'USER'
              AND m.created_at > COALESCE(c.owner_last_read_at, c.created_at)
          ) AS unread_messages
          WHERE c.venue_id = ${venueId}
          ORDER BY latest_message.created_at DESC NULLS LAST, c.created_at DESC
        `
      : await sql`
          SELECT c.id, c.created_at, u.name AS user_name,
                 latest_message.created_at AS last_message_at,
                 unread_messages.unread_count
          FROM conversations c
          JOIN users u ON u.id = c.user_id
          LEFT JOIN LATERAL (
            SELECT m.created_at
            FROM messages m
            WHERE m.conversation_id = c.id
            ORDER BY m.created_at DESC, m.id DESC
            LIMIT 1
          ) AS latest_message ON TRUE
          CROSS JOIN LATERAL (
            SELECT COUNT(*) AS unread_count
            FROM messages m
            WHERE m.conversation_id = c.id
              AND m.sender_type = 'VENUE'
              AND m.created_at > COALESCE(c.user_last_read_at, c.created_at)
          ) AS unread_messages
          WHERE c.venue_id = ${venueId} AND c.user_id = ${session.user.id}
          ORDER BY latest_message.created_at DESC NULLS LAST, c.created_at DESC
        `;

    return Response.json({
      conversations,
      role: owner ? "OWNER" : "USER",
      telegramLinked: Boolean(venue?.telegram_chat_id),
    });
  });

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    const { body, replyToMessageId, venueId } = await validateRequest(req, startConversationSchema);

    const venue = await getMessagingVenue(venueId);
    if (venue.owner_id === session.user.id) {
      throw new BadRequestError("Venue owners must reply from an existing conversation");
    }

    const [conversation] = await sql<{ id: string }[]>`
      WITH locked AS (
        SELECT pg_advisory_xact_lock(hashtext(${venueId}), hashtext(${session.user.id}))
      ), existing AS (
        SELECT c.id FROM conversations c, locked
        WHERE c.venue_id = ${venueId} AND c.user_id = ${session.user.id}
        ORDER BY c.created_at DESC
        LIMIT 1
      ), inserted AS (
        INSERT INTO conversations (venue_id, user_id)
        SELECT ${venueId}, ${session.user.id} FROM locked
        WHERE NOT EXISTS (SELECT 1 FROM existing)
        RETURNING id
      )
      SELECT id FROM inserted UNION ALL SELECT id FROM existing LIMIT 1
    `;

    if (replyToMessageId) {
      const [replyToMessage] = await sql<{ id: string }[]>`
        SELECT id FROM messages WHERE id = ${replyToMessageId} AND conversation_id = ${conversation.id}
      `;
      if (!replyToMessage)
        throw new BadRequestError("The message being replied to does not belong to this conversation");
    }

    await sendUserMessageToVenue(conversation.id, body, session.user.name || "Customer", replyToMessageId);
    return Response.json({ conversationId: conversation.id }, { status: 201 });
  });
