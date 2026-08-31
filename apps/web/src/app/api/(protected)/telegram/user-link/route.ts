import { randomBytes } from "crypto";

import { getApiContext, InternalServerError, rateLimiters, withErrorHandling } from "~/lib/api";
import { privateConfig } from "~/lib/config/private";
import sql from "~/lib/db/db";

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.telegramLink.check(session.user.id);

    if (privateConfig.telegram.botUsername === "__UNSET__" || privateConfig.telegram.token === "__UNSET__") {
      throw new InternalServerError("Telegram bot is not configured");
    }

    const token = randomBytes(32).toString("base64url");
    await sql`
      WITH locked AS (
        SELECT pg_advisory_xact_lock(hashtext(${session.user.id}))
      ), cleaned AS (
        DELETE FROM telegram_link_tokens
        USING locked
        WHERE expires_at <= NOW()
          OR used_at IS NOT NULL
          OR (user_id = ${session.user.id} AND used_at IS NULL)
      )
      INSERT INTO telegram_link_tokens (token, user_id, created_by, expires_at)
      SELECT ${token}, ${session.user.id}, ${session.user.id}, NOW() + INTERVAL '15 minutes'
      FROM locked
      ON CONFLICT (user_id) WHERE used_at IS NULL AND user_id IS NOT NULL DO UPDATE SET
        token = EXCLUDED.token,
        created_by = EXCLUDED.created_by,
        expires_at = EXCLUDED.expires_at,
        used_at = NULL
    `;

    return Response.json({ url: `https://t.me/${privateConfig.telegram.botUsername}?start=${token}` });
  });
