import { ForbiddenError, getApiContext, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    if (session.user.role !== "admin") throw new ForbiddenError("Only administrators can view comment moderation");
    const comments = await sql<
      Array<{
        body: string;
        comment_id: string;
        created_at: string;
        report_count: number;
        report_reasons: string[];
        target_name: string;
      }>
    >`
      SELECT comment.id AS comment_id, comment.body, comment.created_at,
             COALESCE(venue.name, event.title_en, event.title_uk, 'Deleted content') AS target_name,
             COUNT(report.id)::int AS report_count, array_agg(report.reason) AS report_reasons
      FROM content_update_comment_reports report
      JOIN content_update_comments comment ON comment.id = report.comment_id
      JOIN content_updates update ON update.id = comment.content_update_id
      LEFT JOIN venues venue ON venue.id = update.venue_id
      LEFT JOIN events event ON event.id = update.event_id
      WHERE report.status = 'OPEN' AND comment.deleted_at IS NULL
      GROUP BY comment.id, venue.name, event.title_en, event.title_uk
      ORDER BY COUNT(report.id) DESC, comment.created_at DESC LIMIT 100
    `;
    return Response.json({ comments });
  });
