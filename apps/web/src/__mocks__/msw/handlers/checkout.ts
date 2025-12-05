/**
 * Checkout MSW Handlers
 *
 * Provides handlers for checkout API testing including:
 * - GraphQL mutations for order management
 * - Stripe API mocking
 * - Product data for cart validation
 */

import { graphql, http, HttpResponse } from "msw";

import { mockProducts } from "../data/shop";

const graphqlEndpoint = graphql.link(process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8080/v1/graphql");

/**
 * Transform mock product to GraphQL response format for checkout
 */
const toGraphQLProduct = (product: (typeof mockProducts)[0]) => ({
  badge: product.badge || null,
  category: product.category,
  clothing_type: product.clothingType,
  created_at: new Date().toISOString(),
  currency: product.currency,
  description_en: product.description_en,
  description_uk: product.description_uk,
  id: product.id,
  images: product.images,
  name: product.name,
  price_minor: product.priceMinor,
  product_variants:
    product.variants?.map((v) => ({
      age_group: v.ageGroup,
      color: v.color || null,
      gender: v.gender,
      id: v.id,
      price_override_minor: v.priceOverrideMinor || null,
      size: v.size,
      sku: v.sku || null,
      stock: v.stock,
    })) ?? [],
  slug: product.slug,
  status: product.status,
  stock: product.stock ?? null,
  updated_at: new Date().toISOString(),
});

/**
 * State tracking for checkout tests
 */
export interface CheckoutTestState {
  cancelledPaymentIntents: string[];
  captchaVerifications: Array<{ action: string; token: string }>;
  createdOrders: Array<{
    currency: string;
    email: string;
    id: string;
    idempotencyKey: string;
    items: unknown[];
    paymentIntentId: null | string;
    status: string;
    totalMinor: number;
  }>;
  createdPaymentIntents: Array<{
    amount: number;
    currency: string;
    orderId?: string;
  }>;
  deletedOrders: string[];
  updatedOrders: Array<{ id: string; paymentIntentId: string }>;
}

export const createCheckoutTestState = (): CheckoutTestState => ({
  cancelledPaymentIntents: [],
  captchaVerifications: [],
  createdOrders: [],
  createdPaymentIntents: [],
  deletedOrders: [],
  updatedOrders: [],
});

/**
 * Options for checkout handlers
 */
export interface CheckoutHandlerOptions {
  captchaFails?: boolean;
  existingOrder?: {
    id: string;
    payment_intent_id: string;
    status: string;
  } | null;
  orderCreationFails?: boolean;
  orderDeletionFails?: boolean;
  orderUpdateFails?: boolean;
  paymentIntentFails?: boolean;
  paymentIntentFailsWithAmount?: number;
  productOverrides?: Map<string, Partial<(typeof mockProducts)[0]>>;
}

/**
 * Create checkout handlers for testing
 */
export const createCheckoutHandlers = (state: CheckoutTestState, options: CheckoutHandlerOptions = {}) => {
  const {
    captchaFails = false,
    existingOrder = null,
    orderCreationFails = false,
    orderDeletionFails = false,
    orderUpdateFails = false,
    paymentIntentFails = false,
    paymentIntentFailsWithAmount,
    productOverrides = new Map(),
  } = options;

  return [
    // CAPTCHA verification
    http.post("https://www.google.com/recaptcha/api/siteverify", async ({ request }) => {
      const body = await request.text();
      const params = new URLSearchParams(body);
      const token = params.get("response") || "";

      state.captchaVerifications.push({
        action: "checkout",
        token,
      });

      if (captchaFails) {
        return HttpResponse.json({
          "error-codes": ["invalid-input-response"],
          success: false,
        });
      }

      return HttpResponse.json({
        action: "checkout",
        score: 0.9,
        success: true,
      });
    }),

    // GetProductsByIds - for cart validation
    graphqlEndpoint.query("GetProductsByIds", ({ variables }) => {
      const ids = variables.ids as string[];
      const products = mockProducts
        .filter((p) => ids.includes(p.id))
        .map((p) => {
          const override = productOverrides.get(p.id);
          if (override) {
            return toGraphQLProduct({ ...p, ...override });
          }
          return toGraphQLProduct(p);
        });

      return HttpResponse.json({
        data: { products },
      });
    }),

    // GetOrderByIdempotencyKey
    graphqlEndpoint.query("GetOrderByIdempotencyKey", () => {
      return HttpResponse.json({
        data: { orders: existingOrder ? [existingOrder] : [] },
      });
    }),

    // CreateOrder
    graphqlEndpoint.mutation("CreateOrder", ({ variables }) => {
      if (orderCreationFails) {
        return HttpResponse.json({
          errors: [{ message: "Database error" }],
        });
      }

      const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      state.createdOrders.push({
        currency: variables.currency,
        email: variables.email,
        id: orderId,
        idempotencyKey: variables.idempotency_key,
        items: variables.items,
        paymentIntentId: variables.payment_intent_id,
        status: variables.status,
        totalMinor: variables.total_minor,
      });

      return HttpResponse.json({
        data: {
          insert_orders_one: {
            created_at: new Date().toISOString(),
            currency: variables.currency,
            email: variables.email,
            id: orderId,
            order_items: variables.items.map((item: Record<string, unknown>, i: number) => ({
              id: `item-${i}`,
              name_snapshot: item.name_snapshot,
              quantity: item.quantity,
              unit_price_minor: item.unit_price_minor,
            })),
            status: variables.status,
            total_minor: variables.total_minor,
          },
        },
      });
    }),

    // UpdateOrderPaymentIntent
    graphqlEndpoint.mutation("UpdateOrderPaymentIntent", ({ variables }) => {
      if (orderUpdateFails) {
        return HttpResponse.json({
          errors: [{ message: "Failed to update order" }],
        });
      }

      state.updatedOrders.push({
        id: variables.id,
        paymentIntentId: variables.payment_intent_id,
      });

      return HttpResponse.json({
        data: {
          update_orders_by_pk: {
            id: variables.id,
            payment_intent_id: variables.payment_intent_id,
          },
        },
      });
    }),

    // DeleteOrder
    graphqlEndpoint.mutation("DeleteOrder", ({ variables }) => {
      if (orderDeletionFails) {
        return HttpResponse.json({
          errors: [{ message: "Failed to delete order" }],
        });
      }

      state.deletedOrders.push(variables.id);

      return HttpResponse.json({
        data: {
          delete_orders_by_pk: { id: variables.id },
        },
      });
    }),

    // Stripe PaymentIntent creation
    http.post("https://api.stripe.com/v1/payment_intents", async ({ request }) => {
      const body = await request.text();
      const params = new URLSearchParams(body);
      const amount = parseInt(params.get("amount") || "0");
      const currency = params.get("currency") || "gbp";
      const orderId = params.get("metadata[orderId]") || undefined;

      // Fail for specific amount if configured
      if (paymentIntentFailsWithAmount !== undefined && amount === paymentIntentFailsWithAmount) {
        return HttpResponse.json({ error: { message: "Card declined", type: "card_error" } }, { status: 402 });
      }

      if (paymentIntentFails) {
        return HttpResponse.json({ error: { message: "Card declined", type: "card_error" } }, { status: 402 });
      }

      const piId = `pi_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      state.createdPaymentIntents.push({ amount, currency, orderId });

      return HttpResponse.json({
        client_secret: `${piId}_secret_test`,
        id: piId,
        status: "requires_payment_method",
      });
    }),

    // Stripe PaymentIntent cancellation
    http.post("https://api.stripe.com/v1/payment_intents/:id/cancel", ({ params }) => {
      state.cancelledPaymentIntents.push(params.id as string);
      return HttpResponse.json({
        id: params.id,
        status: "canceled",
      });
    }),

    // Stripe PaymentIntent retrieval (for idempotency reuse)
    http.get("https://api.stripe.com/v1/payment_intents/:id", ({ params }) => {
      return HttpResponse.json({
        client_secret: `${params.id}_secret_test`,
        id: params.id,
        status: "requires_payment_method",
      });
    }),
  ];
};
