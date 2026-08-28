import { z } from "zod";

import { BadRequestError, rateLimiters, withErrorHandling } from "~/lib/api";
import { assertPublicContentUpdate, getContentUpdateCommentReplies } from "~/lib/models/content-updates";

export const GET = (req: Request, { params }: { params: Promise<{ commentId: string; updateId: string }> }) =>
  withErrorHandling(async () => {
    await rateLimiters.general.check();
    const { commentId, updateId } = await params;
    if (!z.string().uuid().safeParse(updateId).success || !z.string().uuid().safeParse(commentId).success)
      throw new BadRequestError("A valid update and comment ID are required");
    const cursor = new URL(req.url).searchParams.get("cursor");
    if (
      cursor &&
      (cursor.split("|").length !== 2 ||
        !z.string().datetime({ offset: true }).safeParse(cursor.split("|")[0]).success ||
        !z.string().uuid().safeParse(cursor.split("|")[1]).success)
    )
      throw new BadRequestError("A valid reply cursor is required");
    await assertPublicContentUpdate(updateId);
    return Response.json(await getContentUpdateCommentReplies(updateId, commentId, cursor, 10));
  });
