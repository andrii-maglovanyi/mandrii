import { z } from "zod";

import { ForbiddenError, getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";

const schema = z.union([z.object({ venueId: z.uuid() }), z.object({ eventId: z.uuid() })]);

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.telegramLink.check(session.user.id);
    const data = await validateRequest(req, schema);
    const target =
      "venueId" in data ? { id: data.venueId, type: "venue" as const } : { id: data.eventId, type: "event" as const };

    if (target.type === "event") {
      const [result] = await sql<Array<{ owned: boolean }>>`
        WITH owned_event AS (
          SELECT id FROM events WHERE id = ${target.id} AND owner_id = ${session.user.id}
        ), unlinked_event AS (
          UPDATE events
          SET telegram_chat_id = NULL, telegram_user_id = NULL, telegram_review_notifications_enabled = false
          WHERE id IN (SELECT id FROM owned_event)
          RETURNING id
        ), invalidated_tokens AS (
          UPDATE telegram_link_tokens
          SET used_at = NOW()
          WHERE event_id = ${target.id} AND used_at IS NULL AND EXISTS (SELECT 1 FROM owned_event)
        )
        SELECT EXISTS (SELECT 1 FROM owned_event) AS owned
      `;
      if (!result?.owned) throw new ForbiddenError("You do not own this event");
      return Response.json({ telegramLinked: false });
    }

    const venueId = target.id;

    const [result] = await sql<Array<{ owned: boolean }>>`
      WITH owned_venue AS (
        SELECT id
        FROM venues
        WHERE id = ${venueId} AND owner_id = ${session.user.id}
        ), unlinked_venue AS (
          UPDATE venues
          SET telegram_chat_id = NULL, telegram_user_id = NULL, telegram_review_notifications_enabled = false
        WHERE id IN (SELECT id FROM owned_venue)
        RETURNING id
      ), cancelled_deliveries AS (
        UPDATE telegram_message_deliveries delivery
        SET status = 'CANCELLED', locked_at = NULL
        FROM messages m
        JOIN conversations c ON c.id = m.conversation_id
        WHERE delivery.message_id = m.id
          AND c.venue_id IN (SELECT id FROM unlinked_venue)
          AND delivery.status IN ('PENDING', 'PROCESSING')
      ), invalidated_tokens AS (
        UPDATE telegram_link_tokens
        SET used_at = NOW()
        WHERE venue_id = ${venueId}
          AND used_at IS NULL
          AND EXISTS (SELECT 1 FROM owned_venue)
      )
      SELECT EXISTS (SELECT 1 FROM owned_venue) AS owned
    `;

    if (!result?.owned) throw new ForbiddenError("You do not own this venue");

    return Response.json({ telegramLinked: false });
  });
