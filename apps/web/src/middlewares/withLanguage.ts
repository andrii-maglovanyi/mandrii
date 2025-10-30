import createMiddleware from "next-intl/middleware";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { routing } from "~/i18n/routing";
import { MiddlewareFactory } from "./stackHandler";

const intlMiddleware = createMiddleware(routing);

export const withLanguage: MiddlewareFactory = (next) => {
  return async function middleware(request: NextRequest, event: NextFetchEvent) {
    const { pathname } = request.nextUrl;

    // For RSC requests to root, redirect to locale root
    if (pathname === "/" && request.headers.get("RSC") === "1") {
      const locale = request.cookies.get("NEXT_LOCALE")?.value || "en";
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}`;
      return NextResponse.rewrite(url);
    }

    const intlResponse = await intlMiddleware(request);

    if (intlResponse) return intlResponse;

    return next(request, event);
  };
};
