import { z } from "zod";

import { ForbiddenError, getApiContext, validateRequest, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";

const schema = z.object({
  term: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .refine(
      (term) => term.replace(/[^\p{L}\p{N}]+/gu, "").length >= 3,
      "A blocked term needs at least three letters or numbers",
    ),
});
const admin = async (req: Request) => {
  const context = await getApiContext(req, { withAuth: true });
  if (context.session.user.role !== "admin") throw new ForbiddenError("Only administrators can manage blocked terms");
  return context;
};

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    await admin(req);
    return Response.json({
      terms: await sql<Array<{ term: string }>>`SELECT term FROM content_comment_blocked_terms ORDER BY term`,
    });
  });
export const POST = (req: Request) =>
  withErrorHandling(async () => {
    await admin(req);
    const { term } = await validateRequest(req, schema);
    await sql`INSERT INTO content_comment_blocked_terms (term) VALUES (${term.toLowerCase()}) ON CONFLICT DO NOTHING`;
    return Response.json({ success: true });
  });
export const DELETE = (req: Request) =>
  withErrorHandling(async () => {
    await admin(req);
    const { term } = await validateRequest(req, schema);
    await sql`DELETE FROM content_comment_blocked_terms WHERE term = ${term.toLowerCase()}`;
    return Response.json({ success: true });
  });
