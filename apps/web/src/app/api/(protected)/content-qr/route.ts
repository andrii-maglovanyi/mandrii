import { kv } from "@vercel/kv";
import { z } from "zod";

import { ForbiddenError, getApiContext, validateRequest, withErrorHandling } from "~/lib/api";
import sql from "~/lib/db/db";
import { UrlHelper } from "~/lib/url-helper";

const schema = z.union([z.object({ venueId: z.uuid() }), z.object({ eventId: z.uuid() })]);

const getTarget = (data: z.infer<typeof schema>) =>
  "venueId" in data ? { id: data.venueId, type: "venue" as const } : { id: data.eventId, type: "event" as const };

const getRecentDays = (count: number) =>
  Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (count - index - 1));
    return date.toISOString().slice(0, 10);
  });

const formatMonth = (date: string) => date.slice(0, 7);

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
    const period = new URL(req.url).searchParams.get("period");
    const daysToLoad = period === "year" ? 365 : period === "month" ? 30 : 7;
    const days = getRecentDays(daysToLoad);
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      const dailyScans = days.map((date) => ({ count: 0, date }));
      return Response.json({
        scanSeries:
          period === "year"
            ? Object.values(
                dailyScans.reduce<Record<string, { count: number; date: string }>>((series, item) => {
                  const month = formatMonth(item.date);
                  series[month] ??= { count: 0, date: month };
                  return series;
                }, {}),
              )
            : dailyScans,
        scans: 0,
        tracked: false,
      });
    }
    const topic = `${target.type}-${target.id}`;
    const [scans, dailyCounts] = await Promise.all([
      kv.get<number>(`ref:${topic}:hits`),
      kv.mget<Array<null | number>>(...days.map((day) => `ref:${topic}:day:${day}`)),
    ]);
    const dailyScans = days.map((date, index) => ({ count: dailyCounts[index] ?? 0, date }));
    const scanSeries =
      period === "year"
        ? Object.values(
            dailyScans.reduce<Record<string, { count: number; date: string }>>((series, item) => {
              const month = formatMonth(item.date);
              series[month] ??= { count: 0, date: month };
              series[month].count += item.count;
              return series;
            }, {}),
          )
        : dailyScans;

    return Response.json({
      scanSeries,
      scans: scans ?? 0,
      tracked: true,
    });
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
