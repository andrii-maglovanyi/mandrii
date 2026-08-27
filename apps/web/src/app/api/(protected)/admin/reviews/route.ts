import { ForbiddenError, getApiContext, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";

export const dynamic = "force-dynamic";

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    if (session.user.role !== "admin") throw new ForbiddenError("Only administrators can view review moderation");

    const reviews = await sql<
      Array<{
        body: string;
        created_at: string;
        id: string;
        open_report_count: number;
        report_reasons: string[];
        status: "HIDDEN" | "PUBLISHED";
        target_name: string;
      }>
    >`
      WITH reported_reviews AS (
        SELECT r.id, r.review_body AS body, r.review_status AS status, r.created_at,
               COALESCE(v.name, e.title_en, e.title_uk, 'Deleted content') AS target_name,
               COUNT(report.id)::int AS open_report_count,
               array_agg(report.reason) AS report_reasons
        FROM content_review_reports report
        JOIN content_ratings r ON r.id = report.content_rating_id
        LEFT JOIN venues v ON v.id = r.venue_id
        LEFT JOIN events e ON e.id = r.event_id
        WHERE report.status = 'OPEN'
          AND r.review_body IS NOT NULL
        GROUP BY r.id, v.name, e.title_en, e.title_uk
      ), hidden_reviews AS (
        SELECT r.id, r.review_body AS body, r.review_status AS status, r.created_at,
               COALESCE(v.name, e.title_en, e.title_uk, 'Deleted content') AS target_name,
               0::int AS open_report_count,
               '{}'::text[] AS report_reasons
        FROM content_ratings r
        LEFT JOIN venues v ON v.id = r.venue_id
        LEFT JOIN events e ON e.id = r.event_id
        WHERE r.review_body IS NOT NULL
          AND r.review_status = 'HIDDEN'
          AND NOT EXISTS (
            SELECT 1
            FROM content_review_reports report
            WHERE report.content_rating_id = r.id
              AND report.status = 'OPEN'
          )
      ), moderation_reviews AS (
        SELECT *
        FROM reported_reviews
        UNION ALL
        SELECT *
        FROM hidden_reviews
      )
      SELECT *
      FROM moderation_reviews
      ORDER BY (open_report_count > 0) DESC, created_at DESC
      LIMIT 100
    `;
    return Response.json({ reviews });
  });
