import { App } from "@slack/bolt";

import { privateConfig } from "../config/private";

const app = new App({
  signingSecret: privateConfig.slack.signingSecret,
  token: privateConfig.slack.botToken,
});

export const sendSlackNotification = async (topic: string, url: string) => {
  const blocks = [
    {
      text: {
        text: `:eyes: Someone followed *${topic}* ref`,
        type: "mrkdwn",
      },
      type: "section",
    },
    {
      type: "divider",
    },
    {
      elements: [
        {
          text: `URL: ${url}`,
          type: "mrkdwn",
        },
      ],
      type: "context",
    },
  ];

  await app.client.chat.postMessage({
    blocks,
    channel: "events",
    text: `Someone followed ${topic} ref - ${url}`,
    token: privateConfig.slack.botToken,
  });
};
