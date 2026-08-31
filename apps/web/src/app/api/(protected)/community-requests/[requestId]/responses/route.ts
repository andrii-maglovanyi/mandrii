import { z } from "zod";

import { BadRequestError, getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import { hasCommunityRequestContactDetails } from "~/lib/community-requests/safety";
import { createCommunityRequestResponse, getCommunityRequestResponses } from "~/lib/models/community-requests";
import { sendCommunityResponseTelegramNotification } from "~/lib/telegram/bot";

const paramsSchema = z.object({ requestId: z.string().uuid() });
const bodySchema = z.object({ body: z.string().trim().min(5).max(800) });

export const GET = (req: Request, { params }: { params: Promise<{ requestId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.general.check(session.user.id);
    const { requestId } = paramsSchema.parse(await params);
    return Response.json(await getCommunityRequestResponses(requestId, session.user.id));
  });

export const POST = (req: Request, { params }: { params: Promise<{ requestId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.contentUpdate.check(session.user.id);
    const { requestId } = paramsSchema.parse(await params);
    const { body } = await validateRequest(req, bodySchema);
    if (hasCommunityRequestContactDetails(body)) {
      throw new BadRequestError("Please do not post phone numbers, email addresses or links here");
    }
    const response = await createCommunityRequestResponse({ body, requestId, userId: session.user.id });
    void sendCommunityResponseTelegramNotification(response.id).catch((error) => {
      console.error("Community response Telegram notification enqueue failed:", error);
    });
    return Response.json(response, {
      status: 201,
    });
  });
