import { z } from "zod";

import { getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";

const schema = z.object({ endpoint: z.url() });

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    const { endpoint } = await validateRequest(req, schema);

    await sql`
      DELETE FROM push_subscriptions
      WHERE endpoint = ${endpoint} AND user_id = ${session.user.id}
    `;

    return Response.json({ unsubscribed: true });
  });
