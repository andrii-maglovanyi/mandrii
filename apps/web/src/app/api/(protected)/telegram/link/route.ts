import { randomBytes } from "crypto";
import { z } from "zod";

import {
  ForbiddenError,
  getApiContext,
  InternalServerError,
  rateLimiters,
  validateRequest,
  withErrorHandling,
} from "~/lib/api";
import { privateConfig } from "~/lib/config/private";
import sql from "~/lib/db/db";

const schema = z.object({ venueId: z.uuid() });

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.telegramLink.check(session.user.id);
    const { venueId } = await validateRequest(req, schema);

    if (privateConfig.telegram.botUsername === "__UNSET__" || privateConfig.telegram.token === "__UNSET__") {
      throw new InternalServerError("Telegram bot is not configured");
    }

    const [venue] = await sql<{ id: string }[]>`
      SELECT id FROM venues WHERE id = ${venueId} AND owner_id = ${session.user.id}
    `;
    if (!venue) throw new ForbiddenError("You do not own this venue");

    const token = randomBytes(32).toString("base64url");
    await sql`
      WITH locked AS (
        SELECT pg_advisory_xact_lock(hashtext(${venueId}))
      ), cleaned AS (
        DELETE FROM telegram_link_tokens
        USING locked
        WHERE expires_at <= NOW()
          OR used_at IS NOT NULL
          OR (venue_id = ${venueId} AND used_at IS NULL)
      )
      INSERT INTO telegram_link_tokens (token, venue_id, created_by, expires_at)
      SELECT ${token}, ${venueId}, ${session.user.id}, NOW() + INTERVAL '15 minutes'
      FROM locked
      ON CONFLICT (venue_id) WHERE used_at IS NULL DO UPDATE SET
        token = EXCLUDED.token,
        created_by = EXCLUDED.created_by,
        expires_at = EXCLUDED.expires_at,
        used_at = NULL
    `;

    return Response.json({ url: `https://t.me/${privateConfig.telegram.botUsername}?start=${token}` });
  });
