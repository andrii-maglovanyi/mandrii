import { NextRequest } from "next/server";

import { BadRequestError, withErrorHandling } from "~/lib/api";
import { sendSlackNotification } from "~/lib/slack/ref";
import { sendQrScanTelegramNotification } from "~/lib/telegram/bot";

export const POST = (request: NextRequest) =>
  withErrorHandling(async () => {
    const body = await request.json();
    const { contentId, contentType, topic, url } = body;

    if (!topic || typeof topic !== "string") {
      throw new BadRequestError("Invalid or missing topic");
    }

    if (!url || typeof url !== "string") {
      throw new BadRequestError("Invalid or missing URL");
    }

    await sendSlackNotification(topic, url);
    if ((contentType === "venue" || contentType === "event") && typeof contentId === "string") {
      sendQrScanTelegramNotification({ contentId, contentType }).catch((error) => {
        console.error("Telegram QR scan notification failed:", error);
      });
    }
    return Response.json({ ok: true }, { status: 200 });
  });
