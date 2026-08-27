import { z } from "zod";

import { getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import { reportContentReview } from "~/lib/models/content-reviews";
import { getReviewId } from "~/lib/reviews/request";
import { sendReviewReportNotification } from "~/lib/slack/review";

export const dynamic = "force-dynamic";

const schema = z.object({ reason: z.string().trim().min(3).max(500) });

export const POST = (req: Request, { params }: { params: Promise<{ reviewId: string }> }) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.review.check(session.user.id);
    const reviewId = await getReviewId(params);

    const { reason } = await validateRequest(req, schema);
    const report = await reportContentReview(reviewId, session.user.id, reason);
    try {
      await sendReviewReportNotification({
        ...report,
        reason,
        reportedBy: { email: session.user.email, name: session.user.name },
      });
    } catch (error) {
      // The report is already durable and visible to admins. A secondary
      // notification failure must not make the user retry and see a conflict.
      console.error("Review report Slack notification failed:", error);
    }

    return Response.json({ success: true });
  });
