import { App } from "@slack/bolt";

import { privateConfig } from "../config/private";

const app = new App({
  signingSecret: privateConfig.slack.signingSecret,
  token: privateConfig.slack.botToken,
});

export const sendSlackNotification = async (topic: string, url: string) => {
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:eyes: Someone followed *${topic}* ref`,
      },
    },
    {
      type: "divider",
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `URL: ${url}`,
        },
      ],
    },
  ];

  await app.client.chat.postMessage({
    blocks,
    channel: "events",
    text: `Someone followed ${topic} ref - ${url}`,
    token: privateConfig.slack.botToken,
  });
};
