import { z } from "zod";

import { getApiContext, rateLimiters, withErrorHandling } from "~/lib/api";
import { closeCommunityRequest } from "~/lib/models/community-requests";

const paramsSchema = z.object({ requestId: z.string().uuid() });

export const POST = (_req: Request, { params }: { params: Promise<{ requestId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(_req, { withAuth: true });
    await rateLimiters.contentUpdate.check(session.user.id);
    const { requestId } = paramsSchema.parse(await params);
    await closeCommunityRequest(requestId, session.user.id);
    return new Response(null, { status: 204 });
  });
