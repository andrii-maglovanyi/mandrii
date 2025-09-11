import { NextRequest } from "next/server";

import { sendSlackNotification } from "~/lib/slack/ref";

export async function POST(request: NextRequest) {
  const { topic, url } = await request.json();

  try {
    await sendSlackNotification(topic, url);
    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Slack error:", error);
    return Response.json({ error: "Failed to send Slack notification" }, { status: 500 });
  }
}
