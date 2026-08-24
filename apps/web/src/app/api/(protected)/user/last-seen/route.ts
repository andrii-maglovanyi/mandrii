import { getApiContext, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";

export const dynamic = "force-dynamic";

const LAST_SEEN_UPDATE_INTERVAL = "5 minutes";

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });

    await sql`
      UPDATE users
      SET last_seen_at = NOW()
      WHERE id = ${session.user.id}
        AND (last_seen_at IS NULL OR last_seen_at < NOW() - ${LAST_SEEN_UPDATE_INTERVAL}::interval)
    `;

    return new Response(null, { status: 204 });
  });
