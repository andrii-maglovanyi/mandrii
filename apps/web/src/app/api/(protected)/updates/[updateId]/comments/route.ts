import { z } from "zod";

import { BadRequestError, getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import {
  assertPublicContentUpdate,
  createContentUpdateComment,
  getContentUpdateCommentPage,
} from "~/lib/models/content-updates";

export const dynamic = "force-dynamic";

const commentSchema = z.object({
  body: z.string().trim().min(1).max(1000),
  parentId: z.string().uuid().nullable().optional(),
});

export const GET = (req: Request, { params }: { params: Promise<{ updateId: string }> }) =>
  withErrorHandling(async () => {
    await rateLimiters.general.check();
    const { updateId } = await params;
    if (!z.string().uuid().safeParse(updateId).success) throw new BadRequestError("A valid update ID is required");
    await assertPublicContentUpdate(updateId);
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    if (
      cursor &&
      (cursor.split("|").length !== 2 ||
        !z.string().datetime({ offset: true }).safeParse(cursor.split("|")[0]).success ||
        !z.string().uuid().safeParse(cursor.split("|")[1]).success)
    )
      throw new BadRequestError("A valid comment cursor is required");
    return Response.json(await getContentUpdateCommentPage(updateId, cursor, 10));
  });

export const POST = (req: Request, { params }: { params: Promise<{ updateId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.contentComment.check(session.user.id);
    const { updateId } = await params;
    if (!z.string().uuid().safeParse(updateId).success) throw new BadRequestError("A valid update ID is required");
    const { body, parentId } = await validateRequest(req, commentSchema);

    return Response.json(await createContentUpdateComment(updateId, session.user.id, body, parentId ?? null), {
      status: 201,
    });
  });
