import { getApiContext, rateLimiters, withErrorHandling } from "~/lib/api";
import { getUnreadMessagingState } from "~/lib/messaging/unread";

export const dynamic = "force-dynamic";

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.messagingRead.check(session.user.id);

    return Response.json(await getUnreadMessagingState(session.user.id));
  });
