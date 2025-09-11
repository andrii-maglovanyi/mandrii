import { stackMiddlewares } from "~/middlewares/stackHandler";
import { withContentSecurityPolicy } from "~/middlewares/withContentSecurityPolicy";

import { withAdmin } from "./middlewares/withAdmin";
import { withLanguage } from "./middlewares/withLanguage";
import { withRef } from "./middlewares/withRef";

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
     */
    {
      missing: [
        { key: "next-router-prefetch", type: "header" },
        { key: "purpose", type: "header", value: "prefetch" },
      ],
      source: "/((?!admin|api|cv|_next/static|_next/image|services|static|favicon.ico).*)",
    },
  ],
};
