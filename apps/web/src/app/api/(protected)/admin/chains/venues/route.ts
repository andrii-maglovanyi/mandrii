import { withErrorHandling } from "~/lib/api";
import { requireChainAdmin } from "~/lib/chains/authorization";
import sql from "~/lib/db/db";

export const dynamic = "force-dynamic";

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    await requireChainAdmin(req);

    const query = new URL(req.url).searchParams.get("q")?.trim().slice(0, 120) ?? "";
    if (query.length < 2) return Response.json({ venues: [] });

    const venues = await sql<Array<{ category: string; chain_id: null | string; city: null | string; country: null | string; id: string; name: string; slug: string }>>`
      SELECT id, name, slug, category, city, country, chain_id
      FROM venues
      WHERE name ILIKE ${`%${query.replace(/[\\%_]/g, "\\$&")}%`}
         OR city ILIKE ${`%${query.replace(/[\\%_]/g, "\\$&")}%`}
      ORDER BY LOWER(name), id
      LIMIT 25
    `;

    return Response.json({ venues });
  });
