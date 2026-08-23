import { z } from "zod";

import { ForbiddenError, getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";

const schema = z.object({ venueId: z.uuid() });

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.telegramLink.check(session.user.id);
    const { venueId } = await validateRequest(req, schema);

    const [result] = await sql<Array<{ owned: boolean }>>`
      WITH owned_venue AS (
        SELECT id
        FROM venues
        WHERE id = ${venueId} AND owner_id = ${session.user.id}
      ), unlinked_venue AS (
        UPDATE venues
        SET telegram_chat_id = NULL
        WHERE id IN (SELECT id FROM owned_venue)
        RETURNING id
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
