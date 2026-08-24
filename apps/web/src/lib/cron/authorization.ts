import { timingSafeEqual } from "crypto";

import { privateConfig } from "~/lib/config/private";

export const getCronAuthorizationError = (authorization: null | string) => {
  if (privateConfig.cron.secret === "__UNSET__") {
    return new Response("Cron secret is not configured", { status: 503 });
  }

  const receivedSecret = authorization?.replace(/^Bearer\s+/i, "");
  if (!receivedSecret) return new Response("Unauthorized", { status: 401 });

  const received = Buffer.from(receivedSecret);
  const expected = Buffer.from(privateConfig.cron.secret);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return new Response("Unauthorized", { status: 401 });
  }

  return null;
};
