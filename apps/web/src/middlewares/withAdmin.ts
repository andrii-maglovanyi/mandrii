import type { NextFetchEvent, NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { MiddlewareFactory } from "./stackHandler";

export const withAdmin: MiddlewareFactory = (next) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const hostname = request.headers.get("host") || "";
    const url = request.nextUrl.clone();

    if (hostname.startsWith("admin.")) {
      url.pathname = `/admin${url.pathname}`;
      return NextResponse.rewrite(url);
    }

    return next(request, _next);
  };
};
