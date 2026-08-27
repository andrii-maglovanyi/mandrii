import { z } from "zod";

import { auth } from "~/lib/auth";
import { BadRequestError, getApiContext, rateLimiters, validateRequest, withErrorHandling } from "~/lib/api";
import { getContentRatingSummary, removeContentRating, upsertContentRating } from "~/lib/models/content-ratings";
import { RATING_TARGET_TYPES } from "~/lib/ratings/types";

export const dynamic = "force-dynamic";

const targetSchema = z.object({
  targetId: z.string().uuid(),
  type: z.enum(RATING_TARGET_TYPES),
});

const ratingSchema = targetSchema.extend({
  rating: z.number().int().min(1).max(5),
});

const getTargetFromSearchParams = (req: Request) => {
  const { searchParams } = new URL(req.url);
  const parsed = targetSchema.safeParse({
    targetId: searchParams.get("targetId"),
    type: searchParams.get("type"),
  });

  if (!parsed.success) throw new BadRequestError("A valid rating target is required");

  return parsed.data;
};

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    await rateLimiters.general.check();
    const { targetId, type } = getTargetFromSearchParams(req);
    const session = await auth();

    return Response.json(await getContentRatingSummary(type, targetId, session?.user?.id ?? null));
  });

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.rating.check(session.user.id);
    const { rating, targetId, type } = await validateRequest(req, ratingSchema);

    await upsertContentRating(type, targetId, session.user.id, rating);

    return Response.json(await getContentRatingSummary(type, targetId, session.user.id));
  });

export const DELETE = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    await rateLimiters.rating.check(session.user.id);
    const { targetId, type } = await validateRequest(req, targetSchema);

    await removeContentRating(type, targetId, session.user.id);

    return Response.json(await getContentRatingSummary(type, targetId, session.user.id));
  });
