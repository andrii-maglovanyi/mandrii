import { z } from "zod";

import { getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import { createCommunityResponseMessage, getCommunityResponseThread } from "~/lib/models/community-requests";

const paramsSchema = z.object({ responseId: z.string().uuid() });
const bodySchema = z.object({ body: z.string().trim().min(1).max(1500) });

export const GET = (req: Request, { params }: { params: Promise<{ responseId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    const { responseId } = paramsSchema.parse(await params);
    return Response.json(await getCommunityResponseThread(responseId, session.user.id));
  });

export const POST = (req: Request, { params }: { params: Promise<{ responseId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.contentUpdate.check(session.user.id);
    const { responseId } = paramsSchema.parse(await params);
    const { body } = await validateRequest(req, bodySchema);
    return Response.json(await createCommunityResponseMessage({ body, responseId, userId: session.user.id }), {
      status: 201,
    });
  });
