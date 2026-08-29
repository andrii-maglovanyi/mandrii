import { z } from "zod";

import { ForbiddenError, getApiContext, validateRequest, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";

const idSchema = z.object({ venueId: z.uuid() });

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    const { venueId } = idSchema.parse(Object.fromEntries(new URL(req.url).searchParams));
    const [venue] = await sql<Array<{ enabled: boolean }>>`
      SELECT telegram_message_notifications_enabled AS enabled FROM venues
      WHERE id = ${venueId} AND owner_id = ${session.user.id}
    `;
    if (!venue) throw new ForbiddenError("You do not own this venue");
    return Response.json(venue);
  });

export const PUT = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    const { enabled, venueId } = await validateRequest(req, idSchema.extend({ enabled: z.boolean() }));
    const [venue] = await sql<Array<{ enabled: boolean }>>`
      UPDATE venues SET telegram_message_notifications_enabled = ${enabled}
      WHERE id = ${venueId} AND owner_id = ${session.user.id} AND telegram_user_id IS NOT NULL
      RETURNING telegram_message_notifications_enabled AS enabled
    `;
    if (!venue) throw new ForbiddenError("You must own a Telegram-linked venue to update message notifications");
    return Response.json(venue);
  });
