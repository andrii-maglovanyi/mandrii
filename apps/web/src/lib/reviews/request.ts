import { z } from "zod";

import { BadRequestError } from "~/lib/api";

export async function getReviewId(params: Promise<{ reviewId: string }>): Promise<string> {
  const { reviewId } = await params;
  if (!z.uuid().safeParse(reviewId).success) throw new BadRequestError("A valid review ID is required");
  return reviewId;
}
