import * as Sentry from "@sentry/nextjs";

import { isDevelopment } from "./lib/config/env";

export async function register() {
  if (isDevelopment) {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      await import("./lib/telegram/bot");
    }

    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
