import { z } from "zod";

import { getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import { getContentUpdateNotifications, setContentUpdateNotificationPreferences } from "~/lib/models/content-updates";

const schema = z
  .object({ commentsEnabled: z.boolean().optional(), repliesEnabled: z.boolean().optional() })
  .refine((data) => data.commentsEnabled !== undefined || data.repliesEnabled !== undefined, {
    message: "At least one notification preference is required",
  });

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    return Response.json(await getContentUpdateNotifications(session.user.id));
  });

export const PUT = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    const { commentsEnabled, repliesEnabled } = await validateRequest(req, schema);
    return Response.json(
      await setContentUpdateNotificationPreferences(session.user.id, commentsEnabled, repliesEnabled),
    );
  });
