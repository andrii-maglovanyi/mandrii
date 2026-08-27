import { z } from "zod";

import { ForbiddenError, getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import { moderateContentReview } from "~/lib/models/content-reviews";
import { getReviewId } from "~/lib/reviews/request";

export const dynamic = "force-dynamic";

const schema = z.object({ resolveReports: z.boolean().optional(), status: z.enum(["HIDDEN", "PUBLISHED"]) });

export const PUT = (req: Request, { params }: { params: Promise<{ reviewId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    if (session.user.role !== "admin") throw new ForbiddenError("Only administrators can moderate reviews");

    await rateLimiters.review.check(session.user.id);
    const reviewId = await getReviewId(params);

    const { resolveReports, status } = await validateRequest(req, schema);
    await moderateContentReview(reviewId, status, resolveReports ? session.user.id : null);

    return Response.json({ success: true });
  });
