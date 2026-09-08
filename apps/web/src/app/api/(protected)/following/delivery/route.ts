import { z } from "zod";

import { BadRequestError, getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import {
  CONTENT_ALERT_DELIVERY_FREQUENCIES,
  getContentAlertDeliveryPreferences,
  updateContentAlertDeliveryPreferences,
} from "~/lib/models/content-subscription-alert-deliveries";

const preferencesSchema = z
  .object({
    emailEnabled: z.boolean(),
    frequency: z.enum(CONTENT_ALERT_DELIVERY_FREQUENCIES),
    pushEnabled: z.boolean(),
    telegramEnabled: z.boolean(),
  })
  .partial()
  .refine((preferences) => Object.keys(preferences).length > 0, "Choose a delivery setting to update");

const privateNoStoreHeaders = { "Cache-Control": "private, no-store" };

export const dynamic = "force-dynamic";

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    return Response.json(await getContentAlertDeliveryPreferences(session.user.id), { headers: privateNoStoreHeaders });
  });

export const PUT = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    const preferences = await validateRequest(req, preferencesSchema);
    const current = await getContentAlertDeliveryPreferences(session.user.id);

    if (preferences.telegramEnabled && !current.telegramLinked) {
      throw new BadRequestError("Link Telegram before enabling Telegram alerts");
    }
    if (preferences.pushEnabled && (!current.pushSupported || !current.pushSubscribed)) {
      throw new BadRequestError("Enable browser notifications before using browser alerts");
    }

    return Response.json(await updateContentAlertDeliveryPreferences(session.user.id, preferences), {
      headers: privateNoStoreHeaders,
    });
  });
