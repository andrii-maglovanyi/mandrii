import { captureException } from "@sentry/nextjs";
import { kv } from "@vercel/kv";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import { sendSlackNotification } from "~/lib/slack/ref";

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
        kv.incr(`ref:${topic}:hits`);

        sendSlackNotification(topic, redirect.url).catch((error) => {
          captureException(error);
          console.error("Failed to send Slack notification:", error);
        });

        return NextResponse.redirect(redirect.url);
      } catch (error) {
        console.error("Redirect middleware error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
      }
    }

    return next(request, _next);
  };
};
