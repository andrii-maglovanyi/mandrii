import { timingSafeEqual } from "crypto";

import { privateConfig } from "~/lib/config/private";
import { deliverPendingTelegramMessages } from "~/lib/telegram/bot";

export const dynamic = "force-dynamic";

function hasValidCronSecret(authorization: null | string, expectedSecret: string) {
  const receivedSecret = authorization?.replace(/^Bearer\s+/i, "");
  if (!receivedSecret) return false;

  const received = Buffer.from(receivedSecret);
  const expected = Buffer.from(expectedSecret);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export const GET = async (req: Request) => {
  if (privateConfig.cron.secret === "__UNSET__") {
    return new Response("Cron secret is not configured", { status: 503 });
  }
  if (!hasValidCronSecret(req.headers.get("authorization"), privateConfig.cron.secret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const processed = await deliverPendingTelegramMessages();
    return Response.json({ processed });
  } catch (error) {
    console.error("Telegram delivery cron failed:", error);
    return new Response("Unable to process Telegram deliveries", { status: 500 });
  }
};
