import { RatingTargetType } from "~/lib/ratings/types";
import { ReviewQuestionSetVersion } from "~/lib/reviews/questions";

export type ContentReview = {
  aspectRatings: Record<string, number>;
  author: {
    id: string;
    image: null | string;
    name: string;
  };
  body: string;
  canVote: boolean;
  createdAt: string;
  hasReported: boolean;
  id: string;
  helpfulCount: number;
  myVote: ReviewVote | null;
  notHelpfulCount: number;
  ownerResponse: ContentReviewResponse | null;
  questionSet: ReviewQuestionSetVersion;
  rating: number;
  updatedAt: string;
};

export type ReviewVote = "HELPFUL" | "NOT_HELPFUL";
export type ReviewSort = "helpful" | "newest";

export type ContentReviewResponse = {
  author: {
    id: string;
    image: null | string;
    name: string;
  };
  body: string;
  createdAt: string;
  id: string;
  updatedAt: string;
};

export type ContentReviewsResponse = {
  averageRating: number;
  aspectAverages: Record<string, number>;
  canReview: boolean;
  canRespond: boolean;
  nextCursor: null | string;
  ownReview: ContentReview | null;
  ratingTotal: number;
  reviews: ContentReview[];
  total: number;
};

export type ReviewTargetContext = {
  context: string;
  type: RatingTargetType;
};
