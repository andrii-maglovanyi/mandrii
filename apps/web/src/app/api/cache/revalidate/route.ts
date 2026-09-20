import { getCronAuthorizationError } from "~/lib/cron/authorization";
import { invalidatePublicContent } from "~/lib/public-cache/invalidate";

/** Call after external imports/SQL changes; also suitable for a Hasura webhook. */
export async function POST(request: Request) {
  const denied = getCronAuthorizationError(request.headers.get("authorization"));
  if (denied) return denied;
  invalidatePublicContent();
  return Response.json({ revalidated: true });
}
