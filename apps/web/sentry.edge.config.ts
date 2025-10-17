import * as Sentry from "@sentry/nextjs";

import { isProduction } from "~/lib/config/env";
import { publicConfig } from "~/lib/config/public";

Sentry.init({
  debug: !isProduction,
  dsn: publicConfig.analytics.sentryDsn,
  enabled: isProduction,
  enableLogs: true,
  integrations: [Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] })],
  tracesSampleRate: 1,
});
