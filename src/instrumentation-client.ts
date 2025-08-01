import * as Sentry from "@sentry/nextjs";

import { publicConfig } from "./lib/config/public";

Sentry.init({
  debug: false,
  dsn: publicConfig.analytics.sentryDsn,
  tracesSampleRate: 1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
