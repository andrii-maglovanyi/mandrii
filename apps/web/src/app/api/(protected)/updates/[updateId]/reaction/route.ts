import { z } from "zod";

import { BadRequestError, getApiContext, rateLimiters, withErrorHandling } from "~/lib/api";
import { toggleContentUpdateLike } from "~/lib/models/content-updates";

export const dynamic = "force-dynamic";

export const PUT = (req: Request, { params }: { params: Promise<{ updateId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.contentUpdate.check(session.user.id);
    const { updateId } = await params;
    if (!z.string().uuid().safeParse(updateId).success) throw new BadRequestError("A valid update ID is required");

    return Response.json(await toggleContentUpdateLike(updateId, session.user.id));
  });
