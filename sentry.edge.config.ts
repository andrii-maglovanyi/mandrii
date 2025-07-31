import * as Sentry from "@sentry/nextjs";

import { isPreview, isProduction } from "~/lib/config/env";
import { publicConfig } from "~/lib/config/public";

Sentry.init({
  debug: false,
  dsn: publicConfig.analytics.sentryDsn,
  enabled: isProduction && !isPreview,
  tracesSampleRate: 1,
});
