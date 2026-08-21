import { z } from "zod";

import { getApiContext, InternalServerError, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";
import { isWebPushConfigured } from "~/lib/web-push";

const schema = z.object({
  subscription: z.object({
    endpoint: z.url(),
    keys: z.object({ auth: z.string().min(1), p256dh: z.string().min(1) }),
  }),
});

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    const { subscription } = await validateRequest(req, schema);
    if (!isWebPushConfigured()) throw new InternalServerError("Web Push is not configured");
    await sql`
      INSERT INTO push_subscriptions (endpoint, user_id, p256dh, auth)
      VALUES (${subscription.endpoint}, ${session.user.id}, ${subscription.keys.p256dh}, ${subscription.keys.auth})
      ON CONFLICT (endpoint) DO UPDATE SET
        -- The active signed-in user owns this browser subscription on a shared device.
        user_id = EXCLUDED.user_id,
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        updated_at = NOW()
    `;
    return Response.json({ subscribed: true });
  });
