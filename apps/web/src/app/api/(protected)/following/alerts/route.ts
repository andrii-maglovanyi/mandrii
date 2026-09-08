import { z } from "zod";

import { getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import {
  getContentSubscriptionAlerts,
  markContentSubscriptionAlertsRead,
} from "~/lib/models/content-subscription-alerts";
import { UUID } from "~/types/uuid";

export const dynamic = "force-dynamic";

const readSchema = z.object({ id: z.string().uuid().optional() });
const privateNoStoreHeaders = { "Cache-Control": "private, no-store" };

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    return Response.json(
      { alerts: await getContentSubscriptionAlerts(session.user.id) },
      { headers: privateNoStoreHeaders },
    );
  });

export const PATCH = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    const { id } = await validateRequest(req, readSchema);
    const marked = await markContentSubscriptionAlertsRead(session.user.id, id as UUID | undefined);
    return Response.json({ marked }, { headers: privateNoStoreHeaders });
  });
