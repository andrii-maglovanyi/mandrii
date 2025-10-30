import createMiddleware from "next-intl/middleware";
import { NextFetchEvent, NextRequest } from "next/server";

import { routing } from "~/i18n/routing";

import { MiddlewareFactory } from "./stackHandler";

const intlMiddleware = createMiddleware(routing);

export const withLanguage: MiddlewareFactory = (next) => {
  return async function middleware(request: NextRequest, event: NextFetchEvent) {
    const intlResponse = await intlMiddleware(request);

    if (intlResponse) return intlResponse;

    return next(request, event);
  };
};
