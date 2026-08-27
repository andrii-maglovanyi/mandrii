import { ConflictError, ForbiddenError, NotFoundError } from "~/lib/api";
import sql from "~/lib/db/db";
import { ContentRatingSummary, RatingTargetType } from "~/lib/ratings/types";

type SummaryRow = {
  average: number | string;
  can_rate: boolean;
  count: number | string;
  has_review: boolean;
  my_rating: null | number;
};

const toSummary = (row: SummaryRow): ContentRatingSummary => ({
  average: Number(row.average),
  canRate: row.can_rate,
  count: Number(row.count),
  hasReview: row.has_review,
  myRating: row.my_rating,
});

export async function getContentRatingSummary(
  type: RatingTargetType,
  targetId: string,
  viewerId: null | string = null,
): Promise<ContentRatingSummary> {
  const [row] =
    type === "venue"
      ? await sql<SummaryRow[]>`
          WITH target AS (
            SELECT user_id, owner_id
            FROM venues
            WHERE id = ${targetId}
              AND status IN ('ACTIVE', 'ARCHIVED')
          )
          SELECT
            COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average,
            COUNT(r.id)::int AS count,
            MAX(r.rating) FILTER (WHERE r.user_id = ${viewerId}::uuid) AS my_rating,
            COALESCE(BOOL_OR(r.user_id = ${viewerId}::uuid AND r.review_body IS NOT NULL), false) AS has_review,
            (${viewerId}::uuid IS NOT NULL
              AND target.user_id IS DISTINCT FROM ${viewerId}::uuid
              AND target.owner_id IS DISTINCT FROM ${viewerId}::uuid) AS can_rate
          FROM target
          LEFT JOIN content_ratings r ON r.venue_id = ${targetId}
          GROUP BY target.user_id, target.owner_id
        `
      : await sql<SummaryRow[]>`
          WITH target AS (
            SELECT user_id, owner_id, status
            FROM events
            WHERE id = ${targetId}
              AND status IN ('ACTIVE', 'COMPLETED', 'ARCHIVED')
          )
          SELECT
            COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average,
            COUNT(r.id)::int AS count,
            MAX(r.rating) FILTER (WHERE r.user_id = ${viewerId}::uuid) AS my_rating,
            COALESCE(BOOL_OR(r.user_id = ${viewerId}::uuid AND r.review_body IS NOT NULL), false) AS has_review,
            (${viewerId}::uuid IS NOT NULL
              AND target.status = 'COMPLETED'
              AND target.user_id IS DISTINCT FROM ${viewerId}::uuid
              AND target.owner_id IS DISTINCT FROM ${viewerId}::uuid) AS can_rate
          FROM target
          LEFT JOIN content_ratings r ON r.event_id = ${targetId}
          GROUP BY target.user_id, target.owner_id, target.status
        `;

  if (!row) throw new NotFoundError("The content you want to rate was not found");

  return toSummary(row);
}

export async function upsertContentRating(
  type: RatingTargetType,
  targetId: string,
  userId: string,
  rating: number,
): Promise<void> {
  const ratingTargetColumn = type === "venue" ? sql`venue_id` : sql`event_id`;
  const [target] =
    type === "venue"
      ? await sql<{ owner_id: null | string; user_id: null | string }[]>`
          SELECT user_id, owner_id
          FROM venues
          WHERE id = ${targetId}
            AND status IN ('ACTIVE', 'ARCHIVED')
        `
      : await sql<{ owner_id: null | string; user_id: null | string }[]>`
          SELECT user_id, owner_id
          FROM events
          WHERE id = ${targetId}
            AND status = 'COMPLETED'
        `;

  if (!target) throw new NotFoundError("The content you want to rate was not found");
  if (target.user_id === userId || target.owner_id === userId) {
    throw new ForbiddenError("You cannot rate content you manage");
  }

  await sql`
    INSERT INTO content_ratings (user_id, ${ratingTargetColumn}, rating)
    VALUES (${userId}, ${targetId}, ${rating})
    ON CONFLICT (user_id, ${ratingTargetColumn})
    DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
  `;
}

export async function removeContentRating(type: RatingTargetType, targetId: string, userId: string): Promise<void> {
  const ratingTargetColumn = type === "venue" ? sql`venue_id` : sql`event_id`;
  const [result] = await sql<Array<{ has_review: boolean }>>`
    WITH target AS (
      SELECT id, review_body
      FROM content_ratings
      WHERE user_id = ${userId} AND ${ratingTargetColumn} = ${targetId}
      FOR UPDATE
    ), deleted AS (
      DELETE FROM content_ratings ratings
      USING target
      WHERE ratings.id = target.id AND target.review_body IS NULL
      RETURNING ratings.id
    )
    SELECT
      EXISTS (SELECT 1 FROM target WHERE review_body IS NOT NULL) AS has_review,
      EXISTS (SELECT 1 FROM deleted) AS deleted
  `;

  if (result?.has_review) {
    throw new ConflictError("Remove your written review before removing its rating");
  }
}
