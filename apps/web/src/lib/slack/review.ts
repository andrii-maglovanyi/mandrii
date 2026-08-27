import { App } from "@slack/bolt";

import { envName } from "../config/env";
import { privateConfig } from "../config/private";
import { UrlHelper } from "../url-helper";

const app = new App({
  signingSecret: privateConfig.slack.signingSecret,
  token: privateConfig.slack.botToken,
});

type ReviewReportNotification = {
  reason: string;
  reportedBy: { email: null | string; name: null | string };
  reviewAuthorName: null | string;
  reviewBody: string;
  targetName: string;
  targetType: "event" | "venue";
};

const truncate = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1).trimEnd()}…` : value;

const escapeMrkdwn = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export async function sendReviewReportNotification({
  reason,
  reportedBy,
  reviewAuthorName,
  reviewBody,
  targetName,
  targetType,
}: ReviewReportNotification): Promise<void> {
  const reporter = reportedBy.name || reportedBy.email || "Community member";
  const reporterDetails = reportedBy.email && reportedBy.name ? `${reportedBy.name} (${reportedBy.email})` : reporter;
  const reviewText = escapeMrkdwn(truncate(reviewBody.replaceAll("\n", " "), 1_200));

  try {
    await app.client.chat.postMessage({
      blocks: [
        {
          text: { emoji: true, text: ":rotating_light: Review reported", type: "plain_text" },
          type: "header",
        },
        { type: "divider" },
        {
          fields: [
            {
              text: `*Content:*\n${targetType === "venue" ? "Venue" : "Event"}: ${escapeMrkdwn(targetName)}`,
              type: "mrkdwn",
            },
            { text: `*Reported by:*\n${escapeMrkdwn(reporterDetails)}`, type: "mrkdwn" },
            { text: `*Reason:*\n${escapeMrkdwn(reason)}`, type: "mrkdwn" },
            { text: `*Review author:*\n${escapeMrkdwn(reviewAuthorName || "Community member")}`, type: "mrkdwn" },
          ],
          type: "section",
        },
        {
          text: { text: `*Review:*\n${reviewText}`, type: "mrkdwn" },
          type: "section",
        },
        {
          elements: [
            {
              action_id: "open-review-moderation",
              text: { emoji: true, text: "Open moderation queue", type: "plain_text" },
              type: "button",
              url: UrlHelper.buildUrl("/admin"),
            },
          ],
          type: "actions",
        },
      ],
      channel: envName === "production" ? "events" : "events-dev",
      text: `Review reported: ${targetName}`,
      token: privateConfig.slack.botToken,
    });
  } catch (error) {
    // A report must remain available to moderators even if Slack is unavailable.
    console.error("[Slack] Failed to send review report notification:", error);
  }
}
