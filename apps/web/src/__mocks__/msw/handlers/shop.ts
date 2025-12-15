/**
 * Shop MSW Handlers
 *
 * GraphQL handlers for shop-related queries and mutations.
 * Includes checkout flow handlers for order management and Stripe integration.
 */

import { graphql, http, HttpResponse } from "msw";

import {
  applyWhereClause,
  getMockProductBySlugResponse,
  getMockProductsResponse,
  mockProductBySlug,
  mockProducts,
} from "../data/shop";

/**
 * GraphQL endpoint for Hasura
 * Adjust this URL to match your actual GraphQL endpoint
 */
const graphqlEndpoint = graphql.link(process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8080/v1/graphql");

export const shopHandlers = [
  /**
   * Handler for GetPublicProducts query
   * Parses the _and/_or boolean expression structure emitted by useProducts
   */
  graphqlEndpoint.query("GetPublicProducts", ({ variables }) => {
    const { limit = 12, offset = 0, where = {} } = variables || {};

    // Apply where clause filtering (handles _and, _or, _eq, _ilike)
    const filteredProducts = applyWhereClause([...mockProducts], where as Record<string, unknown>);

    // Apply pagination
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    return HttpResponse.json({
      data: getMockProductsResponse(paginatedProducts, filteredProducts.length),
    });
  }),

  /**
   * Handler for GetProductBySlug query
   */
  graphqlEndpoint.query("GetProductBySlug", ({ variables }) => {
    const { slug } = variables || {};

    const product = mockProductBySlug(slug);

    return HttpResponse.json({
      data: getMockProductBySlugResponse(product),
    });
  }),
];

/**
 * Error scenario handlers - use these in specific tests
 */
export const shopErrorHandlers = {
  /**
   * Simulates empty results
   */
  emptyResults: graphqlEndpoint.query("GetPublicProducts", () => {
    return HttpResponse.json({
      data: getMockProductsResponse([], 0),
    });
  }),

  /**
   * Simulates a GraphQL error for GetPublicProducts
   */
  graphqlError: graphqlEndpoint.query("GetPublicProducts", () => {
    return HttpResponse.json({
      errors: [
        {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
          message: "Failed to fetch products",
        },
      ],
    });
  }),

  /**
   * Simulates a network error for GetPublicProducts
   */
  networkError: graphqlEndpoint.query("GetPublicProducts", () => {
    return HttpResponse.error();
  }),

  /**
   * Simulates product not found
   */
  productNotFound: graphqlEndpoint.query("GetProductBySlug", () => {
    return HttpResponse.json({
      data: getMockProductBySlugResponse(null),
    });
  }),
};

/**
 * Checkout flow handlers for testing order and payment scenarios
 */
export const checkoutHandlers = {
  /**
   * Creates mock handlers for checkout flow testing.
   * Tracks created/updated/deleted orders and payment intents.
   */
  createMockHandlers: (
    options: {
      existingOrder?: { id: string; payment_intent_id: string; status: string } | null;
      orderCreationFails?: boolean;
      orderDeletionFails?: boolean;
      orderUpdateFails?: boolean;
      paymentIntentFails?: boolean;
    } = {},
  ) => {
    const {
      existingOrder = null,
      orderCreationFails = false,
      orderDeletionFails = false,
      orderUpdateFails = false,
      paymentIntentFails = false,
    } = options;

    const state = {
      cancelledPaymentIntents: [] as string[],
      createdOrders: [] as { id: string; idempotencyKey?: string }[],
      createdPaymentIntents: [] as { amount: number; orderId?: string }[],
      deletedOrders: [] as string[],
      updatedOrders: [] as { id: string; paymentIntentId: string }[],
    };

    const handlers = [
      // GetOrderByIdempotencyKey
      graphqlEndpoint.query("GetOrderByIdempotencyKey", () => {
        return HttpResponse.json({
          data: { orders: existingOrder ? [existingOrder] : [] },
        });
      }),

      // CreateOrder
      graphqlEndpoint.mutation("CreateOrder", ({ variables }) => {
        if (orderCreationFails) {
          return HttpResponse.json({ errors: [{ message: "Database error" }] });
        }
        const orderId = `order-${Date.now()}`;
        state.createdOrders.push({
          id: orderId,
          idempotencyKey: variables.object?.idempotency_key,
        });
        return HttpResponse.json({
          data: { insert_orders_one: { id: orderId } },
        });
      }),

      // UpdateOrderPaymentIntent
      graphqlEndpoint.mutation("UpdateOrderPaymentIntent", ({ variables }) => {
        if (orderUpdateFails) {
          return HttpResponse.json({ errors: [{ message: "Update failed" }] });
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
          return HttpResponse.json({ errors: [{ message: "Delete failed" }] });
        }
        state.deletedOrders.push(variables.id);
        return HttpResponse.json({
          data: { delete_orders_by_pk: { id: variables.id } },
        });
      }),

      // Stripe PaymentIntent creation
      http.post("https://api.stripe.com/v1/payment_intents", async ({ request }) => {
        if (paymentIntentFails) {
          return HttpResponse.json({ error: { message: "Card declined", type: "card_error" } }, { status: 402 });
        }
        const body = await request.text();
        const params = new URLSearchParams(body);
        state.createdPaymentIntents.push({
          amount: parseInt(params.get("amount") || "0"),
          orderId: params.get("metadata[orderId]") || undefined,
        });
        return HttpResponse.json({
          client_secret: "pi_test_secret",
          id: "pi_test_" + Date.now(),
          status: "requires_payment_method",
        });
      }),

      // Stripe PaymentIntent cancellation
      http.post("https://api.stripe.com/v1/payment_intents/:id/cancel", ({ params }) => {
        state.cancelledPaymentIntents.push(params.id as string);
        return HttpResponse.json({ id: params.id, status: "canceled" });
      }),
    ];

    return { handlers, state };
  },
};
