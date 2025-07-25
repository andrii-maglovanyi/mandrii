import { kv } from "@vercel/kv";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import { MiddlewareFactory } from "./stackHandler";

interface Redirect {
  hits: number;
  url: string;
}

export const withRef: MiddlewareFactory = (next) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const { hostname, pathname } = request.nextUrl;

    if (hostname.startsWith("ref.")) {
      const rawTopic = pathname.slice(1);

      if (!rawTopic) {
        return next(request, _next);
      }

      const topic = decodeURI(rawTopic);

      try {
        const redirect = await kv.get<Redirect>(`ref:${topic}`);

        if (!redirect) {
          return next(request, _next);
        }

        // Increment hits atomically to avoid race conditions
        await kv.incr(`ref:${topic}:hits`);

        return NextResponse.redirect(redirect.url);
      } catch (error) {
        console.error("Redirect middleware error:", error);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 },
        );
      }
    }

    return next(request, _next);
  };
};
