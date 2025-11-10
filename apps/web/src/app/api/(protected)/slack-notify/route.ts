import { NextRequest } from "next/server";

import { BadRequestError, withErrorHandling } from "~/lib/api";
import { sendSlackNotification } from "~/lib/slack/ref";

export const POST = (request: NextRequest) =>
  withErrorHandling(async () => {
    const body = await request.json();
    const { topic, url } = body;

    if (!topic || typeof topic !== "string") {
      throw new BadRequestError("Invalid or missing topic");
    }

    if (!url || typeof url !== "string") {
      throw new BadRequestError("Invalid or missing URL");
    }

    await sendSlackNotification(topic, url);
    return Response.json({ ok: true }, { status: 200 });
  });
