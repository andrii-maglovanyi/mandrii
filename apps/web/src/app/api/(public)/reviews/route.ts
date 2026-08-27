import { z } from "zod";

import { auth } from "~/lib/auth";
import { BadRequestError, getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import { getContentReviews, removeContentReview, upsertContentReview } from "~/lib/models/content-reviews";
import { RATING_TARGET_TYPES } from "~/lib/ratings/types";
import { ReviewSort } from "~/lib/reviews/types";
import { sendEventReviewTelegramNotification, sendVenueReviewTelegramNotification } from "~/lib/telegram/bot";

export const dynamic = "force-dynamic";

const targetSchema = z.object({
  targetId: z.string().uuid(),
  type: z.enum(RATING_TARGET_TYPES),
});

const reviewSchema = targetSchema.extend({
  aspectRatings: z.record(z.string(), z.number().int().min(1).max(5)),
  body: z.string().trim().min(10).max(1500),
  rating: z.number().int().min(1).max(5),
});

const sortSchema = z.enum(["newest", "helpful"]);

const parseCursor = (value: string | null, sort: ReviewSort) => {
  if (!value) return null;

  const parts = value.split("|");
  const isLegacyNewestCursor = parts.length === 2;
  if (isLegacyNewestCursor && sort === "newest") {
    const [createdAt, id] = parts;
    if (
      !createdAt ||
      !id ||
      !z.string().datetime({ offset: true }).safeParse(createdAt).success ||
      !z.string().uuid().safeParse(id).success
    ) {
      throw new BadRequestError("A valid review cursor is required");
    }
    return { createdAt, id };
  }

  if (sort === "newest") {
    const [cursorSort, createdAt, id] = parts;
    if (
      cursorSort !== sort ||
      !createdAt ||
      !id ||
      parts.length !== 3 ||
      !z.string().datetime({ offset: true }).safeParse(createdAt).success ||
      !z.string().uuid().safeParse(id).success
    ) {
      throw new BadRequestError("A valid review cursor is required");
    }
    return { createdAt, id };
  }

  const [cursorSort, helpfulCount, createdAt, id] = parts;
  if (
    cursorSort !== sort ||
    !createdAt ||
    !id ||
    !z.string().datetime({ offset: true }).safeParse(createdAt).success ||
    !z.string().uuid().safeParse(id).success ||
    !helpfulCount ||
    parts.length !== 4 ||
    !z.coerce.number().int().min(0).safeParse(helpfulCount).success
  ) {
    throw new BadRequestError("A valid review cursor is required");
  }

  return { createdAt, helpfulCount: Number(helpfulCount), id };
};

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    await rateLimiters.general.check();
    const { searchParams } = new URL(req.url);
    const target = targetSchema.safeParse({
      targetId: searchParams.get("targetId"),
      type: searchParams.get("type"),
    });
    if (!target.success) throw new BadRequestError("A valid review target is required");
    const sort = sortSchema.safeParse(searchParams.get("sort") ?? "newest");
    if (!sort.success) throw new BadRequestError("A valid review sort is required");

    const requestedLimit = Number(searchParams.get("limit") ?? 10);
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 20) : 10;
    const session = await auth();

    return Response.json(
      await getContentReviews(
        target.data.type,
        target.data.targetId,
        session?.user?.id ?? null,
        parseCursor(searchParams.get("cursor"), sort.data),
        limit,
        sort.data,
      ),
    );
  });

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.review.check(session.user.id);
    const { aspectRatings, body, rating, targetId, type } = await validateRequest(req, reviewSchema);

    const { shouldSendNotification } = await upsertContentReview(
      type,
      targetId,
      session.user.id,
      rating,
      body,
      aspectRatings,
    );

    if (type === "venue" && shouldSendNotification) {
      try {
        await sendVenueReviewTelegramNotification({
          rating,
          reviewBody: body,
          reviewerId: session.user.id,
          venueId: targetId,
        });
      } catch (error) {
        // The review is already published; delivery failures must not undo it.
        console.error("Telegram review notification enqueue failed:", error);
      }
    }
    if (type === "event" && shouldSendNotification) {
      try {
        await sendEventReviewTelegramNotification({ eventId: targetId, reviewerId: session.user.id });
      } catch (error) {
        console.error("Telegram event review notification enqueue failed:", error);
      }
    }

    return Response.json({ success: true });
  });

export const DELETE = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.review.check(session.user.id);
    const { targetId, type } = await validateRequest(req, targetSchema);

    await removeContentReview(type, targetId, session.user.id);

    return Response.json({ success: true });
  });
