import { z } from "zod";

import { ForbiddenError, getApiContext, validateRequest, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";

const venueSchema = z.object({ venueId: z.uuid() });
const eventSchema = z.object({ eventId: z.uuid() });
const schema = z.union([venueSchema.extend({ enabled: z.boolean() }), eventSchema.extend({ enabled: z.boolean() })]);

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    const params = Object.fromEntries(new URL(req.url).searchParams);
    const target = venueSchema.safeParse(params);
    const event = eventSchema.safeParse(params);
    if (!target.success && !event.success) throw new ForbiddenError("A venue or event is required");
    const type = target.success ? "venue" : "event";
    const id = target.success ? target.data.venueId : event.data!.eventId;
    const [content] = await sql<Array<{ enabled: boolean; linked: boolean }>>`
      SELECT telegram_qr_notifications_enabled AS enabled, telegram_user_id IS NOT NULL AS linked
      FROM ${type === "venue" ? sql`venues` : sql`events`}
      WHERE id = ${id} AND owner_id = ${session.user.id}
    `;
    if (!content) throw new ForbiddenError("You do not own this content");
    return Response.json(content);
  });

export const PUT = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    const data = await validateRequest(req, schema);
    const target =
      "venueId" in data ? { id: data.venueId, type: "venue" as const } : { id: data.eventId, type: "event" as const };
    const [content] = await sql<Array<{ enabled: boolean }>>`
      UPDATE ${target.type === "venue" ? sql`venues` : sql`events`}
      SET telegram_qr_notifications_enabled = ${data.enabled}
      WHERE id = ${target.id} AND owner_id = ${session.user.id} AND telegram_user_id IS NOT NULL
      RETURNING telegram_qr_notifications_enabled AS enabled
    `;
    if (!content) throw new ForbiddenError("You must own Telegram-linked content to update QR notifications");
    return Response.json(content);
  });
