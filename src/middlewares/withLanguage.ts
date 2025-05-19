import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";

import { routing } from "~/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export function withLanguage(next) {
  return async function middleware(req: NextRequest) {
    const intlResponse = await intlMiddleware(req);

    // If intl handled the response, return it (i.e. redirect or locale injection)
    if (intlResponse) return intlResponse;

    // Otherwise, continue with the next middleware
    return next(req);
  };
}
