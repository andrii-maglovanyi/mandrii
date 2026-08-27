import { z } from "zod";

import { getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import { removeContentReviewResponse, upsertContentReviewResponse } from "~/lib/models/content-reviews";
import { getReviewId } from "~/lib/reviews/request";

export const dynamic = "force-dynamic";

const responseSchema = z.object({ body: z.string().trim().min(1).max(1500) });

export const PUT = (req: Request, { params }: { params: Promise<{ reviewId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.review.check(session.user.id);
    const reviewId = await getReviewId(params);
    const { body } = await validateRequest(req, responseSchema);

    await upsertContentReviewResponse(reviewId, session.user.id, body);

    return Response.json({ success: true });
  });

export const DELETE = (req: Request, { params }: { params: Promise<{ reviewId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.review.check(session.user.id);
    const reviewId = await getReviewId(params);

    await removeContentReviewResponse(reviewId, session.user.id);

    return Response.json({ success: true });
  });
