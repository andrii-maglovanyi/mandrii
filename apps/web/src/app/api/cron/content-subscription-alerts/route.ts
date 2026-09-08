import { captureMessage } from "@sentry/nextjs";

import { getCronAuthorizationError } from "~/lib/cron/authorization";
import { getContentSubscriptionAlertDeliveryMetrics } from "~/lib/models/content-subscription-alert-deliveries";
import {
  deliverPendingContentSubscriptionAlerts,
  getContentSubscriptionAlertJobMetrics,
} from "~/lib/models/content-subscription-alerts";

export const dynamic = "force-dynamic";

export const GET = async (req: Request) => {
  const authorizationError = getCronAuthorizationError(req.headers.get("authorization"));
  if (authorizationError) return authorizationError;

  try {
    const delivery = await deliverPendingContentSubscriptionAlerts({ limit: 100 });
    const [alertJobs, externalDelivery] = await Promise.all([
      getContentSubscriptionAlertJobMetrics(),
      getContentSubscriptionAlertDeliveryMetrics(),
    ]);
    if (alertJobs.failed || externalDelivery.failed) {
      captureMessage("Content subscription alert deliveries need attention", {
        extra: { alertJobs, externalDelivery },
        level: "warning",
      });
    }
    return Response.json({ alertJobs, delivery, externalDelivery });
  } catch (error) {
    console.error("Content subscription alert delivery cron failed:", error);
    return new Response("Unable to process content subscription alerts", { status: 500 });
  }
};
