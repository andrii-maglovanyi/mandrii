import { captureException } from "@sentry/nextjs";
import Stripe from "stripe";

import {
  DECREMENT_PRODUCT_STOCK,
  DECREMENT_VARIANT_STOCK,
  INCREMENT_PRODUCT_STOCK,
  INCREMENT_VARIANT_STOCK,
  UPDATE_ORDER_STATUS,
} from "~/graphql/orders";
import { privateConfig } from "~/lib/config/private";
import { getAdminClient } from "~/lib/graphql/adminClient";
import { sendPaymentNotification, sendRefundNotification } from "~/lib/slack/payment";

const stripe = new Stripe(privateConfig.stripe.secretKey);

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

interface OrderQueryResult {
  orders: Array<{
    email: string;
    id: string;
    order_items: OrderItem[];
    status: string;
    total_minor: number;
  }>;
}

/**
 * POST /api/webhooks/stripe
 *
 * Stripe webhook handler for payment events.
 * Handles:
 * - payment_intent.created: Verify order exists (orphan detection)
 * - payment_intent.succeeded: Update order status to "paid", decrement stock
 * - payment_intent.payment_failed: Update order status to "failed"
 * - charge.refunded: Update order status to "refunded", restore stock
 *
 * Security: Verifies webhook signature using Stripe webhook secret.
 */
export async function POST(req: Request): Promise<Response> {
  const webhookSecret = privateConfig.stripe.webhookSecret;
  const isDevelopment = process.env.NODE_ENV === "development";

  // SECURITY: Fail-fast guard - reject immediately in production if no secret configured
  // This prevents ANY processing of unsigned webhooks in non-development environments
  if (!webhookSecret || webhookSecret === "__UNSET__") {
    if (!isDevelopment) {
      console.error(
        "[Stripe Webhook] CRITICAL: NEXT_PRIVATE_STRIPE_WEBHOOK_SECRET is not configured. " +
          "Rejecting all webhook requests to prevent unsigned event processing.",
      );
      captureException(new Error("Stripe webhook secret not configured in production"), {
        tags: { security: "webhook_secret_missing" },
      });
      return Response.json({ error: "Webhook endpoint not properly configured. Contact support." }, { status: 500 });
    }
    console.warn(
      "[Stripe Webhook] WARNING: No webhook secret configured. " +
        "Signature verification disabled. This is only acceptable in development.",
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  // Verify signature header is present (even in dev, Stripe CLI sends this)
  if (!signature) {
    console.error("[Stripe Webhook] Missing stripe-signature header");
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    if (webhookSecret && webhookSecret !== "__UNSET__") {
      // Production path: verify signature cryptographically
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Development-only path: parse without verification (INSECURE)
      // The isDevelopment check above guarantees we only reach here in dev
      event = JSON.parse(body) as Stripe.Event;
      console.warn(`[Stripe Webhook] Processing unverified event ${event.id} (dev mode)`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[Stripe Webhook] Signature verification failed: ${message}`);
    return Response.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case "payment_intent.created":
        await handlePaymentIntentCreated(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        // Unhandled event type - just acknowledge receipt
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, error);
    captureException(error, {
      extra: {
        eventId: event.id,
        eventType: event.type,
      },
      tags: {
        webhook: "stripe",
      },
    });

    // Return 200 to prevent Stripe from retrying
    // We log the error for investigation
    return Response.json({ error: "Event handling failed", received: true });
  }
}

/**
 * Handle refunded charge.
 * Updates order status to "refunded" and restores stock for all items.
 * Supports both full and partial refunds.
 */
async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;

  if (!paymentIntentId) {
    console.error("[Stripe Webhook] charge.refunded missing payment_intent");
    return;
  }

  console.log(`[Stripe Webhook] Processing charge.refunded for payment_intent: ${paymentIntentId}`);

  const client = getAdminClient();

  // Fetch order by payment_intent_id
  const { data: orderData } = await client.query<OrderQueryResult>({
    fetchPolicy: "network-only",
    query: GET_ORDER_WITH_ITEMS,
    variables: { paymentIntentId },
  });

  const order = orderData.orders[0];

  if (!order) {
    console.error(`[Stripe Webhook] Order not found for payment_intent: ${paymentIntentId}`);
    return;
  }

  // Check if already refunded (idempotency)
  if (order.status === "refunded") {
    console.log(`[Stripe Webhook] Order ${order.id} already marked as refunded - skipping`);
    return;
  }

  // Check if this is a full refund
  const isFullRefund = charge.amount_refunded === charge.amount;

  if (isFullRefund) {
    // Update order status to "refunded"
    await client.mutate({
      mutation: UPDATE_ORDER_STATUS,
      variables: { id: order.id, status: "refunded" },
    });

    console.log(`[Stripe Webhook] Order ${order.id} status updated to "refunded"`);

    // Restore stock for each item (only for full refunds)
    for (const item of order.order_items) {
      if (item.variant_id) {
        // Increment variant stock
        await client.mutate({
          mutation: INCREMENT_VARIANT_STOCK,
          variables: { amount: item.quantity, id: item.variant_id },
        });
        console.log(`[Stripe Webhook] Restored variant ${item.variant_id} stock by ${item.quantity}`);
      } else {
        // Increment product stock
        await client.mutate({
          mutation: INCREMENT_PRODUCT_STOCK,
          variables: { amount: item.quantity, id: item.product_id },
        });
        console.log(`[Stripe Webhook] Restored product ${item.product_id} stock by ${item.quantity}`);
      }
    }

    console.log(`[Stripe Webhook] Successfully processed full refund for order ${order.id}`);

    // Send Slack notification for refund
    await sendRefundNotification({
      currency: charge.currency,
      customerEmail: order.email,
      orderId: order.id,
      paymentIntentId,
      totalMinor: charge.amount_refunded,
    });
  } else {
    // Partial refund - mark status and notify, but do not alter stock
    await client.mutate({
      mutation: UPDATE_ORDER_STATUS,
      variables: { id: order.id, status: "partially_refunded" },
    });

    console.log(
      `[Stripe Webhook] Partial refund detected for order ${order.id}: ` +
        `${charge.amount_refunded}/${charge.amount} refunded. Status set to partially_refunded. Stock unchanged.`,
    );

    await sendRefundNotification({
      currency: charge.currency,
      customerEmail: order.email,
      orderId: order.id,
      partial: true,
      paymentIntentId,
      totalMinor: charge.amount_refunded,
    });
  }
}

/**
 * Handle failed payment.
 * Updates order status to "failed".
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    console.error("[Stripe Webhook] payment_intent.payment_failed missing orderId in metadata");
    return;
  }

  console.log(`[Stripe Webhook] Processing payment_intent.payment_failed for order: ${orderId}`);

  const client = getAdminClient();

  // Update order status to "failed"
  await client.mutate({
    mutation: UPDATE_ORDER_STATUS,
    variables: { id: orderId, status: "failed" },
  });

  console.log(`[Stripe Webhook] Order ${orderId} status updated to "failed"`);
}

/**
 * Handle PaymentIntent creation.
 * Verifies that a corresponding order exists - if not, flags for investigation.
 * This provides a self-healing mechanism for orphaned PaymentIntents.
 *
 * The checkout flow creates orders BEFORE PaymentIntents, so by the time
 * this webhook fires, the order should already exist with the orderId
 * stored in PI metadata. We query by orderId directly for deterministic
 * verification (no race conditions with payment_intent_id updates).
 */
async function handlePaymentIntentCreated(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const orderId = paymentIntent.metadata?.orderId;

  // If no orderId in metadata, this might be a test PI or created outside checkout
  if (!orderId) {
    console.log(`[Stripe Webhook] payment_intent.created without orderId - skipping orphan check`);
    return;
  }

  console.log(`[Stripe Webhook] Processing payment_intent.created for PI: ${paymentIntent.id}, orderId: ${orderId}`);

  const client = getAdminClient();

  // Query order by ID directly (not by payment_intent_id)
  // This is deterministic because checkout creates order BEFORE PI
  const { data: orderData } = await client.query<{ orders_by_pk: { id: string; status: string } | null }>({
    fetchPolicy: "network-only",
    query: GET_ORDER_BY_ID_SIMPLE,
    variables: { id: orderId },
  });

  const order = orderData.orders_by_pk;

  if (!order) {
    // Order doesn't exist - this PI is orphaned
    console.warn(
      `[Stripe Webhook] ORPHAN DETECTED: PaymentIntent ${paymentIntent.id} references ` +
        `non-existent order ${orderId}. PI will be canceled if still uncaptured.`,
    );

    // Report to Sentry for investigation
    captureException(new Error(`Orphan PaymentIntent detected: ${paymentIntent.id}`), {
      extra: {
        metadataOrderId: orderId,
        paymentIntentId: paymentIntent.id,
        paymentIntentStatus: paymentIntent.status,
      },
      tags: {
        action: "orphan_pi_detected",
        webhook: "stripe",
      },
    });

    // If the PI is still in a cancellable state, cancel it
    if (
      paymentIntent.status === "requires_payment_method" ||
      paymentIntent.status === "requires_confirmation" ||
      paymentIntent.status === "requires_action"
    ) {
      try {
        await stripe.paymentIntents.cancel(paymentIntent.id);
        console.log(`[Stripe Webhook] Canceled orphan PaymentIntent ${paymentIntent.id}`);
      } catch (cancelError) {
        console.error(`[Stripe Webhook] Failed to cancel orphan PI ${paymentIntent.id}:`, cancelError);
        captureException(cancelError, {
          extra: { paymentIntentId: paymentIntent.id },
          tags: { action: "orphan_pi_cancel_failed" },
        });
      }
    }
    return;
  }

  // Order exists - verify it's in an expected state
  if (order.status !== "pending") {
    console.log(
      `[Stripe Webhook] PaymentIntent ${paymentIntent.id} - order ${orderId} exists ` +
        `but status is "${order.status}" (expected "pending"). May be a duplicate webhook.`,
    );
    return;
  }

  console.log(`[Stripe Webhook] PaymentIntent ${paymentIntent.id} verified - order ${orderId} exists and is pending`);
}

/**
 * Handle successful payment.
 * Updates order status to "paid" and decrements stock for all items.
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    console.error("[Stripe Webhook] payment_intent.succeeded missing orderId in metadata");
    return;
  }

  console.log(`[Stripe Webhook] Processing payment_intent.succeeded for order: ${orderId}`);

  const client = getAdminClient();

  // Fetch order to get items for stock decrement
  const { data: orderData } = await client.query<OrderQueryResult>({
    fetchPolicy: "network-only",
    query: GET_ORDER_WITH_ITEMS,
    variables: { paymentIntentId: paymentIntent.id },
  });

  const order = orderData.orders[0];

  if (!order) {
    console.error(`[Stripe Webhook] Order not found for payment_intent: ${paymentIntent.id}`);
    return;
  }

  // Check if already processed (idempotency)
  if (order.status === "paid") {
    console.log(`[Stripe Webhook] Order ${orderId} already marked as paid - skipping`);
    return;
  }

  // Update order status to "paid"
  await client.mutate({
    mutation: UPDATE_ORDER_STATUS,
    variables: { id: order.id, status: "paid" },
  });

  console.log(`[Stripe Webhook] Order ${orderId} status updated to "paid"`);

  // Decrement stock for each item
  for (const item of order.order_items) {
    // Negative amount for decrement (using _inc)
    const decrementAmount = -item.quantity;

    if (item.variant_id) {
      // Decrement variant stock
      await client.mutate({
        mutation: DECREMENT_VARIANT_STOCK,
        variables: { amount: decrementAmount, id: item.variant_id },
      });
      console.log(`[Stripe Webhook] Decremented variant ${item.variant_id} stock by ${item.quantity}`);
    } else {
      // Decrement product stock (non-variant product)
      await client.mutate({
        mutation: DECREMENT_PRODUCT_STOCK,
        variables: { amount: decrementAmount, id: item.product_id },
      });
      console.log(`[Stripe Webhook] Decremented product ${item.product_id} stock by ${item.quantity}`);
    }
  }

  console.log(`[Stripe Webhook] Successfully processed order ${orderId}`);

  // Extract shipping information from PaymentIntent
  const shipping = paymentIntent.shipping
    ? {
        city: paymentIntent.shipping.address?.city ?? undefined,
        country: paymentIntent.shipping.address?.country ?? undefined,
        line1: paymentIntent.shipping.address?.line1 ?? undefined,
        line2: paymentIntent.shipping.address?.line2 ?? undefined,
        name: paymentIntent.shipping.name ?? undefined,
        phone: paymentIntent.shipping.phone ?? undefined,
        postalCode: paymentIntent.shipping.address?.postal_code ?? undefined,
        state: paymentIntent.shipping.address?.state ?? undefined,
      }
    : undefined;

  // Send Slack notification for payment
  await sendPaymentNotification({
    currency: paymentIntent.currency,
    customerEmail: order.email,
    items: order.order_items,
    orderId: order.id,
    paymentIntentId: paymentIntent.id,
    shipping,
    totalMinor: order.total_minor,
  });
}

/**
 * Query to get order with items by payment_intent_id.
 * Uses payment_intent_id to ensure idempotency.
 */
import { gql } from "@apollo/client";

const GET_ORDER_WITH_ITEMS = gql`
  query GetOrderWithItems($paymentIntentId: String!) {
    orders(where: { payment_intent_id: { _eq: $paymentIntentId } }) {
      email
      id
      status
      total_minor
      order_items {
        metadata
        name_snapshot
        product_id
        quantity
        unit_price_minor
        variant_id
      }
    }
  }
`;

/**
 * Simple query to check if an order exists by ID.
 * Used by orphan PI detection where we only need to verify existence.
 */
const GET_ORDER_BY_ID_SIMPLE = gql`
  query GetOrderByIdSimple($id: uuid!) {
    orders_by_pk(id: $id) {
      id
      status
    }
  }
`;
