import * as Sentry from "@sentry/nextjs";

import { publicConfig } from "./lib/config/public";
import { isProduction } from "./lib/config/env";

Sentry.init({
  debug: !isProduction,
  dsn: publicConfig.analytics.sentryDsn,
  enableLogs: true,
  integrations: [Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] })],
  tracesSampleRate: 1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
