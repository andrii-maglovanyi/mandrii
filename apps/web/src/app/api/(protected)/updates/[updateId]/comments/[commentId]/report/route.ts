import { z } from "zod";

import { BadRequestError, getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import { assertPublicContentUpdate, reportContentUpdateComment } from "~/lib/models/content-updates";

const schema = z.object({ reason: z.string().trim().min(3).max(500) });

export const POST = (req: Request, { params }: { params: Promise<{ commentId: string; updateId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.contentComment.check(session.user.id);
    const { commentId, updateId } = await params;
    if (!z.string().uuid().safeParse(updateId).success || !z.string().uuid().safeParse(commentId).success) {
      throw new BadRequestError("A valid update and comment ID are required");
    }
    await assertPublicContentUpdate(updateId);
    const { reason } = await validateRequest(req, schema);
    await reportContentUpdateComment(updateId, commentId, session.user.id, reason);
    return Response.json({ success: true });
  });
