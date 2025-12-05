import { App } from "@slack/bolt";

import { envName } from "../config/env";
import { privateConfig } from "../config/private";

const app = new App({
  signingSecret: privateConfig.slack.signingSecret,
  token: privateConfig.slack.botToken,
});

interface OrderItem {
  metadata: {
    variant?: {
      ageGroup: string;
      color?: string;
      gender: string;
      size: string;
    };
  } | null;
  name_snapshot: string;
  product_id: string;
  quantity: number;
  unit_price_minor: number;
  variant_id: null | string;
}

interface ShippingAddress {
  city?: string;
  country?: string;
  line1?: string;
  line2?: string;
  name?: string;
  phone?: string;
  postalCode?: string;
  state?: string;
}

interface PaymentNotificationData {
  currency: string;
  customerEmail: string;
  items: OrderItem[];
  orderId: string;
  paymentIntentId: string;
  shipping?: ShippingAddress;
  totalMinor: number;
  partial?: boolean;
}

/**
 * Format price from minor units (cents) to display format.
 */
function formatPrice(amountMinor: number, currency: string): string {
  const amount = amountMinor / 100;
  return new Intl.NumberFormat("en-GB", {
    currency: currency.toUpperCase(),
    style: "currency",
  }).format(amount);
}

/**
 * Send Slack notification for successful payment.
 */
export async function sendPaymentNotification({
  currency,
  customerEmail,
  items,
  orderId,
  paymentIntentId,
  shipping,
  totalMinor,
}: PaymentNotificationData): Promise<void> {
  const itemsList = items
    .map((item) => {
      const variantInfo = item.metadata?.variant
        ? ` (${item.metadata.variant.size}, ${item.metadata.variant.gender}${item.metadata.variant.color ? `, ${item.metadata.variant.color}` : ""})`
        : "";
      return `• ${item.name_snapshot}${variantInfo} × ${item.quantity} — ${formatPrice(item.unit_price_minor * item.quantity, currency)}`;
    })
    .join("\n");

  // Format shipping address
  const shippingAddress = shipping
    ? [shipping.line1, shipping.line2, shipping.city, shipping.state, shipping.postalCode, shipping.country]
        .filter(Boolean)
        .join(", ")
    : "Not provided";

  const blocks = [
    {
      text: {
        emoji: true,
        text: `:moneybag: New payment received!`,
        type: "plain_text" as const,
      },
      type: "header" as const,
    },
    {
      type: "divider" as const,
    },
    {
      fields: [
        {
          text: `*Order ID:*\n\`${orderId}\``,
          type: "mrkdwn" as const,
        },
        {
          text: `*Total:*\n${formatPrice(totalMinor, currency)}`,
          type: "mrkdwn" as const,
        },
        {
          text: `*Customer:*\n${customerEmail}`,
          type: "mrkdwn" as const,
        },
        {
          text: `*Items:*\n${items.length} item${items.length > 1 ? "s" : ""}`,
          type: "mrkdwn" as const,
        },
      ],
      type: "section" as const,
    },
    {
      type: "divider" as const,
    },
    {
      text: {
        text: `*Order Details:*\n${itemsList}`,
        type: "mrkdwn" as const,
      },
      type: "section" as const,
    },
    {
      type: "divider" as const,
    },
    {
      text: {
        text: `*Ship to:*\n${shipping?.name ? `${shipping.name}\n` : ""}${shippingAddress}${shipping?.phone ? `\n📞 ${shipping.phone}` : ""}`,
        type: "mrkdwn" as const,
      },
      type: "section" as const,
    },
    {
      type: "divider" as const,
    },
    {
      elements: [
        {
          text: `Payment Intent: ${paymentIntentId}`,
          type: "mrkdwn" as const,
        },
      ],
      type: "context" as const,
    },
  ];

  try {
    await app.client.chat.postMessage({
      blocks,
      channel: envName === "production" ? "events" : "events-dev",
      text: `New payment of ${formatPrice(totalMinor, currency)} from ${customerEmail}`,
      token: privateConfig.slack.botToken,
    });

    console.log(`[Slack] Payment notification sent for order ${orderId}`);
  } catch (error) {
    // Log but don't throw - payment processing shouldn't fail due to Slack
    console.error(`[Slack] Failed to send payment notification for order ${orderId}:`, error);
  }
}

/**
 * Send Slack notification for refunded payment.
 */
export async function sendRefundNotification({
  currency,
  customerEmail,
  partial = false,
  orderId,
  paymentIntentId,
  totalMinor,
}: Omit<PaymentNotificationData, "items">): Promise<void> {
  const title = partial ? ":warning: Payment partially refunded" : ":leftwards_arrow_with_hook: Payment refunded";
  const messagePrefix = partial ? "Partial refund of" : "Refund of";
  const blocks = [
    {
      text: {
        emoji: true,
        text: title,
        type: "plain_text" as const,
      },
      type: "header" as const,
    },
    {
      type: "divider" as const,
    },
    {
      fields: [
        {
          text: `*Order ID:*\n\`${orderId}\``,
          type: "mrkdwn" as const,
        },
        {
          text: `*Refunded Amount:*\n${formatPrice(totalMinor, currency)}`,
          type: "mrkdwn" as const,
        },
        {
          text: `*Customer:*\n${customerEmail}`,
          type: "mrkdwn" as const,
        },
      ],
      type: "section" as const,
    },
    {
      type: "divider" as const,
    },
    {
      elements: [
        {
          text: `Payment Intent: ${paymentIntentId}`,
          type: "mrkdwn" as const,
        },
      ],
      type: "context" as const,
    },
  ];

  try {
    await app.client.chat.postMessage({
      blocks,
      channel: envName === "production" ? "events" : "events-dev",
      text: `${messagePrefix} ${formatPrice(totalMinor, currency)} processed for ${customerEmail}`,
      token: privateConfig.slack.botToken,
    });

    console.log(`[Slack] Refund notification sent for order ${orderId}`);
  } catch (error) {
    console.error(`[Slack] Failed to send refund notification for order ${orderId}:`, error);
  }
}
