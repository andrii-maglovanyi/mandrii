import { App } from "@slack/bolt";

import { envName } from "../config/env";
import { privateConfig } from "../config/private";

const app = new App({
  signingSecret: privateConfig.slack.signingSecret,
  token: privateConfig.slack.botToken,
});

export const sendNewsletterSubscriptionNotification = async (email: string) => {
  const blocks = [
    {
      text: {
        text: `:email: Someone subscribed to the newsletter`,
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
          text: `Email: ${email}`,
          type: "mrkdwn",
        },
        {
          text: "Status: *Pending confirmation*",
          type: "mrkdwn",
        },
      ],
      type: "context",
    },
  ];

  await app.client.chat.postMessage({
    blocks,
    channel: envName === "production" ? "events" : "events-dev",
    text: `Newsletter subscription: ${email}`,
    token: privateConfig.slack.botToken,
  });
};

export const sendNewsletterConfirmationNotification = async (email: string) => {
  const blocks = [
    {
      text: {
        text: `:white_check_mark: Someone confirmed their newsletter subscription`,
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
          text: `Email: ${email}`,
          type: "mrkdwn",
        },
        {
          text: "Status: *Confirmed*",
          type: "mrkdwn",
        },
      ],
      type: "context",
    },
  ];

  await app.client.chat.postMessage({
    blocks,
    channel: envName === "production" ? "events" : "events-dev",
    text: `Newsletter confirmation: ${email}`,
    token: privateConfig.slack.botToken,
  });
};

export const sendNewsletterUnsubscribeNotification = async (email: string) => {
  const blocks = [
    {
      text: {
        text: `:wave: Someone unsubscribed from the newsletter`,
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
          text: `Email: ${email}`,
          type: "mrkdwn",
        },
        {
          text: "Status: *Unsubscribed*",
          type: "mrkdwn",
        },
      ],
      type: "context",
    },
  ];

  await app.client.chat.postMessage({
    blocks,
    channel: envName === "production" ? "events" : "events-dev",
    text: `Newsletter unsubscribe: ${email}`,
    token: privateConfig.slack.botToken,
  });
};
