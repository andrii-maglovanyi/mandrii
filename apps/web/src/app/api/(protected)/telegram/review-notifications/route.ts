import { z } from "zod";

import { ForbiddenError, getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";
import { deliverPendingReviewTelegramNotifications } from "~/lib/telegram/bot";

export const dynamic = "force-dynamic";

const venueSchema = z.object({ venueId: z.uuid() });
const eventSchema = z.object({ eventId: z.uuid() });
const schema = z.union([venueSchema.extend({ enabled: z.boolean() }), eventSchema.extend({ enabled: z.boolean() })]);

const getTarget = (params: Record<string, string>) => {
  const venue = venueSchema.safeParse(params);
  if (venue.success) return { id: venue.data.venueId, type: "venue" as const };

  const event = eventSchema.safeParse(params);
  if (event.success) return { id: event.data.eventId, type: "event" as const };

  throw new ForbiddenError("A venue or event is required");
};

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    const target = getTarget(Object.fromEntries(new URL(req.url).searchParams));
    const [state] = await sql<
      Array<{
        attempts: number;
        delivered_at: null | string;
        enabled: boolean;
        last_error: null | string;
        next_attempt_at: string;
        status: "DELIVERED" | "FAILED" | "PENDING" | "PROCESSING";
        telegram_linked: boolean;
      }>
    >`
      SELECT target.telegram_user_id IS NOT NULL AS telegram_linked,
             target.telegram_review_notifications_enabled AS enabled,
             d.status, d.attempts, d.next_attempt_at, d.delivered_at, d.last_error
      FROM ${target.type === "venue" ? sql`venues` : sql`events`} target
      LEFT JOIN content_ratings r ON ${target.type === "venue" ? sql`r.venue_id` : sql`r.event_id`} = target.id
      LEFT JOIN LATERAL (
        SELECT status, attempts, next_attempt_at, delivered_at, last_error
        FROM review_telegram_deliveries
        WHERE content_rating_id = r.id
        ORDER BY created_at DESC
        LIMIT 1
      ) d ON TRUE
      WHERE target.id = ${target.id} AND target.owner_id = ${session.user.id}
      ORDER BY d.delivered_at DESC NULLS LAST, d.next_attempt_at DESC NULLS LAST
      LIMIT 1
    `;
    if (!state) throw new ForbiddenError("You do not own this content");
    const { enabled, telegram_linked: linked, ...delivery } = state;
    return Response.json({ delivery: delivery.status ? delivery : null, enabled, linked });
  });

export const PUT = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.telegramLink.check(session.user.id);
    const data = await validateRequest(req, schema);
    const { enabled } = data;
    const target =
      "venueId" in data ? { id: data.venueId, type: "venue" as const } : { id: data.eventId, type: "event" as const };
    const [content] = await sql<Array<{ telegram_review_notifications_enabled: boolean }>>`
      UPDATE ${target.type === "venue" ? sql`venues` : sql`events`}
      SET telegram_review_notifications_enabled = ${enabled}
      WHERE id = ${target.id} AND owner_id = ${session.user.id} AND telegram_user_id IS NOT NULL
      RETURNING telegram_review_notifications_enabled
    `;
    if (!content) throw new ForbiddenError("You must own Telegram-linked content to update review notifications");

    return Response.json({ enabled: content.telegram_review_notifications_enabled });
  });

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.telegramLink.check(session.user.id);
    const data = await validateRequest(req, z.union([venueSchema, eventSchema]));
    const target =
      "venueId" in data ? { id: data.venueId, type: "venue" as const } : { id: data.eventId, type: "event" as const };
    const [delivery] = await sql<Array<{ id: string }>>`
      UPDATE review_telegram_deliveries d
      SET status = 'PENDING', attempts = 0, next_attempt_at = NOW(), locked_at = NULL, last_error = NULL
      FROM content_ratings r
      JOIN ${target.type === "venue" ? sql`venues` : sql`events`} target
        ON target.id = ${target.type === "venue" ? sql`r.venue_id` : sql`r.event_id`}
      WHERE d.content_rating_id = r.id
        AND target.id = ${target.id}
        AND target.owner_id = ${session.user.id}
        AND d.status = 'FAILED'
      RETURNING d.id
    `;
    if (!delivery) throw new ForbiddenError("There is no failed review notification to retry for this content");

    deliverPendingReviewTelegramNotifications(1).catch((error) => {
      console.error("Manual Telegram review retry failed:", error);
    });
    return Response.json({ success: true });
  });
