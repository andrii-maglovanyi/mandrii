import { stackMiddlewares } from "~/proxies/stackHandler";
import { withContentSecurityPolicy } from "~/proxies/withContentSecurityPolicy";

import { withAdmin } from "./proxies/withAdmin";
import { withLanguage } from "./proxies/withLanguage";
import { withRef } from "./proxies/withRef";

const middlewares = [withAdmin, withRef, withLanguage, withContentSecurityPolicy];

export default stackMiddlewares(middlewares);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - static (static assets)
     */
    "/",
    "/(en|uk)/:path*",
    {
      missing: [
        { key: "next-router-prefetch", type: "header" },
        { key: "purpose", type: "header", value: "prefetch" },
      ],
      source: "/((?!admin|api|cv|_next/static|_next/image|services|static|favicon\\.ico|manifest\\.json).*)",
    },
  ],
};
