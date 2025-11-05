import { App } from "@slack/bolt";
import { User } from "next-auth";
import slackifyMarkdown from "slackify-markdown";

import { Events } from "~/types";

import { envName } from "../config/env";
import { privateConfig } from "../config/private";
import { constants } from "../constants";

const app = new App({
  signingSecret: process.env.NEXT_PRIVATE_SLACK_SIGNING_SECRET,
  token: process.env.NEXT_PRIVATE_SLACK_BOT_TOKEN,
});

const getMedia = ({ images, title }: Partial<Events>) => {
  if (!images?.length) return null;

  const imageUrl = `${constants.vercelBlobStorageUrl}/${images[0]}`;

  return {
    accessory: {
      alt_text: title,
      image_url: imageUrl,
      type: "image" as const,
    },
  };
};

export const sendSlackNotification = async (
  user: User,
  { city, country, description_en, description_uk, id, images, slug, title, type }: Partial<Events>,
) => {
  const media = getMedia({ images, title });

  const categoryText = type ? constants.categories[type].label.uk : "[no type]";

  const locationText = city && country ? ` - ${city}, ${country}` : "";

  const descriptionBlock = media
    ? {
        ...media,
        text: {
          text: slackifyMarkdown(description_uk ?? description_en ?? "No description provided"),
          type: "mrkdwn" as const,
        },
        type: "section" as const,
      }
    : {
        text: {
          text: slackifyMarkdown(description_uk ?? description_en ?? "No description provided"),
          type: "mrkdwn" as const,
        },
        type: "section" as const,
      };

  const contextElements: Array<
    { alt_text: string; image_url: string; type: "image" } | { text: string; type: "mrkdwn" }
  > = [
    {
      text: `Author: ${user.name} (${user.email})`,
      type: "mrkdwn",
    },
  ];

  if (user.image) {
    contextElements.unshift({
      alt_text: `User ${user.id}`,
      image_url: user.image,
      type: "image",
    });
  }

  const blocks = [
    {
      text: {
        text: id ? `:pencil2: Event *${title}* edited:` : `:sparkles: New event *${title}* added:`,
        type: "mrkdwn" as const,
      },
      type: "section" as const,
    },
    {
      type: "divider" as const,
    },
    descriptionBlock,
    {
      accessory: {
        action_id: "button-action",
        text: {
          emoji: true,
          text: "Review",
          type: "plain_text" as const,
        },
        type: "button" as const,
        url: `https://mandrii.${envName === "production" ? "com" : "vercel.app"}/user-directory/events/${slug}`,
      },
      text: {
        text: `*${categoryText}*${locationText}`,
        type: "mrkdwn" as const,
      },
      type: "section" as const,
    },
    {
      type: "divider" as const,
    },
    {
      elements: contextElements,
      type: "context" as const,
    },
  ];

  await app.client.chat.postMessage({
    blocks,
    channel: envName === "production" ? "events" : "events-dev",
    text: `New event "${name}" added by ${user.name}`,
    token: privateConfig.slack.botToken,
  });
};
