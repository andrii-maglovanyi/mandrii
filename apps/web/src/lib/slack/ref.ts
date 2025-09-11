import { App } from "@slack/bolt";

const app = new App({
  signingSecret: process.env.NEXT_PRIVATE_SLACK_SIGNING_SECRET,
  token: process.env.NEXT_PRIVATE_SLACK_BOT_TOKEN,
});

export const sendSlackNotification = async (topic: string, url: string) => {
  const blocks = [
    {
      text: {
        text: `:pushpin: Someone followed *${topic}* ref`,
        type: "mrkdwn",
      },
      type: "section",
    },
    {
      type: "divider",
    },
    {
      text: {
        text: `URL: ${url}`,
        type: "mrkdwn",
      },
      type: "context",
    },
  ];

  await app.client.chat.postMessage({
    blocks,
    channel: process.env.NEXT_PUBLIC_SLACK_CHANNEL!,
    token: process.env.NEXT_PRIVATE_SLACK_BOT_TOKEN,
  });
};
