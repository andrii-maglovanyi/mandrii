import { z } from "zod";

import { BadRequestError, getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import { hasCommunityRequestContactDetails } from "~/lib/community-requests/safety";
import { communityRequestInputSchema } from "~/lib/community-requests/validation";
import { updateCommunityRequest } from "~/lib/models/community-requests";

const paramsSchema = z.object({ requestId: z.string().uuid() });

export const PATCH = (req: Request, { params }: { params: Promise<{ requestId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.contentUpdate.check(session.user.id);
    const { requestId } = paramsSchema.parse(await params);
    const data = await validateRequest(req, communityRequestInputSchema);
    if (hasCommunityRequestContactDetails(`${data.title}\n${data.body}`)) {
      throw new BadRequestError("Please do not post phone numbers, email addresses or links here");
    }
    return Response.json(
      await updateCommunityRequest({
        ...data,
        expiresAt: new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000),
        id: requestId,
        userId: session.user.id,
      }),
    );
  });
