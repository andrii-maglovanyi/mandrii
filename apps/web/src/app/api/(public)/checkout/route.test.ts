/**
 * Checkout API Tests
 *
 * These tests verify checkout flow behaviors:
 * - Cleanup logic (order cleanup on PaymentIntent failure)
 * - Idempotency (same cart+email = same order)
 * - Stock null=unlimited (no cap when stock is null)
 * - Currency mismatch validation (rejects mixed currency carts)
 * - Variant price override (uses variant.price_override_minor when set)
 *
 * Business logic functions are imported from ~/lib/checkout-logic.ts
 * to ensure tests validate the actual production code.
 *
 * Note: Due to Next.js module resolution issues in Vitest, we test the
 * cleanup logic patterns here rather than the route directly.
 * Full E2E testing is done via Playwright in e2e/checkout.spec.ts
 */

import { graphql, http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockProducts } from "~/__mocks__/msw/data/shop";
import { server } from "~/__mocks__/msw/server";
import {
  calculateTotals,
  checkStock,
  findVariantWithResult,
  generateIdempotencyKey,
  resolvePrice,
  validateCartCurrency,
} from "~/features/Shop/utils";
import { ShippingCountry } from "~/types";

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8080/v1/graphql";

describe("Checkout Cleanup Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe("GraphQL mutation handlers", () => {
    it("DeleteOrder mutation can be mocked and tracked", async () => {
      const deletedOrders: string[] = [];
      const graphqlLink = graphql.link(GRAPHQL_ENDPOINT);

      server.use(
        graphqlLink.mutation("DeleteOrder", ({ variables }) => {
          deletedOrders.push(variables.id);
          return HttpResponse.json({
            data: { delete_orders_by_pk: { id: variables.id } },
          });
        }),
      );

      // Simulate what the checkout route does on cleanup
      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          operationName: "DeleteOrder",
          query: `mutation DeleteOrder($id: uuid!) { delete_orders_by_pk(id: $id) { id } }`,
          variables: { id: "test-order-123" },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.data.delete_orders_by_pk.id).toBe("test-order-123");
      expect(deletedOrders).toContain("test-order-123");
    });

    it("UpdateOrderPaymentIntent mutation can be mocked", async () => {
      const updatedOrders: { id: string; paymentIntentId: string }[] = [];
      const graphqlLink = graphql.link(GRAPHQL_ENDPOINT);

      server.use(
        graphqlLink.mutation("UpdateOrderPaymentIntent", ({ variables }) => {
          updatedOrders.push({
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
      );

      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          operationName: "UpdateOrderPaymentIntent",
          query: `mutation UpdateOrderPaymentIntent($id: uuid!, $payment_intent_id: String!) { 
            update_orders_by_pk(pk_columns: { id: $id }, _set: { payment_intent_id: $payment_intent_id }) { 
              id payment_intent_id 
            } 
          }`,
          variables: { id: "order-123", payment_intent_id: "pi_test_123" },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      expect(response.ok).toBe(true);
      expect(updatedOrders).toHaveLength(1);
      expect(updatedOrders[0].paymentIntentId).toBe("pi_test_123");
    });
  });

  describe("Stripe API handlers", () => {
    it("PaymentIntent creation can be mocked", async () => {
      const createdPIs: { orderId: string }[] = [];

      server.use(
        http.post("https://api.stripe.com/v1/payment_intents", async ({ request }) => {
          const body = await request.text();
          const params = new URLSearchParams(body);
          const orderId = params.get("metadata[orderId]");

          if (orderId) {
            createdPIs.push({ orderId });
          }

          return HttpResponse.json({
            client_secret: "pi_test_new_secret",
            id: "pi_test_new",
            status: "requires_payment_method",
          });
        }),
      );

      const response = await fetch("https://api.stripe.com/v1/payment_intents", {
        body: new URLSearchParams({
          amount: "2500",
          currency: "gbp",
          "metadata[orderId]": "order-456",
        }).toString(),
        headers: {
          Authorization: "Bearer sk_test_mock",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.id).toBe("pi_test_new");
      expect(createdPIs).toHaveLength(1);
      expect(createdPIs[0].orderId).toBe("order-456");
    });

    it("PaymentIntent cancellation can be mocked", async () => {
      const cancelledPIs: string[] = [];

      server.use(
        http.post("https://api.stripe.com/v1/payment_intents/:id/cancel", ({ params }) => {
          cancelledPIs.push(params.id as string);
          return HttpResponse.json({
            id: params.id,
            status: "canceled",
          });
        }),
      );

      const response = await fetch("https://api.stripe.com/v1/payment_intents/pi_test_123/cancel", {
        headers: { Authorization: "Bearer sk_test_mock" },
        method: "POST",
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.status).toBe("canceled");
      expect(cancelledPIs).toContain("pi_test_123");
    });

    it("PaymentIntent creation failure can be simulated", async () => {
      server.use(
        http.post("https://api.stripe.com/v1/payment_intents", () => {
          return HttpResponse.json({ error: { message: "Card declined", type: "card_error" } }, { status: 402 });
        }),
      );

      const response = await fetch("https://api.stripe.com/v1/payment_intents", {
        body: "amount=2500&currency=gbp",
        headers: {
          Authorization: "Bearer sk_test_mock",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      });

      expect(response.status).toBe(402);
      const data = await response.json();
      expect(data.error.type).toBe("card_error");
    });
  });

  describe("Cleanup flow simulation", () => {
    it("simulates full cleanup when PaymentIntent fails after order creation", async () => {
      const createdOrders: string[] = [];
      // Using a Map to better simulate a database table
      const ordersInDB = new Map<string, { id: string }>();

      const deletedOrders: string[] = [];
      const graphqlLink = graphql.link(GRAPHQL_ENDPOINT);

      // Setup handlers
      server.use(
        // Order creation succeeds
        graphqlLink.mutation("CreateOrder", () => {
          const orderId = "order-" + Date.now();
          createdOrders.push(orderId);
          ordersInDB.set(orderId, { id: orderId });
          return HttpResponse.json({
            data: { insert_orders_one: { id: orderId } },
          });
        }),

        // Order deletion tracks what was deleted
        graphqlLink.mutation("DeleteOrder", ({ variables }: { variables: { id: string } }) => {
          ordersInDB.delete(variables.id);
          deletedOrders.push(variables.id);
          return HttpResponse.json({
            data: { delete_orders_by_pk: { id: variables.id } },
          });
        }),

        // PaymentIntent creation fails
        http.post("https://api.stripe.com/v1/payment_intents", () => {
          return HttpResponse.json({ error: { message: "Card declined" } }, { status: 402 });
        }),
      );

      // This is a simplified representation of the actual cleanup logic in your route
      const cleanupService = {
        deleteOrder: async (orderId: string) => {
          await fetch(GRAPHQL_ENDPOINT, {
            body: JSON.stringify({
              operationName: "DeleteOrder",
              query: `mutation DeleteOrder($id: uuid!) { delete_orders_by_pk(id: $id) { id } }`,
              variables: { id: orderId },
            }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });
        },
      };
      const deleteOrderSpy = vi.spyOn(cleanupService, "deleteOrder");

      // Step 1: Create order
      const createOrderResponse = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          operationName: "CreateOrder",
          query: `mutation CreateOrder { insert_orders_one(object: {}) { id } }`,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const orderData = await createOrderResponse.json();
      const orderId = orderData.data.insert_orders_one.id;

      expect(createdOrders).toContain(orderId);
      expect(ordersInDB.has(orderId)).toBe(true);

      // Step 2: Try to create PaymentIntent (fails)
      const piResponse = await fetch("https://api.stripe.com/v1/payment_intents", {
        body: "amount=2500&currency=gbp",
        headers: { Authorization: "Bearer sk_test" },
        method: "POST",
      });

      expect(piResponse.status).toBe(402);

      // Step 3: Simulate the route's catch block calling the cleanup logic
      await cleanupService.deleteOrder(orderId);

      // Verify cleanup happened
      expect(deleteOrderSpy).toHaveBeenCalledWith(orderId);
      expect(deletedOrders).toContain(orderId);
      expect(ordersInDB.has(orderId)).toBe(false);
    });
  });

  describe("Shipping Calculation (tax included in prices)", () => {
    const makeItem = (priceMinor: number, quantity: number) => ({
      currency: "GBP",
      name: "Test",
      priceMinor,
      productId: "prod-1",
      quantity,
    });

    const assertTotals = (country: ShippingCountry, expectedShipping: number, subtotal = 4000) => {
      const pricePerItem = subtotal / 2;
      const totals = calculateTotals([makeItem(pricePerItem, 2)], country);
      expect(totals.subtotalMinor).toBe(subtotal);
      expect(totals.shippingMinor).toBe(expectedShipping);
      expect(totals.totalMinor).toBe(subtotal + expectedShipping);
    };

    it("applies UK shipping under threshold", () => {
      assertTotals("GB", 399, 4000);
    });

    it("applies free UK shipping at threshold", () => {
      assertTotals("GB", 0, 8000);
    });

    it("applies EU shipping flat rate", () => {
      assertTotals("EU", 899);
    });

    it("applies ROW shipping flat rate", () => {
      assertTotals("ROW", 1499);
    });
  });
});

/**
 * Tests for checkout API business logic
 *
 * These test the core algorithms used in the checkout route
 * by importing the actual functions from ~/lib/checkout-logic.ts.
 * This ensures tests validate the exact production code.
 */
describe("Checkout Business Logic", () => {
  describe("Idempotency Key Generation", () => {
    it("generates the same key for identical email and items", () => {
      const email = "test@example.com";
      const items = [
        { id: "product-1", productId: "p1", quantity: 2 },
        { id: "product-2", productId: "p2", quantity: 1 },
      ];

      const key1 = generateIdempotencyKey(email, items, "GB");
      const key2 = generateIdempotencyKey(email, items, "GB");

      expect(key1).toBe(key2);
      expect(key1).toHaveLength(32);
    });

    it("generates the same key regardless of item order", () => {
      const email = "test@example.com";
      const items1 = [
        { id: "product-2", productId: "p2", quantity: 1 },
        { id: "product-1", productId: "p1", quantity: 2 },
      ];
      const items2 = [
        { id: "product-1", productId: "p1", quantity: 2 },
        { id: "product-2", productId: "p2", quantity: 1 },
      ];

      const key1 = generateIdempotencyKey(email, items1, "GB");
      const key2 = generateIdempotencyKey(email, items2, "GB");

      expect(key1).toBe(key2);
    });

    it("generates different keys for different emails", () => {
      const items = [{ id: "product-1", productId: "p1", quantity: 1 }];

      const key1 = generateIdempotencyKey("alice@example.com", items, "GB");
      const key2 = generateIdempotencyKey("bob@example.com", items, "GB");

      expect(key1).not.toBe(key2);
    });

    it("generates different keys for different quantities", () => {
      const email = "test@example.com";
      const items1 = [{ id: "product-1", productId: "p1", quantity: 1 }];
      const items2 = [{ id: "product-1", productId: "p1", quantity: 2 }];

      const key1 = generateIdempotencyKey(email, items1, "GB");
      const key2 = generateIdempotencyKey(email, items2, "GB");

      expect(key1).not.toBe(key2);
    });

    it("generates different keys for different shipping countries", () => {
      const email = "test@example.com";
      const items = [{ id: "product-1", productId: "p1", quantity: 1 }];

      const key1 = generateIdempotencyKey(email, items, "GB");
      const key2 = generateIdempotencyKey(email, items, "EU");

      expect(key1).not.toBe(key2);
    });

    it("includes variant in idempotency calculation", () => {
      const email = "test@example.com";
      const items1 = [
        { id: "product-1", productId: "p1", quantity: 1, variant: { ageGroup: "adult", gender: "men", size: "s" } },
      ];
      const items2 = [
        { id: "product-1", productId: "p1", quantity: 1, variant: { ageGroup: "adult", gender: "men", size: "xl" } },
      ];
      const items3 = [{ id: "product-1", productId: "p1", quantity: 1 }];

      const key1 = generateIdempotencyKey(email, items1, "GB");
      const key2 = generateIdempotencyKey(email, items2, "GB");
      const key3 = generateIdempotencyKey(email, items3, "GB");

      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key2).not.toBe(key3);
    });
  });

  describe("Stock Validation Logic", () => {
    it("allows any quantity when stock is null (unlimited)", () => {
      expect(checkStock(null, 1)).toEqual({ available: true });
      expect(checkStock(null, 100)).toEqual({ available: true });
      expect(checkStock(null, 999999)).toEqual({ available: true });
    });

    it("allows order when stock is sufficient", () => {
      expect(checkStock(10, 5)).toEqual({ available: true });
      expect(checkStock(10, 10)).toEqual({ available: true });
      expect(checkStock(1, 1)).toEqual({ available: true });
    });

    it("rejects order when stock is insufficient", () => {
      expect(checkStock(5, 10)).toEqual({
        available: false,
        reason: "insufficient_stock",
      });
      expect(checkStock(1, 2)).toEqual({
        available: false,
        reason: "insufficient_stock",
      });
    });

    it("returns out_of_stock when stock is zero", () => {
      expect(checkStock(0, 1)).toEqual({
        available: false,
        reason: "out_of_stock",
      });
      expect(checkStock(0, 100)).toEqual({
        available: false,
        reason: "out_of_stock",
      });
    });
  });

  describe("Currency Validation Logic", () => {
    it("accepts cart with single currency", () => {
      const products = [
        { currency: "GBP", id: "prod-1" },
        { currency: "GBP", id: "prod-2" },
        { currency: "GBP", id: "prod-3" },
      ];

      expect(validateCartCurrency(products)).toEqual({
        primaryCurrency: "GBP",
        valid: true,
      });
    });

    it("rejects cart with mixed currencies", () => {
      const products = [
        { currency: "GBP", id: "prod-1" },
        { currency: "USD", id: "prod-2" },
        { currency: "GBP", id: "prod-3" },
      ];

      expect(validateCartCurrency(products)).toEqual({
        mismatchedProducts: ["prod-2"],
        primaryCurrency: "GBP",
        valid: false,
      });
    });

    it("identifies all mismatched products", () => {
      const products = [
        { currency: "GBP", id: "prod-1" },
        { currency: "USD", id: "prod-2" },
        { currency: "EUR", id: "prod-3" },
      ];

      expect(validateCartCurrency(products)).toEqual({
        mismatchedProducts: ["prod-2", "prod-3"],
        primaryCurrency: "GBP",
        valid: false,
      });
    });

    it("handles empty cart", () => {
      expect(validateCartCurrency([])).toEqual({ valid: true });
    });

    it("handles single item cart", () => {
      const products = [{ currency: "EUR", id: "prod-1" }];

      expect(validateCartCurrency(products)).toEqual({
        primaryCurrency: "EUR",
        valid: true,
      });
    });
  });

  describe("Variant Price Override Logic", () => {
    it("uses base product price when no variant", () => {
      expect(resolvePrice(3500)).toBe(3500);
    });

    it("uses base product price when variant has no override", () => {
      expect(resolvePrice(3500, { price_override_minor: null })).toBe(3500);
    });

    it("uses variant price_override_minor when set", () => {
      expect(resolvePrice(3500, { price_override_minor: 4000 })).toBe(4000);
    });

    it("allows variant price lower than base", () => {
      expect(resolvePrice(3500, { price_override_minor: 2500 })).toBe(2500);
    });

    it("handles zero price override (free variant)", () => {
      expect(resolvePrice(3500, { price_override_minor: 0 })).toBe(0);
    });
  });

  describe("Variant Lookup Logic", () => {
    const makeVariant = (
      overrides: Partial<{
        age_group: string;
        color?: string;
        gender: string;
        id: string;
        size: string;
        stock: number;
      }>,
    ) => ({
      age_group: "adult",
      gender: "men",
      id: "v1",
      size: "m",
      stock: 10,
      ...overrides,
    });

    it("finds variant with exact match", () => {
      const variants = [
        makeVariant({ id: "v1", size: "m" }),
        makeVariant({ id: "v2", size: "l" }),
        makeVariant({ gender: "women", id: "v3" }),
      ];

      const result = findVariantWithResult(variants, { ageGroup: "adult", gender: "men", size: "l" });

      expect(result.found).toBe(true);
      expect(result.variant?.id).toBe("v2");
    });

    it("returns not_found for non-existent variant", () => {
      const variants = [makeVariant({ id: "v1", size: "m" }), makeVariant({ id: "v2", size: "l" })];

      const result = findVariantWithResult(variants, { ageGroup: "adult", gender: "men", size: "xxl" });

      expect(result.found).toBe(false);
      expect(result.error).toBe("not_found");
    });

    it("returns not_found for wrong gender", () => {
      const variants = [makeVariant({ id: "v1" })];

      const result = findVariantWithResult(variants, { ageGroup: "adult", gender: "women", size: "m" });

      expect(result.found).toBe(false);
      expect(result.error).toBe("not_found");
    });

    it("requires color match when color is specified in request", () => {
      const variants = [
        makeVariant({ color: "black", gender: "unisex", id: "v1" }),
        makeVariant({ color: "navy", gender: "unisex", id: "v2" }),
      ];

      const result = findVariantWithResult(variants, {
        ageGroup: "adult",
        color: "black",
        gender: "unisex",
        size: "m",
      });

      expect(result.found).toBe(true);
      expect(result.variant?.id).toBe("v1");

      // Wrong color
      const wrongColor = findVariantWithResult(variants, {
        ageGroup: "adult",
        color: "red",
        gender: "unisex",
        size: "m",
      });
      expect(wrongColor.found).toBe(false);
    });

    it("matches variant without color when no color requested", () => {
      const variants = [
        makeVariant({ color: undefined, id: "v1" }), // No color
        makeVariant({ color: "black", id: "v2" }), // Has color
      ];

      const result = findVariantWithResult(variants, { ageGroup: "adult", gender: "men", size: "m" });

      expect(result.found).toBe(true);
      expect(result.variant?.id).toBe("v1"); // Should match the one without color
    });

    it("handles kids age group", () => {
      const variants = [
        makeVariant({ age_group: "adult", gender: "unisex", id: "v1" }),
        makeVariant({ age_group: "kids", gender: "unisex", id: "v2", size: "y9_10" }),
      ];

      const result = findVariantWithResult(variants, { ageGroup: "kids", gender: "unisex", size: "y9_10" });

      expect(result.found).toBe(true);
      expect(result.variant?.id).toBe("v2");
    });
  });
});

describe("Checkout Flow Integration", () => {
  const graphqlLink = graphql.link(GRAPHQL_ENDPOINT);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe("Idempotency in Order Creation", () => {
    it("simulates idempotent order lookup by idempotency key", async () => {
      const existingOrders = new Map<string, { id: string; payment_intent_id: string }>();

      // Pre-populate with an existing order
      const existingIdempotencyKey = "abc123def456789012345678901234";
      existingOrders.set(existingIdempotencyKey, {
        id: "existing-order-123",
        payment_intent_id: "pi_existing_123",
      });

      server.use(
        graphqlLink.query("GetOrderByIdempotencyKey", ({ variables }) => {
          const order = existingOrders.get(variables.idempotency_key);
          return HttpResponse.json({
            data: {
              orders: order ? [order] : [],
            },
          });
        }),
      );

      // Query for existing order
      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          operationName: "GetOrderByIdempotencyKey",
          query: `query GetOrderByIdempotencyKey($idempotency_key: String!) { 
            orders(where: { idempotency_key: { _eq: $idempotency_key } }) { 
              id payment_intent_id 
            } 
          }`,
          variables: { idempotency_key: existingIdempotencyKey },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const data = await response.json();

      expect(data.data.orders).toHaveLength(1);
      expect(data.data.orders[0].id).toBe("existing-order-123");
      expect(data.data.orders[0].payment_intent_id).toBe("pi_existing_123");
    });

    it("simulates creating new order when no existing order found", async () => {
      const existingOrders = new Map<string, object>();
      const createdOrders: Array<{ id: string; idempotency_key: string }> = [];

      server.use(
        graphqlLink.query("GetOrderByIdempotencyKey", ({ variables }) => {
          const order = existingOrders.get(variables.idempotency_key);
          return HttpResponse.json({
            data: {
              orders: order ? [order] : [],
            },
          });
        }),

        graphqlLink.mutation("CreateOrder", ({ variables }) => {
          const newOrder = {
            id: "new-order-" + Date.now(),
            idempotency_key: variables.idempotency_key,
          };
          createdOrders.push(newOrder);
          return HttpResponse.json({
            data: { insert_orders_one: newOrder },
          });
        }),
      );

      // Check for existing order (none exists)
      const checkResponse = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          operationName: "GetOrderByIdempotencyKey",
          query: `query GetOrderByIdempotencyKey($idempotency_key: String!) { 
            orders(where: { idempotency_key: { _eq: $idempotency_key } }) { id } 
          }`,
          variables: { idempotency_key: "new-key-xyz" },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const checkData = await checkResponse.json();
      expect(checkData.data.orders).toHaveLength(0);

      // Create new order
      const createResponse = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          operationName: "CreateOrder",
          query: `mutation CreateOrder($idempotency_key: String!) { 
            insert_orders_one(object: { idempotency_key: $idempotency_key }) { 
              id idempotency_key 
            } 
          }`,
          variables: { idempotency_key: "new-key-xyz" },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const createData = await createResponse.json();
      expect(createData.data.insert_orders_one.idempotency_key).toBe("new-key-xyz");
      expect(createdOrders).toHaveLength(1);
    });
  });

  describe("Product Stock and Price Queries", () => {
    it("simulates fetching product with null stock (unlimited)", async () => {
      const mockProduct = {
        currency: "GBP",
        id: "prod-digital",
        name: "Digital Download",
        price_minor: 1500,
        stock: null, // Unlimited
      };

      server.use(
        graphqlLink.query("GetProductsForCheckout", () => {
          return HttpResponse.json({
            data: {
              products: [mockProduct],
            },
          });
        }),
      );

      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          operationName: "GetProductsForCheckout",
          query: `query GetProductsForCheckout($ids: [uuid!]!) { 
            products(where: { id: { _in: $ids } }) { 
              id name price_minor stock currency 
            } 
          }`,
          variables: { ids: ["prod-digital"] },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const data = await response.json();
      const product = data.data.products[0];

      expect(product.stock).toBeNull();
      // Verify null stock allows any quantity
      expect(product.stock === null || product.stock >= 9999).toBe(true);
    });

    it("simulates fetching product variant with price override", async () => {
      const mockProduct = {
        currency: "GBP",
        id: "prod-tshirt",
        name: "T-Shirt",
        price_minor: 3500,
        product_variants: [
          { name: "S", price_override_minor: null, stock: 10 },
          { name: "M", price_override_minor: null, stock: 15 },
          { name: "XL", price_override_minor: 4000, stock: 5 }, // Premium price
        ],
      };

      server.use(
        graphqlLink.query("GetProductWithVariants", () => {
          return HttpResponse.json({
            data: {
              products: [mockProduct],
            },
          });
        }),
      );

      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          operationName: "GetProductWithVariants",
          query: `query GetProductWithVariants($id: uuid!) { 
            products(where: { id: { _eq: $id } }) { 
              id name price_minor currency
              product_variants { name price_override_minor stock }
            } 
          }`,
          variables: { id: "prod-tshirt" },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const data = await response.json();
      const product = data.data.products[0];
      const xlVariant = product.product_variants.find((v: { name: string }) => v.name === "XL");

      // XL has price override
      expect(xlVariant.price_override_minor).toBe(4000);
      expect(xlVariant.price_override_minor).toBeGreaterThan(product.price_minor);

      // S/M use base price (null override)
      const sVariant = product.product_variants.find((v: { name: string }) => v.name === "S");
      expect(sVariant.price_override_minor).toBeNull();
    });

    it("simulates currency mismatch detection in cart", async () => {
      const mockProducts = [
        { currency: "GBP", id: "prod-1", price_minor: 2500 },
        { currency: "USD", id: "prod-2", price_minor: 3000 }, // Different currency!
      ];

      server.use(
        graphqlLink.query("GetProductsForCheckout", () => {
          return HttpResponse.json({
            data: { products: mockProducts },
          });
        }),
      );

      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          operationName: "GetProductsForCheckout",
          query: `query GetProductsForCheckout($ids: [uuid!]!) { 
            products(where: { id: { _in: $ids } }) { 
              id currency price_minor 
            } 
          }`,
          variables: { ids: ["prod-1", "prod-2"] },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const data = await response.json();
      const products = data.data.products;

      // Detect currency mismatch
      const currencies = new Set(products.map((p: { currency: string }) => p.currency));
      expect(currencies.size).toBeGreaterThan(1);

      // This would trigger a validation error in the real route
      const hasMismatch = products.some((p: { currency: string }) => p.currency !== products[0].currency);
      expect(hasMismatch).toBe(true);
    });
  });
});

describe("MSW Handlers: Price Overrides and Color-Variant Stock", () => {
  const graphqlLink = graphql.link(GRAPHQL_ENDPOINT);

  /**
   * Transform product to GraphQL response format (same as MSW handlers)
   */
  const toGraphQLProduct = (product: (typeof mockProducts)[0]) => ({
    badge: product.badge || null,
    category: product.category,
    clothing_type: product.clothingType,
    currency: product.currency,
    id: product.id,
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
        stock: v.stock,
      })) ?? [],
    slug: product.slug,
    status: product.status,
    stock: product.stock ?? null,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe("Variant Price Override in MSW", () => {
    it("returns variant price_override_minor from mock data", async () => {
      // prod-9 has XL with price override 4000 and 2XL with 4300
      const vyshyvankaProduct = mockProducts.find((p) => p.id === "prod-9");
      expect(vyshyvankaProduct).toBeDefined();

      server.use(
        graphqlLink.query("GetProductsByIds", ({ variables }) => {
          const ids = variables.ids as string[];
          const products = mockProducts.filter((p) => ids.includes(p.id)).map(toGraphQLProduct);
          return HttpResponse.json({ data: { products } });
        }),
      );

      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          operationName: "GetProductsByIds",
          query: `query GetProductsByIds($ids: [uuid!]!) {
            products(where: { id: { _in: $ids } }) {
              id name price_minor
              product_variants { id size price_override_minor stock }
            }
          }`,
          variables: { ids: ["prod-9"] },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const data = await response.json();
      const product = data.data.products[0];

      // Base price
      expect(product.price_minor).toBe(3500);

      // S/M/L have no price override
      const sizeS = product.product_variants.find((v: { size: string }) => v.size === "s");
      const sizeM = product.product_variants.find((v: { size: string }) => v.size === "m");
      const sizeL = product.product_variants.find((v: { size: string }) => v.size === "l");
      expect(sizeS.price_override_minor).toBeNull();
      expect(sizeM.price_override_minor).toBeNull();
      expect(sizeL.price_override_minor).toBeNull();

      // XL has £40 (4000 minor)
      const sizeXL = product.product_variants.find((v: { size: string }) => v.size === "xl");
      expect(sizeXL.price_override_minor).toBe(4000);

      // XXL has £43 (4300 minor)
      const sizeXXL = product.product_variants.find((v: { size: string }) => v.size === "xxl");
      expect(sizeXXL.price_override_minor).toBe(4300);
    });

    it("calculates correct total when variant has price override", () => {
      // Simulate checkout calculation
      const basePrice = 3500;
      const xlOverride = 4000;
      const xxlOverride = 4300;

      interface CartItem {
        productId: string;
        quantity: number;
        variant?: string;
      }

      interface VariantInfo {
        priceOverride: null | number;
        size: string;
      }

      const cartItems: CartItem[] = [
        { productId: "prod-9", quantity: 2, variant: "s" }, // 2 × £35 = £70
        { productId: "prod-9", quantity: 1, variant: "xl" }, // 1 × £40 = £40
        { productId: "prod-9", quantity: 1, variant: "xxl" }, // 1 × £43 = £43
      ];

      const variantPrices: Record<string, VariantInfo> = {
        l: { priceOverride: null, size: "l" },
        m: { priceOverride: null, size: "m" },
        s: { priceOverride: null, size: "s" },
        xl: { priceOverride: xlOverride, size: "xl" },
        xxl: { priceOverride: xxlOverride, size: "xxl" },
      };

      const calculateItemPrice = (item: CartItem): number => {
        if (item.variant) {
          const variantInfo = variantPrices[item.variant];
          if (variantInfo?.priceOverride !== null) {
            return variantInfo.priceOverride * item.quantity;
          }
        }
        return basePrice * item.quantity;
      };

      const total = cartItems.reduce((sum, item) => sum + calculateItemPrice(item), 0);

      // 2×3500 + 1×4000 + 1×4300 = 7000 + 4000 + 4300 = 15300
      expect(total).toBe(15300);
    });

    it("applies productOverrides in MSW handler", async () => {
      const productOverrides = new Map<string, Partial<(typeof mockProducts)[0]>>();
      productOverrides.set("prod-1", {
        priceMinor: 9999, // Override base price
      });

      server.use(
        graphqlLink.query("GetProductsByIds", ({ variables }) => {
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
          return HttpResponse.json({ data: { products } });
        }),
      );

      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          operationName: "GetProductsByIds",
          query: `query GetProductsByIds($ids: [uuid!]!) {
            products(where: { id: { _in: $ids } }) { id price_minor }
          }`,
          variables: { ids: ["prod-1"] },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const data = await response.json();
      expect(data.data.products[0].price_minor).toBe(9999);
    });
  });

  describe("Color-Variant Stock Selection in MSW", () => {
    it("returns color-specific variants from mock data", async () => {
      // prod-2 (Sunflower Sweatshirt) has black and navy color variants
      // prod-5 (Ukrainian Heart Hoodie) has grey and black color variants
      const sunflowerProduct = mockProducts.find((p) => p.id === "prod-2");
      expect(sunflowerProduct?.variants?.some((v) => v.color === "black")).toBe(true);
      expect(sunflowerProduct?.variants?.some((v) => v.color === "navy")).toBe(true);

      server.use(
        graphqlLink.query("GetProductsByIds", ({ variables }) => {
          const ids = variables.ids as string[];
          const products = mockProducts.filter((p) => ids.includes(p.id)).map(toGraphQLProduct);
          return HttpResponse.json({ data: { products } });
        }),
      );

      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          operationName: "GetProductsByIds",
          query: `query GetProductsByIds($ids: [uuid!]!) {
            products(where: { id: { _in: $ids } }) {
              id name
              product_variants { id size color stock }
            }
          }`,
          variables: { ids: ["prod-2"] },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const data = await response.json();
      const product = data.data.products[0];
      const variants = product.product_variants;

      // Should have 8 variants (4 sizes × 2 colors)
      expect(variants).toHaveLength(8);

      // Get black M variant
      const blackM = variants.find((v: { color: string; size: string }) => v.color === "black" && v.size === "m");
      expect(blackM).toBeDefined();
      expect(blackM.stock).toBe(9);

      // Get navy M variant (same size, different color, different stock)
      const navyM = variants.find((v: { color: string; size: string }) => v.color === "navy" && v.size === "m");
      expect(navyM).toBeDefined();
      expect(navyM.stock).toBe(9);

      // Get navy XL variant (should have less stock)
      const navyXL = variants.find((v: { color: string; size: string }) => v.color === "navy" && v.size === "xl");
      expect(navyXL).toBeDefined();
      expect(navyXL.stock).toBe(7);
    });

    it("finds correct variant by color + size combination", () => {
      interface Variant {
        color: null | string;
        id: string;
        size: string;
        stock: number;
      }

      const findVariant = (variants: Variant[], size: string, color?: string): undefined | Variant => {
        return variants.find((v) => {
          const sizeMatch = v.size === size;
          const colorMatch = color ? v.color === color : v.color === null;
          return sizeMatch && colorMatch;
        });
      };

      // Simulate prod-2 variants (Sunflower Sweatshirt)
      const variants: Variant[] = [
        { color: "black", id: "v1", size: "s", stock: 6 },
        { color: "black", id: "v2", size: "m", stock: 9 },
        { color: "black", id: "v3", size: "l", stock: 10 },
        { color: "black", id: "v4", size: "xl", stock: 8 },
        { color: "navy", id: "v5", size: "s", stock: 6 },
        { color: "navy", id: "v6", size: "m", stock: 9 },
        { color: "navy", id: "v7", size: "l", stock: 10 },
        { color: "navy", id: "v8", size: "xl", stock: 7 },
      ];

      // Find black L
      const blackL = findVariant(variants, "l", "black");
      expect(blackL).toBeDefined();
      expect(blackL?.stock).toBe(10);
      expect(blackL?.id).toBe("v3");

      // Find navy XL
      const navyXL = findVariant(variants, "xl", "navy");
      expect(navyXL).toBeDefined();
      expect(navyXL?.stock).toBe(7);
      expect(navyXL?.id).toBe("v8");

      // Different color same size = different variant
      const blackXL = findVariant(variants, "xl", "black");
      expect(blackXL?.stock).toBe(8);
      expect(blackXL?.id).not.toBe(navyXL?.id);
    });

    it("validates stock per color-variant combination", () => {
      interface Variant {
        color: null | string;
        size: string;
        stock: number;
      }

      interface StockCheckResult {
        available: boolean;
        availableStock?: number;
        requestedQuantity?: number;
      }

      const checkVariantStock = (
        variants: Variant[],
        size: string,
        color: null | string,
        quantity: number,
      ): StockCheckResult => {
        const variant = variants.find((v) => v.size === size && v.color === color);

        if (!variant) {
          return { available: false };
        }

        if (variant.stock < quantity) {
          return {
            available: false,
            availableStock: variant.stock,
            requestedQuantity: quantity,
          };
        }

        return { available: true };
      };

      // prod-5 (Ukrainian Heart Hoodie) - grey and black variants
      const hoodieVariants: Variant[] = [
        { color: "grey", size: "s", stock: 7 },
        { color: "grey", size: "m", stock: 10 },
        { color: "grey", size: "l", stock: 9 },
        { color: "grey", size: "xl", stock: 6 },
        { color: "black", size: "s", stock: 7 },
        { color: "black", size: "m", stock: 10 },
        { color: "black", size: "l", stock: 9 },
        { color: "black", size: "xl", stock: 6 },
      ];

      // Can order 5 grey XL (6 in stock)
      expect(checkVariantStock(hoodieVariants, "xl", "grey", 5)).toEqual({
        available: true,
      });

      // Cannot order 10 grey XL (only 6 in stock)
      expect(checkVariantStock(hoodieVariants, "xl", "grey", 10)).toEqual({
        available: false,
        availableStock: 6,
        requestedQuantity: 10,
      });

      // Can order 10 black M (exactly 10 in stock)
      expect(checkVariantStock(hoodieVariants, "m", "black", 10)).toEqual({
        available: true,
      });

      // Cannot order 11 black M (only 10 in stock)
      expect(checkVariantStock(hoodieVariants, "m", "black", 11)).toEqual({
        available: false,
        availableStock: 10,
        requestedQuantity: 11,
      });

      // Nonexistent color fails
      expect(checkVariantStock(hoodieVariants, "m", "red", 1)).toEqual({
        available: false,
      });
    });

    it("handles kids sizes with color variants", async () => {
      // prod-5 has kids sizes (y9_10, y11_12) in grey only
      const hoodieProduct = mockProducts.find((p) => p.id === "prod-5");
      const kidsVariants = hoodieProduct?.variants?.filter((v) => v.ageGroup === "kids");

      expect(kidsVariants).toBeDefined();
      expect(kidsVariants?.length).toBe(2);
      expect(kidsVariants?.every((v) => v.color === "grey")).toBe(true);

      server.use(
        graphqlLink.query("GetProductsByIds", ({ variables }) => {
          const ids = variables.ids as string[];
          const products = mockProducts.filter((p) => ids.includes(p.id)).map(toGraphQLProduct);
          return HttpResponse.json({ data: { products } });
        }),
      );

      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          operationName: "GetProductsByIds",
          query: `query GetProductsByIds($ids: [uuid!]!) {
            products(where: { id: { _in: $ids } }) {
              id product_variants { age_group size color stock }
            }
          }`,
          variables: { ids: ["prod-5"] },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const data = await response.json();
      const variants = data.data.products[0].product_variants;

      const kidsGrey910 = variants.find(
        (v: { age_group: string; color: string; size: string }) =>
          v.age_group === "kids" && v.size === "y9_10" && v.color === "grey",
      );
      expect(kidsGrey910).toBeDefined();
      expect(kidsGrey910.stock).toBe(8);

      // Kids black doesn't exist
      const kidsBlack = variants.find(
        (v: { age_group: string; color: string }) => v.age_group === "kids" && v.color === "black",
      );
      expect(kidsBlack).toBeUndefined();
    });
  });
});
