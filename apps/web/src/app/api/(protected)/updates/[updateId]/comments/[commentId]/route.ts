import { z } from "zod";

import { BadRequestError, getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import { editContentUpdateComment, removeContentUpdateComment } from "~/lib/models/content-updates";

export const dynamic = "force-dynamic";

export const DELETE = (req: Request, { params }: { params: Promise<{ commentId: string; updateId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.contentComment.check(session.user.id);
    const { commentId, updateId } = await params;
    if (!z.string().uuid().safeParse(updateId).success || !z.string().uuid().safeParse(commentId).success) {
      throw new BadRequestError("A valid update and comment ID are required");
    }

    const deletedCount = await removeContentUpdateComment(updateId, commentId, session.user.id);
    return Response.json({ deletedCount, success: true });
  });

const editSchema = z.object({ body: z.string().trim().min(1).max(1000) });

export const PUT = (req: Request, { params }: { params: Promise<{ commentId: string; updateId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.contentComment.check(session.user.id);
    const { commentId, updateId } = await params;
    if (!z.string().uuid().safeParse(updateId).success || !z.string().uuid().safeParse(commentId).success) {
      throw new BadRequestError("A valid update and comment ID are required");
    }
    const { body } = await validateRequest(req, editSchema);
    return Response.json(await editContentUpdateComment(updateId, commentId, session.user.id, body));
  });
