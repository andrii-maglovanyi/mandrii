import { getCronAuthorizationError } from "~/lib/cron/authorization";
import sql from "~/lib/db/db";

export const dynamic = "force-dynamic";

export const GET = async (req: Request) => {
  const authorizationError = getCronAuthorizationError(req.headers.get("authorization"));
  if (authorizationError) return authorizationError;

  try {
    const completed = await sql<{ id: string }[]>`
      UPDATE events
      SET status = 'COMPLETED'
      WHERE status = 'ACTIVE'
        AND is_recurring IS NOT TRUE
        AND COALESCE(end_date, start_date) < NOW()
      RETURNING id
    `;

    return Response.json({ completed: completed.length });
  } catch (error) {
    console.error("Event completion cron failed:", error);
    return new Response("Unable to complete past events", { status: 500 });
  }
};
