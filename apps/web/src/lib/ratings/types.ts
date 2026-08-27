export const RATING_TARGET_TYPES = ["event", "venue"] as const;

export type RatingTargetType = (typeof RATING_TARGET_TYPES)[number];

export type ContentRatingSummary = {
  average: number;
  canRate: boolean;
  count: number;
  hasReview: boolean;
  myRating: null | number;
};
