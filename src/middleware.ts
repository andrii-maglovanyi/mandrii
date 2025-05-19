import { stackMiddlewares } from "~/middlewares/stackHandler";
import { withContentSecurityPolicy } from "~/middlewares/withContentSecurityPolicy";

import { withLanguage } from "./middlewares/withLanguage";

const middlewares = [withLanguage, withContentSecurityPolicy];

export default stackMiddlewares(middlewares);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      missing: [
        { key: "next-router-prefetch", type: "header" },
        { key: "purpose", type: "header", value: "prefetch" },
      ],
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
    },
  ],
};
