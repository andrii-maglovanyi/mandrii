import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "~/lib/api";
import sql from "~/lib/db/db";
import { RatingTargetType } from "~/lib/ratings/types";
import {
  CURRENT_REVIEW_QUESTION_SET,
  hasValidReviewAspectRatings,
  toReviewQuestionSetVersion,
} from "~/lib/reviews/questions";
import {
  ContentReview,
  ContentReviewsResponse,
  ContentReviewResponse,
  ReviewSort,
  ReviewVote,
} from "~/lib/reviews/types";

type ReviewRow = {
  aspect_ratings: Record<string, number>;
  author_id: string;
  author_image: null | string;
  author_name: null | string;
  created_at: Date | string;
  helpful_count?: number | string;
  id: string;
  has_reported: boolean;
  rating: number;
  response_author_id: null | string;
  response_author_image: null | string;
  response_author_name: null | string;
  response_body: null | string;
  response_created_at: Date | string | null;
  response_id: null | string;
  response_updated_at: Date | string | null;
  review_body: string;
  review_question_set: number;
  updated_at: Date | string;
};

type ReviewVoteSummaryRow = {
  content_rating_id: string;
  helpful_count: number | string;
  my_vote: ReviewVote | null;
  not_helpful_count: number | string;
};

type ReviewTarget = {
  context: string;
  owner_id: null | string;
  status: string;
  user_id: null | string;
};

type AspectAverageRow = {
  average: number | string;
  key: string;
};

type ContentSummaryRow = {
  average: number | string;
  rating_count: number | string;
  review_count: number | string;
};

export type CreatedReviewReport = {
  reviewAuthorName: null | string;
  reviewBody: string;
  targetName: string;
  targetType: "event" | "venue";
};

const hasSameAspectRatings = (left: Record<string, number>, right: Record<string, number>) => {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every((key, index) => key === rightKeys[index] && left[key] === right[key])
  );
};

const toReview = (row: ReviewRow, canVote = false, vote?: ReviewVoteSummaryRow): ContentReview => ({
  aspectRatings: row.aspect_ratings,
  author: {
    id: row.author_id,
    image: row.author_image,
    name: row.author_name || "Community member",
  },
  body: row.review_body,
  canVote,
  createdAt: new Date(row.created_at).toISOString(),
  id: row.id,
  helpfulCount: Number(vote?.helpful_count ?? 0),
  hasReported: row.has_reported,
  myVote: vote?.my_vote ?? null,
  notHelpfulCount: Number(vote?.not_helpful_count ?? 0),
  ownerResponse:
    row.response_id && row.response_body && row.response_created_at && row.response_updated_at && row.response_author_id
      ? {
          author: {
            id: row.response_author_id,
            image: row.response_author_image,
            name: row.response_author_name || "Content owner",
          },
          body: row.response_body,
          createdAt: new Date(row.response_created_at).toISOString(),
          id: row.response_id,
          updatedAt: new Date(row.response_updated_at).toISOString(),
        }
      : null,
  questionSet: toReviewQuestionSetVersion(row.review_question_set),
  rating: row.rating,
  updatedAt: new Date(row.updated_at).toISOString(),
});

const getReviewTarget = async (type: RatingTargetType, targetId: string): Promise<ReviewTarget> => {
  const [target] =
    type === "venue"
      ? await sql<ReviewTarget[]>`
          SELECT category AS context, owner_id, status, user_id
          FROM venues
          WHERE id = ${targetId}
            AND status IN ('ACTIVE', 'ARCHIVED')
        `
      : await sql<ReviewTarget[]>`
          SELECT type AS context, owner_id, status, user_id
          FROM events
          WHERE id = ${targetId}
            AND status IN ('ACTIVE', 'COMPLETED', 'ARCHIVED')
        `;

  if (!target) throw new NotFoundError("The content you want to review was not found");

  return target;
};

export async function getContentReviews(
  type: RatingTargetType,
  targetId: string,
  viewerId: null | string,
  cursor: null | { createdAt: string; helpfulCount?: number; id: string },
  limit: number,
  sort: ReviewSort,
): Promise<ContentReviewsResponse> {
  const target = await getReviewTarget(type, targetId);
  const targetColumn = type === "venue" ? sql`r.venue_id` : sql`r.event_id`;
  const cursorFilter =
    sort === "newest"
      ? sql`
          (${cursor?.createdAt ?? null}::timestamptz IS NULL
            OR r.created_at < ${cursor?.createdAt ?? null}::timestamptz
            OR (r.created_at = ${cursor?.createdAt ?? null}::timestamptz AND r.id < ${cursor?.id ?? null}::uuid))
        `
      : sql`
          (${cursor?.helpfulCount ?? null}::int IS NULL
            OR helpful.helpful_count < ${cursor?.helpfulCount ?? null}::int
            OR (helpful.helpful_count = ${cursor?.helpfulCount ?? null}::int AND r.created_at < ${cursor?.createdAt ?? null}::timestamptz)
            OR (helpful.helpful_count = ${cursor?.helpfulCount ?? null}::int AND r.created_at = ${cursor?.createdAt ?? null}::timestamptz AND r.id < ${cursor?.id ?? null}::uuid))
        `;
  const orderBy =
    sort === "newest"
      ? sql`r.created_at DESC, r.id DESC`
      : sql`helpful.helpful_count DESC, r.created_at DESC, r.id DESC`;
  const helpfulJoin =
    sort === "helpful"
      ? sql`
          LEFT JOIN LATERAL (
            SELECT COUNT(*)::int AS helpful_count
            FROM content_review_votes
            WHERE content_rating_id = r.id
              AND vote = 'HELPFUL'
          ) helpful ON TRUE
        `
      : sql``;
  const helpfulCount = sort === "helpful" ? sql`helpful.helpful_count` : sql`0::int`;

  const rowsPromise = sql<ReviewRow[]>`
    SELECT r.id, r.rating, r.review_body, r.aspect_ratings, r.review_question_set, r.created_at, r.updated_at,
           u.id AS author_id, u.name AS author_name, u.image AS author_image,
           response.id AS response_id, response.body AS response_body,
           response.created_at AS response_created_at, response.updated_at AS response_updated_at,
           response_author.id AS response_author_id, response_author.name AS response_author_name,
           response_author.image AS response_author_image, ${helpfulCount} AS helpful_count,
           EXISTS (
             SELECT 1
             FROM content_review_reports report
             WHERE report.content_rating_id = r.id
               AND report.user_id = ${viewerId}
               -- Reports from an earlier revision do not apply to this review.
               AND report.created_at >= r.updated_at
           ) AS has_reported
    FROM content_ratings r
    JOIN users u ON u.id = r.user_id
    LEFT JOIN content_review_responses response ON response.content_rating_id = r.id
    LEFT JOIN users response_author ON response_author.id = response.user_id
    ${helpfulJoin}
    WHERE ${targetColumn} = ${targetId}
      AND r.review_body IS NOT NULL
      AND r.review_status = 'PUBLISHED'
      AND ${cursorFilter}
    ORDER BY ${orderBy}
    LIMIT ${limit + 1}
  `;

  const contentSummaryPromise = sql<ContentSummaryRow[]>`
    SELECT
      COUNT(*)::int AS rating_count,
      COUNT(*) FILTER (WHERE r.review_body IS NOT NULL AND r.review_status = 'PUBLISHED')::int AS review_count,
      COALESCE(ROUND(AVG(r.rating), 1), 0) AS average
    FROM content_ratings r
    WHERE ${targetColumn} = ${targetId}
  `;
  const aspectAveragesPromise = sql<AspectAverageRow[]>`
    SELECT aspect.key, ROUND(AVG((aspect.value)::numeric), 1) AS average
    FROM content_ratings r
    CROSS JOIN LATERAL jsonb_each_text(r.aspect_ratings) AS aspect(key, value)
    WHERE ${targetColumn} = ${targetId}
      AND r.review_body IS NOT NULL
      AND r.review_status = 'PUBLISHED'
      AND r.review_question_set = ${CURRENT_REVIEW_QUESTION_SET}
    GROUP BY aspect.key
  `;
  const ownRowsPromise = viewerId
    ? sql<ReviewRow[]>`
        SELECT r.id, r.rating, r.review_body, r.aspect_ratings, r.review_question_set, r.created_at, r.updated_at,
               u.id AS author_id, u.name AS author_name, u.image AS author_image,
               response.id AS response_id, response.body AS response_body,
               response.created_at AS response_created_at, response.updated_at AS response_updated_at,
               response_author.id AS response_author_id, response_author.name AS response_author_name,
               response_author.image AS response_author_image,
               EXISTS (
                 SELECT 1
                 FROM content_review_reports report
                 WHERE report.content_rating_id = r.id
                   AND report.user_id = ${viewerId}
                   -- Reports from an earlier revision do not apply to this review.
                   AND report.created_at >= r.updated_at
               ) AS has_reported
        FROM content_ratings r
        JOIN users u ON u.id = r.user_id
        LEFT JOIN content_review_responses response ON response.content_rating_id = r.id
        LEFT JOIN users response_author ON response_author.id = response.user_id
        WHERE r.user_id = ${viewerId}
          AND ${targetColumn} = ${targetId}
          AND r.review_body IS NOT NULL
          AND r.review_status = 'PUBLISHED'
      `
    : Promise.resolve<ReviewRow[]>([]);

  const [rows, ownRows, [summaryRow], aspectRows] = await Promise.all([
    rowsPromise,
    ownRowsPromise,
    contentSummaryPromise,
    aspectAveragesPromise,
  ]);
  const [ownRow] = ownRows;
  const hasMore = rows.length > limit;
  const pageRows = rows.slice(0, limit);
  const lastRow = pageRows.at(-1);

  const reviewIds = [...new Set([...pageRows.map((row) => row.id), ...(ownRow ? [ownRow.id] : [])])];
  const voteSummaryRows = reviewIds.length
    ? await sql<ReviewVoteSummaryRow[]>`
        SELECT
          content_rating_id,
          COUNT(*) FILTER (WHERE vote = 'HELPFUL')::int AS helpful_count,
          COUNT(*) FILTER (WHERE vote = 'NOT_HELPFUL')::int AS not_helpful_count,
          MAX(vote) FILTER (WHERE user_id = ${viewerId}) AS my_vote
        FROM content_review_votes
        WHERE content_rating_id IN ${sql(reviewIds)}
        GROUP BY content_rating_id
      `
    : [];
  const voteSummaryByReviewId = new Map(voteSummaryRows.map((row) => [row.content_rating_id, row]));
  const canVote = Boolean(viewerId && target.user_id !== viewerId && target.owner_id !== viewerId);
  const page = pageRows.map((row) =>
    toReview(row, canVote && row.author_id !== viewerId, voteSummaryByReviewId.get(row.id)),
  );
  return {
    averageRating: Number(summaryRow?.average ?? 0),
    aspectAverages: Object.fromEntries(aspectRows.map((row) => [row.key, Number(row.average)])),
    canReview: Boolean(
      viewerId &&
        target.user_id !== viewerId &&
        target.owner_id !== viewerId &&
        (type === "venue" || target.status === "COMPLETED"),
    ),
    canRespond: Boolean(viewerId && target.owner_id === viewerId),
    nextCursor:
      hasMore && lastRow
        ? sort === "newest"
          ? `newest|${new Date(lastRow.created_at).toISOString()}|${lastRow.id}`
          : `helpful|${lastRow.helpful_count ?? 0}|${new Date(lastRow.created_at).toISOString()}|${lastRow.id}`
        : null,
    ownReview: ownRow ? toReview(ownRow, false, voteSummaryByReviewId.get(ownRow.id)) : null,
    ratingTotal: Number(summaryRow?.rating_count ?? 0),
    reviews: page,
    total: Number(summaryRow?.review_count ?? 0),
  };
}

export async function toggleContentReviewVote(
  reviewId: string,
  userId: string,
  vote: ReviewVote,
): Promise<{ active: boolean }> {
  return sql.begin(async (transaction) => {
    const [review] = await transaction<Array<{ id: string }>>`
      SELECT r.id
      FROM content_ratings r
      LEFT JOIN venues v ON v.id = r.venue_id
      LEFT JOIN events e ON e.id = r.event_id
      WHERE r.id = ${reviewId}
        AND r.review_body IS NOT NULL
        AND r.review_status = 'PUBLISHED'
        AND r.user_id IS DISTINCT FROM ${userId}
        AND v.owner_id IS DISTINCT FROM ${userId}
        AND v.user_id IS DISTINCT FROM ${userId}
        AND e.owner_id IS DISTINCT FROM ${userId}
        AND e.user_id IS DISTINCT FROM ${userId}
      FOR UPDATE OF r
    `;

    if (!review) throw new ForbiddenError("You cannot vote on this review");

    const [result] = await transaction<Array<{ active: boolean }>>`
      WITH removed AS (
        DELETE FROM content_review_votes
        WHERE content_rating_id = ${reviewId}
          AND user_id = ${userId}
          AND vote = ${vote}
        RETURNING 1
      ), inserted AS (
        INSERT INTO content_review_votes (content_rating_id, user_id, vote)
        SELECT ${reviewId}, ${userId}, ${vote}
        WHERE NOT EXISTS (SELECT 1 FROM removed)
        ON CONFLICT (content_rating_id, user_id)
        DO UPDATE SET vote = EXCLUDED.vote
        RETURNING 1
      )
      SELECT EXISTS (SELECT 1 FROM inserted) AS active
    `;

    return { active: result?.active ?? false };
  });
}

export async function upsertContentReview(
  type: RatingTargetType,
  targetId: string,
  userId: string,
  rating: number,
  body: string,
  aspectRatings: Record<string, number>,
): Promise<{ shouldSendNotification: boolean }> {
  const target = await getReviewTarget(type, targetId);
  const ratingTargetColumn = type === "venue" ? sql`venue_id` : sql`event_id`;

  if (target.user_id === userId || target.owner_id === userId) {
    throw new ForbiddenError("You cannot review content you manage");
  }
  if (type === "event" && target.status !== "COMPLETED") {
    throw new ForbiddenError("Reviews are available after an event is completed");
  }

  return sql.begin(async (transaction) => {
    await transaction`SELECT pg_advisory_xact_lock(hashtextextended(${`${type}:${targetId}:${userId}`}, 0))`;
    const [existing] = await transaction<
      Array<{
        aspect_ratings: Record<string, number>;
        has_review: boolean;
        id: string;
        rating: number;
        review_body: null | string;
        review_question_set: number;
        review_status: "HIDDEN" | "PUBLISHED";
      }>
    >`
      SELECT id, rating, review_body, aspect_ratings, review_question_set, review_body IS NOT NULL AS has_review, review_status
      FROM content_ratings
      WHERE user_id = ${userId} AND ${ratingTargetColumn} = ${targetId}
    `;

    const questionSet =
      existing?.has_review && existing.review_status === "PUBLISHED"
        ? toReviewQuestionSetVersion(existing.review_question_set)
        : CURRENT_REVIEW_QUESTION_SET;
    if (!hasValidReviewAspectRatings(type, target.context, aspectRatings, questionSet)) {
      throw new BadRequestError("The review questions are no longer valid. Please refresh and try again.");
    }

    const reviewChanged =
      existing?.has_review &&
      (existing.rating !== rating ||
        existing.review_body !== body ||
        !hasSameAspectRatings(existing.aspect_ratings, aspectRatings));

    // Avoid changing the timestamp or reopening report eligibility when an
    // unchanged review is submitted from an open editor.
    if (existing?.has_review && existing.review_status === "PUBLISHED" && !reviewChanged) {
      return { shouldSendNotification: false };
    }

    await transaction`
      INSERT INTO content_ratings (user_id, ${ratingTargetColumn}, rating, review_body, aspect_ratings, review_question_set)
      VALUES (${userId}, ${targetId}, ${rating}, ${body}, ${sql.json(aspectRatings)}, ${questionSet})
      ON CONFLICT (user_id, ${ratingTargetColumn})
      DO UPDATE SET
        rating = EXCLUDED.rating,
        review_body = EXCLUDED.review_body,
        aspect_ratings = EXCLUDED.aspect_ratings,
        review_question_set = EXCLUDED.review_question_set,
        review_status = 'PUBLISHED'
    `;

    if (existing?.review_status === "HIDDEN" || reviewChanged) {
      await transaction`
        WITH removed_response AS (
          DELETE FROM content_review_responses
          WHERE content_rating_id = ${existing.id}
        ), removed_votes AS (
          DELETE FROM content_review_votes
          WHERE content_rating_id = ${existing.id}
        )
        UPDATE content_review_reports
        SET status = 'RESOLVED', resolved_at = NOW(), resolved_by = NULL
        WHERE content_rating_id = ${existing.id}
          AND status = 'OPEN'
          AND ${existing.review_status === "HIDDEN" || reviewChanged}
      `;
    }

    // A removed or hidden review is no longer the review that was reported.
    // `content_ratings` deliberately keeps the same row for a user's rating,
    // so clear its old report records before it becomes a new written review.
    if (existing && (!existing.has_review || existing.review_status === "HIDDEN")) {
      await transaction`
        DELETE FROM content_review_reports
        WHERE content_rating_id = ${existing.id}
      `;
    }

    // A previously hidden review is a new public contribution when its author
    // writes it again, so owners should receive the same notification as for a
    // first review. Ordinary edits deliberately do not send another alert.
    return { shouldSendNotification: !existing?.has_review || existing?.review_status === "HIDDEN" };
  });
}

export async function removeContentReview(type: RatingTargetType, targetId: string, userId: string): Promise<void> {
  const ratingTargetColumn = type === "venue" ? sql`venue_id` : sql`event_id`;

  await sql`
      WITH cleared_review AS (
        UPDATE content_ratings
        SET review_body = NULL, aspect_ratings = '{}'::jsonb
        WHERE user_id = ${userId} AND ${ratingTargetColumn} = ${targetId}
        RETURNING id
      ), deleted_responses AS (
        DELETE FROM content_review_responses response
        USING cleared_review
        WHERE response.content_rating_id = cleared_review.id
        RETURNING response.id
      ), deleted_votes AS (
        DELETE FROM content_review_votes vote
        USING cleared_review
        WHERE vote.content_rating_id = cleared_review.id
        RETURNING vote.content_rating_id
      ), deleted_reports AS (
        DELETE FROM content_review_reports report
        USING cleared_review
        WHERE report.content_rating_id = cleared_review.id
        RETURNING report.id
      ), deleted_pending_deliveries AS (
        DELETE FROM review_telegram_deliveries delivery
        USING cleared_review
        WHERE delivery.content_rating_id = cleared_review.id
          AND delivery.status IN ('PENDING', 'PROCESSING')
        RETURNING delivery.id
      )
      SELECT
        (SELECT COUNT(*) FROM deleted_responses) AS responses_deleted,
        (SELECT COUNT(*) FROM deleted_votes) AS votes_deleted,
        (SELECT COUNT(*) FROM deleted_reports) AS reports_deleted,
        (SELECT COUNT(*) FROM deleted_pending_deliveries) AS pending_deliveries_deleted
    `;
}

export async function upsertContentReviewResponse(reviewId: string, userId: string, body: string): Promise<void> {
  await sql.begin(async (transaction) => {
    const [review] = await transaction<Array<{ id: string }>>`
      SELECT r.id
      FROM content_ratings r
      LEFT JOIN venues v ON v.id = r.venue_id
      LEFT JOIN events e ON e.id = r.event_id
      WHERE r.id = ${reviewId}
        AND r.review_body IS NOT NULL
        AND r.review_status = 'PUBLISHED'
        AND (
          v.owner_id = ${userId}
          OR e.owner_id = ${userId}
        )
      FOR UPDATE OF r
    `;

    if (!review) throw new ForbiddenError("You can only respond to reviews for content you own");

    await transaction`
      INSERT INTO content_review_responses (content_rating_id, user_id, body)
      VALUES (${reviewId}, ${userId}, ${body})
      ON CONFLICT (content_rating_id)
      DO UPDATE SET user_id = EXCLUDED.user_id, body = EXCLUDED.body
    `;
  });
}

export async function removeContentReviewResponse(reviewId: string, userId: string): Promise<void> {
  await sql.begin(async (transaction) => {
    const [review] = await transaction<Array<{ id: string }>>`
      SELECT r.id
      FROM content_ratings r
      LEFT JOIN venues v ON v.id = r.venue_id
      LEFT JOIN events e ON e.id = r.event_id
      WHERE r.id = ${reviewId}
        AND r.review_body IS NOT NULL
        AND r.review_status = 'PUBLISHED'
        AND (
          v.owner_id = ${userId}
          OR e.owner_id = ${userId}
        )
      FOR UPDATE OF r
    `;

    if (!review) throw new ForbiddenError("You can only respond to reviews for content you own");

    await transaction`
      DELETE FROM content_review_responses
      WHERE content_rating_id = ${reviewId}
    `;
  });
}

export async function moderateContentReview(
  reviewId: string,
  status: "HIDDEN" | "PUBLISHED",
  resolvedBy: null | string,
): Promise<void> {
  await sql.begin(async (transaction) => {
    const [review] = await transaction<Array<{ id: string }>>`
      UPDATE content_ratings
      SET review_status = ${status}
      WHERE id = ${reviewId} AND review_body IS NOT NULL
      RETURNING id
    `;
    if (!review) throw new NotFoundError("The review you want to moderate was not found");

    if (status === "HIDDEN") {
      await transaction`
        DELETE FROM review_telegram_deliveries
        WHERE content_rating_id = ${reviewId}
          AND status IN ('PENDING', 'PROCESSING')
      `;
    }

    if (resolvedBy) {
      await transaction`
        UPDATE content_review_reports
        SET status = 'RESOLVED', resolved_at = NOW(), resolved_by = ${resolvedBy}
        WHERE content_rating_id = ${reviewId} AND status = 'OPEN'
      `;
    }
  });
}

export async function reportContentReview(
  reviewId: string,
  userId: string,
  reason: string,
): Promise<CreatedReviewReport> {
  return sql.begin(async (transaction) => {
    const [review] = await transaction<
      Array<
        CreatedReviewReport & {
          id: string;
        }
      >
    >`
      SELECT r.id,
             r.review_body AS "reviewBody",
             review_author.name AS "reviewAuthorName",
             COALESCE(v.name, e.title_en, e.title_uk, 'Deleted content') AS "targetName",
             CASE WHEN r.venue_id IS NULL THEN 'event' ELSE 'venue' END AS "targetType"
      FROM content_ratings r
      JOIN users review_author ON review_author.id = r.user_id
      LEFT JOIN venues v ON v.id = r.venue_id
      LEFT JOIN events e ON e.id = r.event_id
      WHERE r.id = ${reviewId}
        AND r.review_body IS NOT NULL
        AND r.review_status = 'PUBLISHED'
        AND r.user_id IS DISTINCT FROM ${userId}
      FOR UPDATE OF r
    `;
    if (!review) throw new ForbiddenError("You cannot report this review");

    const [report] = await transaction<Array<{ id: string }>>`
      INSERT INTO content_review_reports (content_rating_id, user_id, reason)
      VALUES (${reviewId}, ${userId}, ${reason})
      ON CONFLICT (content_rating_id, user_id)
      DO UPDATE SET
        created_at = NOW(),
        reason = EXCLUDED.reason,
        resolved_at = NULL,
        resolved_by = NULL,
        status = 'OPEN'
      -- A written review can be removed and later recreated on the same
      -- content_rating row. In that case its updated timestamp is newer than
      -- the old report, so that report belongs to the previous review.
      WHERE content_review_reports.created_at < (
        SELECT updated_at
        FROM content_ratings
        WHERE id = EXCLUDED.content_rating_id
      )
      RETURNING id
    `;

    if (!report) throw new ConflictError("You have already reported this review");

    return review;
  });
}
