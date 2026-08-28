import { kv } from "@vercel/kv";
import { z } from "zod";

import { ForbiddenError, getApiContext, validateRequest, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";
import { UrlHelper } from "~/lib/url-helper";

const schema = z.union([z.object({ venueId: z.uuid() }), z.object({ eventId: z.uuid() })]);

const getTarget = (data: z.infer<typeof schema>) =>
  "venueId" in data ? { id: data.venueId, type: "venue" as const } : { id: data.eventId, type: "event" as const };

export const GET = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    const params = Object.fromEntries(new URL(req.url).searchParams);
    const parsed = schema.safeParse(params);
    if (!parsed.success) throw new ForbiddenError("A venue or event is required");
    const target = getTarget(parsed.data);
    const [content] = await sql<Array<{ id: string }>>`
      SELECT id FROM ${target.type === "venue" ? sql`venues` : sql`events`}
      WHERE id = ${target.id} AND owner_id = ${session.user.id}
    `;
    if (!content) throw new ForbiddenError("You do not own this content");
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return Response.json({ scans: 0, tracked: false });
    }
    const scans = (await kv.get<number>(`ref:${target.type}-${target.id}:hits`)) ?? 0;
    return Response.json({ scans, tracked: true });
  });

export const POST = (req: Request) =>
  withErrorHandling(async () => {
    const { session } = await getApiContext(req, { withAuth: true });
    const data = await validateRequest(req, schema);
    const target = getTarget(data);
    const [content] = await sql<Array<{ slug: string }>>`
      SELECT slug FROM ${target.type === "venue" ? sql`venues` : sql`events`}
      WHERE id = ${target.id} AND owner_id = ${session.user.id}
    `;
    if (!content) throw new ForbiddenError("You do not own this content");

    const topic = `${target.type}-${target.id}`;
    const url = UrlHelper.buildUrl(`/${target.type === "venue" ? "venues" : "events"}/${content.slug}`);
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return Response.json({ tracked: false, url });
    }
    const key = `ref:${topic}`;
    const existing = await kv.get<{ hits?: number }>(key);
    await kv.set(key, { contentId: target.id, contentType: target.type, hits: existing?.hits ?? 0, url });

    return Response.json({ topic, tracked: true, url: `https://ref.${UrlHelper.getProductionHostname()}/${topic}` });
  });
