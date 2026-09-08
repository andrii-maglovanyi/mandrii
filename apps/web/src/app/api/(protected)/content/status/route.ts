import { z } from "zod";
import { after } from "next/server";

import { getApiContext, validateRequest, withErrorHandling } from "~/lib/api";
import { updateContentStatus } from "~/lib/models/content-status";
import { deliverPendingContentSubscriptionAlerts } from "~/lib/models/content-subscription-alerts";
import { Event_Status_Enum, Venue_Status_Enum } from "~/types";
import { UUID } from "~/types/uuid";

export const dynamic = "force-dynamic";

const contentStatusSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().uuid(),
    status: z.enum([Event_Status_Enum.Active, Event_Status_Enum.Archived, Event_Status_Enum.Cancelled]),
    type: z.literal("event"),
  }),
  z.object({
    id: z.string().uuid(),
    status: z.enum([
      Venue_Status_Enum.Active,
      Venue_Status_Enum.Archived,
      Venue_Status_Enum.Hidden,
      Venue_Status_Enum.Rejected,
    ]),
    type: z.literal("venue"),
  }),
]);

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    const change = await validateRequest(req, contentStatusSchema);
    const content = await updateContentStatus({ ...change, id: change.id as UUID }, session.user);

    // Publication and event-change jobs are created by database triggers. That
    // also covers status changes made outside this route.
    after(() =>
      deliverPendingContentSubscriptionAlerts({ limit: 10 }).catch((error) =>
        console.error("Content publication alert delivery failed:", error),
      ),
    );

    return Response.json({ content });
  });
