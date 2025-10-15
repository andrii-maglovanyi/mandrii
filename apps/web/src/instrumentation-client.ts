import * as Sentry from "@sentry/nextjs";

import { publicConfig } from "./lib/config/public";

Sentry.init({
  debug: false,
  dsn: publicConfig.analytics.sentryDsn,
  tracesSampleRate: 1,
  integrations: [Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] })],
  enableLogs: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
