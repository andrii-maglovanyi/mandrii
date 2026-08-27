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

const schema = z.object({ eventId: z.uuid() });

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.telegramLink.check(session.user.id);
    const { eventId } = await validateRequest(req, schema);
    if (privateConfig.telegram.botUsername === "__UNSET__" || privateConfig.telegram.token === "__UNSET__") {
      throw new InternalServerError("Telegram bot is not configured");
    }
    const [event] = await sql<
      { id: string }[]
    >`SELECT id FROM events WHERE id = ${eventId} AND owner_id = ${session.user.id}`;
    if (!event) throw new ForbiddenError("You do not own this event");
    const token = randomBytes(32).toString("base64url");
    await sql`INSERT INTO telegram_link_tokens (token, event_id, created_by, expires_at) VALUES (${token}, ${eventId}, ${session.user.id}, NOW() + INTERVAL '15 minutes') ON CONFLICT (event_id) WHERE used_at IS NULL AND event_id IS NOT NULL DO UPDATE SET token = EXCLUDED.token, created_by = EXCLUDED.created_by, expires_at = EXCLUDED.expires_at, used_at = NULL`;
    return Response.json({ url: `https://t.me/${privateConfig.telegram.botUsername}?start=${token}` });
  });
