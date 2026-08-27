import { z } from "zod";

import { BadRequestError, getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import { removeContentUpdate, updateContentUpdate } from "~/lib/models/content-updates";
import { deleteImages } from "~/lib/utils/images";

export const dynamic = "force-dynamic";

const updateSchema = z.object({ body: z.string().trim().min(1).max(1500) });

const getUpdateId = async (params: Promise<{ updateId: string }>) => {
  const { updateId } = await params;
  if (!z.string().uuid().safeParse(updateId).success) throw new BadRequestError("A valid update ID is required");
  return updateId;
};

export const PUT = (req: Request, { params }: { params: Promise<{ updateId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.contentUpdate.check(session.user.id);
    const updateId = await getUpdateId(params);
    const { body } = await validateRequest(req, updateSchema);

    await updateContentUpdate(updateId, session.user.id, body);
    return Response.json({ success: true });
  });

export const DELETE = (req: Request, { params }: { params: Promise<{ updateId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.contentUpdate.check(session.user.id);
    const updateId = await getUpdateId(params);

    const deleted = await removeContentUpdate(updateId, session.user.id);
    await deleteImages(deleted.images).catch((error) => {
      console.error("Failed to clean up deleted update images", error);
    });
    return Response.json({ success: true });
  });
