import webpush from "web-push";

import { privateConfig } from "~/lib/config/private";
import sql from "~/lib/db/db";

type PushSubscription = {
  auth: string;
  endpoint: string;
  p256dh: string;
};

export function isWebPushConfigured() {
  return !(
    !process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY ||
    privateConfig.webPush.privateKey === "__UNSET__" ||
    privateConfig.webPush.subject === "__UNSET__"
  );
}

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;
  if (!isWebPushConfigured() || !publicKey) {
    throw new Error("Web Push is not configured");
  }

  webpush.setVapidDetails(privateConfig.webPush.subject, publicKey, privateConfig.webPush.privateKey);
}

async function getSubscriptions(recipientUserId: string) {
  return sql<PushSubscription[]>`
    SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ${recipientUserId}
  `;
}

async function sendPushNotifications(subscriptions: PushSubscription[], payload: string) {
  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          { endpoint: subscription.endpoint, keys: { auth: subscription.auth, p256dh: subscription.p256dh } },
          payload,
        );
      } catch (error: any) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await sql`DELETE FROM push_subscriptions WHERE endpoint = ${subscription.endpoint}`;
          return;
        }
        console.error("Web Push delivery failed:", error);
      }
    }),
  );
}

export async function sendMessagePushNotification(conversationId: string, recipientUserId: string, senderName: string) {
  try {
    configureWebPush();
  } catch (error) {
    console.warn("Web Push is disabled:", error);
    return;
  }

  const [conversation] = await sql<{ slug: string }[]>`
    SELECT v.slug FROM conversations c JOIN venues v ON v.id = c.venue_id WHERE c.id = ${conversationId}
  `;
  if (!conversation) return;

  const subscriptions = await getSubscriptions(recipientUserId);
  const payload = JSON.stringify({
    body: "Open Mandrii to view the conversation.",
    title: `💬 ${senderName}:`,
    url: `/en/venues/${conversation.slug}?conversation=${conversationId}#Messaging`,
  });

  await sendPushNotifications(subscriptions, payload);
}
