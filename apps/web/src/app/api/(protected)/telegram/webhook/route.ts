import { timingSafeEqual } from "crypto";
import { webhookCallback } from "grammy";

import { privateConfig } from "~/lib/config/private";
import { bot } from "~/lib/telegram/bot";

const handleWebhook = webhookCallback(bot, "std/http");

function hasValidWebhookSecret(receivedSecret: null | string, expectedSecret: string) {
  if (!receivedSecret) return false;

  const received = Buffer.from(receivedSecret);
  const expected = Buffer.from(expectedSecret);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export const dynamic = "force-dynamic";

export const POST = async (req: Request) => {
  if (privateConfig.telegram.webhookSecret === "__UNSET__") {
    return new Response("Telegram webhook secret is not configured", { status: 503 });
  }

  if (
    !hasValidWebhookSecret(req.headers.get("x-telegram-bot-api-secret-token"), privateConfig.telegram.webhookSecret)
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    return await handleWebhook(req);
  } catch (error) {
    console.error("Telegram webhook processing failed:", error);
    return new Response("Unable to process Telegram update", { status: 500 });
  }
};
