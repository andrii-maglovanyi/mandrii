import { NextApiRequest, NextApiResponse } from "next";
import { sendSlackNotification } from "~/lib/slack/ref";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { topic, url } = req.body;

  try {
    await sendSlackNotification(topic, url);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Slack error:", error);
    res.status(500).json({ ok: false });
  }
}
