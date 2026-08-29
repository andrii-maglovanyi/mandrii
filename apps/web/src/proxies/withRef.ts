import { kv } from "@vercel/kv";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import { MiddlewareFactory } from "./stackHandler";

interface Redirect {
  contentId?: string;
  contentType?: "event" | "venue";
  hits: number;
  url: string;
}

export const withRef: MiddlewareFactory = (next) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const { hostname, pathname } = request.nextUrl;

    if (hostname.startsWith("ref.")) {
      const rawTopic = pathname.slice(1);

      if (!rawTopic) {
        return next(request, event);
      }

      const topic = decodeURI(rawTopic);

      try {
        const redirect = await kv.get<Redirect>(`ref:${topic}`);

        if (!redirect) {
          return next(request, event);
        }

        // One Redis pipeline keeps scan tracking to a single background KV
        // request, without delaying the visitor's redirect. Daily buckets are
        // retained long enough for the year view without growing forever.
        const day = new Date().toISOString().slice(0, 10);
        event.waitUntil(
          kv
            .pipeline()
            .incr(`ref:${topic}:hits`)
            .incr(`ref:${topic}:day:${day}`)
            .expire(`ref:${topic}:day:${day}`, 400 * 24 * 60 * 60)
            .exec()
            .catch((error) => {
              console.error("Reference tracking increment failed:", error);
            }),
        );

        fetch(`${request.nextUrl.origin}/api/slack-notify`, {
          body: JSON.stringify({
            contentId: redirect.contentId,
            contentType: redirect.contentType,
            topic,
            url: redirect.url,
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });

        return NextResponse.redirect(redirect.url);
      } catch (error) {
        console.error("Redirect middleware error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
    }

    return next(request, event);
  };
};
