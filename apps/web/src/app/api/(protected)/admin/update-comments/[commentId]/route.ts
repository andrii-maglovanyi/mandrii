import { z } from "zod";

import { BadRequestError, ForbiddenError, getApiContext, validateRequest, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";

const schema = z.object({ action: z.enum(["REMOVE", "RESOLVE"]) });

export const PUT = (req: Request, { params }: { params: Promise<{ commentId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    if (session.user.role !== "admin") throw new ForbiddenError("Only administrators can moderate comments");
    const { commentId } = await params;
    if (!z.string().uuid().safeParse(commentId).success) throw new BadRequestError("A valid comment ID is required");
    const { action } = await validateRequest(req, schema);
    await sql.begin(async (transaction) => {
      if (action === "REMOVE")
        await transaction`UPDATE content_update_comments SET deleted_at = NOW(), deleted_by_user_id = ${session.user.id} WHERE id = ${commentId} OR parent_id = ${commentId}`;
      await transaction`
        UPDATE content_update_comment_reports SET status = 'RESOLVED', resolved_at = NOW(), resolved_by_user_id = ${session.user.id}
        WHERE (comment_id = ${commentId} OR comment_id IN (SELECT id FROM content_update_comments WHERE parent_id = ${commentId})) AND status = 'OPEN'
      `;
    });
    return Response.json({ success: true });
  });
