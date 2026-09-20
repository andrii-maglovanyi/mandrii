import { getCronAuthorizationError } from "~/lib/cron/authorization";
import sql from "~/lib/db/db";
import { isEventScheduleFinished } from "~/lib/events/recurrence";
import { invalidatePublicContent } from "~/lib/public-cache/invalidate";

export const dynamic = "force-dynamic";

export const GET = async (req: Request) => {
  const authorizationError = getCronAuthorizationError(req.headers.get("authorization"));
  if (authorizationError) return authorizationError;

  try {
    const completedOneOff = await sql<{ id: string }[]>`
      UPDATE events
      SET status = 'COMPLETED'
      WHERE status = 'ACTIVE'
        AND is_recurring IS NOT TRUE
        AND COALESCE(end_date, start_date) < NOW()
      RETURNING id
    `;

    if (completedOneOff.length) invalidatePublicContent();

    // Keep schedule edits from racing the read/compute/update sequence.
    const completedRecurring = await sql.begin(async (transaction) => {
      const recurringEvents = await transaction<
        Array<{ end_date: null | string; id: string; recurrence_rule: null | string; start_date: string }>
      >`
        SELECT id, start_date, end_date, recurrence_rule
        FROM events
        WHERE status = 'ACTIVE' AND is_recurring IS TRUE
        FOR UPDATE
      `;
      const recurringIds = recurringEvents
        .filter((event) => isEventScheduleFinished({ ...event, is_recurring: true }))
        .map((event) => event.id);

      return recurringIds.length
        ? await transaction<{ id: string }[]>`
            UPDATE events
            SET status = 'COMPLETED'
            WHERE id = ANY(${recurringIds}::uuid[]) AND status = 'ACTIVE'
            RETURNING id
          `
        : [];
    });

    if (completedRecurring.length) invalidatePublicContent();
    return Response.json({ completed: completedOneOff.length + completedRecurring.length });
  } catch (error) {
    console.error("Event completion cron failed:", error);
    return new Response("Unable to complete past events", { status: 500 });
  }
};
