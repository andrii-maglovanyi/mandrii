import { z } from "zod";

import { BadRequestError, getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import { setContentUpdatePinned } from "~/lib/models/content-updates";

export const dynamic = "force-dynamic";

const pinSchema = z.object({ pinned: z.boolean() });

export const PUT = (req: Request, { params }: { params: Promise<{ updateId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.contentUpdate.check(session.user.id);
    const { updateId } = await params;
    if (!z.string().uuid().safeParse(updateId).success) throw new BadRequestError("A valid update ID is required");

    const { pinned } = await validateRequest(req, pinSchema);
    return Response.json(await setContentUpdatePinned(updateId, session.user.id, pinned));
  });
