import { z } from "zod";

import { getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import { toggleContentReviewVote } from "~/lib/models/content-reviews";
import { getReviewId } from "~/lib/reviews/request";

export const dynamic = "force-dynamic";

const voteSchema = z.object({ vote: z.enum(["HELPFUL", "NOT_HELPFUL"]) });

export const POST = (req: Request, { params }: { params: Promise<{ reviewId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.reviewVote.check(session.user.id);

    const reviewId = await getReviewId(params);
    const { vote } = await validateRequest(req, voteSchema);

    return Response.json(await toggleContentReviewVote(reviewId, session.user.id, vote));
  });
