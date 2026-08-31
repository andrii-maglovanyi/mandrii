import { z } from "zod";

import { getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";

const schema = z.object({ enabled: z.boolean() });

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    const [user] = await sql<Array<{ enabled: boolean; linked: boolean }>>`
      SELECT community_telegram_notifications_enabled AS enabled,
             telegram_chat_id IS NOT NULL AND telegram_user_id IS NOT NULL AS linked
      FROM users WHERE id = ${session.user.id}
    `;
    return Response.json(user ?? { enabled: false, linked: false });
  });

export const PUT = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.telegramLink.check(session.user.id);
    const { enabled } = await validateRequest(req, schema);
    const [user] = await sql<Array<{ enabled: boolean; linked: boolean }>>`
      UPDATE users
      SET community_telegram_notifications_enabled = ${enabled} AND telegram_chat_id IS NOT NULL AND telegram_user_id IS NOT NULL
      WHERE id = ${session.user.id}
      RETURNING community_telegram_notifications_enabled AS enabled,
                telegram_chat_id IS NOT NULL AND telegram_user_id IS NOT NULL AS linked
    `;
    return Response.json(user ?? { enabled: false, linked: false });
  });
