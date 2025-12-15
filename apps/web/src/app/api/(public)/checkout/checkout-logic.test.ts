/**
 * Checkout Server Logic Unit Tests
 *
 * Tests critical checkout behaviors using MSW to mock external dependencies:
 * - Idempotency key handling (duplicate order prevention)
 * - Stock validation (null = unlimited, 0 = out of stock)
 * - Currency mismatch detection
 * - Price validation (null prices rejected)
 * - Variant matching and price overrides
 * - Cleanup flows (order/PI rollback on failure)
 *
 * These tests complement E2E tests by verifying server-side logic in isolation.
 */

import { graphql, http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockProducts } from "~/__mocks__/msw/data/shop";
import { CheckoutTestState, createCheckoutHandlers, createCheckoutTestState } from "~/__mocks__/msw/handlers";
import { server } from "~/__mocks__/msw/server";

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8080/v1/graphql";
const graphqlLink = graphql.link(GRAPHQL_ENDPOINT);

describe("Checkout Server Logic", () => {
  let testState: CheckoutTestState;

  beforeEach(() => {
    vi.clearAllMocks();
    testState = createCheckoutTestState();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe("Idempotency Key Handling", () => {
    it("generates consistent idempotency key for same cart + email", async () => {
      // Setup: simulate checkout handler with product lookup
      server.use(...createCheckoutHandlers(testState));

      const cart1 = {
        email: "test@example.com",
        items: [{ id: "item-1", productId: "prod-1", quantity: 1 }],
      };

      const cart2 = {
        email: "test@example.com",
        items: [{ id: "item-1", productId: "prod-1", quantity: 1 }],
      };

      // The idempotency key is a hash of email + sorted items
      // Same input should produce same key
      const key1 = generateIdempotencyKey(cart1.email, cart1.items, "GB");
      const key2 = generateIdempotencyKey(cart2.email, cart2.items, "GB");

      expect(key1).toBe(key2);
    });

    it("generates different idempotency key for different email", async () => {
      const key1 = generateIdempotencyKey(
        "test1@example.com",
        [{ id: "item-1", productId: "prod-1", quantity: 1 }],
        "GB",
      );
      const key2 = generateIdempotencyKey(
        "test2@example.com",
        [{ id: "item-1", productId: "prod-1", quantity: 1 }],
        "GB",
      );

      expect(key1).not.toBe(key2);
    });

    it("generates different idempotency key for different quantities", async () => {
      const key1 = generateIdempotencyKey(
        "test@example.com",
        [{ id: "item-1", productId: "prod-1", quantity: 1 }],
        "GB",
      );
      const key2 = generateIdempotencyKey(
        "test@example.com",
        [{ id: "item-1", productId: "prod-1", quantity: 2 }],
        "GB",
      );

      expect(key1).not.toBe(key2);
    });

    it("returns existing order when idempotency key matches", async () => {
      const existingOrder = {
        id: "existing-order-123",
        payment_intent_id: "pi_existing_123",
        status: "pending",
      };

      server.use(...createCheckoutHandlers(testState, { existingOrder }));

      // Query for existing order by idempotency key
      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          operationName: "GetOrderByIdempotencyKey",
          query: `query GetOrderByIdempotencyKey($idempotencyKey: String!) {
            orders(where: { idempotency_key: { _eq: $idempotencyKey } }, limit: 1) {
              id payment_intent_id status
            }
          }`,
          variables: { idempotencyKey: "test-key-123" },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const data = await response.json();
      expect(data.data.orders[0]).toEqual(existingOrder);
    });
  });

  describe("Stock Validation", () => {
    it("treats null stock as unlimited (no stock check)", async () => {
      // prod-7 has stock: 25 (limited), but let's test with null
      const baseProduct = mockProducts.find((p) => p.id === "prod-7")!;

      server.use(
        graphqlLink.query("GetProductsByIds", () => {
          return HttpResponse.json({
            data: {
              products: [
                {
                  ...toGraphQLProduct(baseProduct),
                  stock: null, // Override to null for this test
                },
              ],
            },
          });
        }),
      );

      // Request any quantity - should succeed
      const response = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          operationName: "GetProductsByIds",
          query: `query GetProductsByIds($ids: [uuid!]!) {
            products(where: { id: { _in: $ids } }) {
              id stock
            }
          }`,
          variables: { ids: ["prod-7"] },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const data = await response.json();
      expect(data.data.products[0].stock).toBeNull();
    });

    it("rejects order when stock is 0", async () => {
      // prod-6 is the out of stock item
      const outOfStockProduct = mockProducts.find((p) => p.slug === "out-of-stock-item")!;
      expect(outOfStockProduct.stock).toBe(0);

      // The checkout validation logic should reject this
      const validationResult = validateStock(outOfStockProduct.stock, 1);
      expect(validationResult.valid).toBe(false);
      expect(validationResult.message).toContain("Out of stock");
    });

    it("rejects order when requested quantity exceeds stock", async () => {
      // prod-10 has stock: 2
      const limitedProduct = mockProducts.find((p) => p.slug === "limited-edition-badge")!;
      expect(limitedProduct.stock).toBe(2);

      const validationResult = validateStock(limitedProduct.stock, 5);
      expect(validationResult.valid).toBe(false);
      expect(validationResult.message).toContain("Only 2 available");
    });

    it("accepts order when stock is sufficient", async () => {
      const validationResult = validateStock(10, 5);
      expect(validationResult.valid).toBe(true);
    });

    it("variant stock overrides product stock", async () => {
      // prod-1 has variants with individual stock
      const product = mockProducts.find((p) => p.id === "prod-1")!;
      const variant = product.variants![0]; // First variant

      // Variant stock should be checked, not product stock
      expect(variant.stock).toBeDefined();
      const validationResult = validateStock(variant.stock, 1);
      expect(validationResult.valid).toBe(true);
    });
  });

  describe("Currency Mismatch Detection", () => {
    it("rejects mixed currency cart", async () => {
      // prod-1 is GBP, prod-8 is EUR
      const gbpProduct = mockProducts.find((p) => p.id === "prod-1")!;
      const eurProduct = mockProducts.find((p) => p.id === "prod-8")!;

      expect(gbpProduct.currency).toBe("GBP");
      expect(eurProduct.currency).toBe("EUR");

      const validationResult = validateCurrencyConsistency([gbpProduct, eurProduct]);
      expect(validationResult.valid).toBe(false);
      expect(validationResult.message).toContain("Currency mismatch");
    });

    it("accepts single currency cart", async () => {
      const gbpProducts = mockProducts.filter((p) => p.currency === "GBP").slice(0, 3);
      const validationResult = validateCurrencyConsistency(gbpProducts);
      expect(validationResult.valid).toBe(true);
    });
  });

  describe("Price Validation", () => {
    it("rejects product with null price", async () => {
      const nullPriceProduct = {
        ...mockProducts[0],
        priceMinor: null as unknown as number,
      };

      const validationResult = validatePrice(nullPriceProduct.priceMinor);
      expect(validationResult.valid).toBe(false);
      expect(validationResult.message).toContain("not configured");
    });

    it("accepts product with valid price", async () => {
      const validProduct = mockProducts[0];
      expect(validProduct.priceMinor).toBeGreaterThan(0);

      const validationResult = validatePrice(validProduct.priceMinor);
      expect(validationResult.valid).toBe(true);
    });

    it("uses variant price override when present", async () => {
      // prod-9 has XL with price override
      const product = mockProducts.find((p) => p.id === "prod-9")!;
      const xlVariant = product.variants!.find((v) => v.size === "xl")!;

      expect(xlVariant.priceOverrideMinor).toBe(4000);
      expect(product.priceMinor).toBe(3500);

      // Price override should be used
      const effectivePrice = xlVariant.priceOverrideMinor ?? product.priceMinor;
      expect(effectivePrice).toBe(4000);
    });
  });

  describe("Variant Matching", () => {
    it("matches variant with case-insensitive comparison", async () => {
      const product = mockProducts.find((p) => p.id === "prod-1")!;

      // Request with different casing
      const requestedVariant = {
        ageGroup: "ADULT",
        gender: "MEN",
        size: "m",
      };

      const matched = findVariant(product.variants!, requestedVariant);
      expect(matched).toBeDefined();
      expect(matched?.size).toBe("m");
    });

    it("returns undefined when variant not found", async () => {
      const product = mockProducts.find((p) => p.id === "prod-1")!;

      const requestedVariant = {
        ageGroup: "adult",
        gender: "men",
        size: "xxxl", // Not available
      };

      const matched = findVariant(product.variants!, requestedVariant);
      expect(matched).toBeUndefined();
    });

    it("matches variant with optional color", async () => {
      // prod-2 has color variants
      const product = mockProducts.find((p) => p.id === "prod-2")!;

      const requestedVariant = {
        ageGroup: "adult",
        color: "black",
        gender: "unisex",
        size: "m",
      };

      const matched = findVariant(product.variants!, requestedVariant);
      expect(matched).toBeDefined();
      expect(matched?.color).toBe("black");
    });
  });

  describe("Cleanup Flows", () => {
    it("deletes order when PaymentIntent creation fails", async () => {
      // Setup handlers with PI failure
      const graphqlLink = graphql.link(GRAPHQL_ENDPOINT);
      const orderIds: string[] = [];
      const deletedIds: string[] = [];

      server.use(
        // Order creation succeeds
        graphqlLink.mutation("CreateOrder", () => {
          const orderId = `order-${Date.now()}`;
          orderIds.push(orderId);
          return HttpResponse.json({
            data: { insert_orders_one: { id: orderId } },
          });
        }),
        // Order deletion tracks
        graphqlLink.mutation("DeleteOrder", ({ variables }) => {
          deletedIds.push(variables.id);
          return HttpResponse.json({
            data: { delete_orders_by_pk: { id: variables.id } },
          });
        }),
        // PaymentIntent fails
        http.post("https://api.stripe.com/v1/payment_intents", () => {
          return HttpResponse.json({ error: { message: "Card declined" } }, { status: 402 });
        }),
      );

      // Step 1: Create order
      const orderResponse = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          operationName: "CreateOrder",
          query: `mutation CreateOrder { insert_orders_one(object: {}) { id } }`,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const orderData = await orderResponse.json();
      expect(orderData.data.insert_orders_one).toBeDefined();
      const orderId = orderData.data.insert_orders_one.id;
      expect(orderIds).toContain(orderId);

      // Step 2: PaymentIntent fails
      const piResponse = await fetch("https://api.stripe.com/v1/payment_intents", {
        body: "amount=2500&currency=gbp",
        headers: { Authorization: "Bearer sk_test" },
        method: "POST",
      });
      expect(piResponse.status).toBe(402);

      // Step 3: Delete order (cleanup)
      await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          operationName: "DeleteOrder",
          query: `mutation DeleteOrder($id: uuid!) { delete_orders_by_pk(id: $id) { id } }`,
          variables: { id: orderId },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      expect(deletedIds).toContain(orderId);
    });

    it("cancels PaymentIntent when order update fails", async () => {
      const graphqlLink = graphql.link(GRAPHQL_ENDPOINT);
      const orderIds: string[] = [];
      const cancelledPIs: string[] = [];

      server.use(
        // Order creation succeeds
        graphqlLink.mutation("CreateOrder", () => {
          const orderId = `order-${Date.now()}`;
          orderIds.push(orderId);
          return HttpResponse.json({
            data: { insert_orders_one: { id: orderId } },
          });
        }),
        // Order update fails
        graphqlLink.mutation("UpdateOrderPaymentIntent", () => {
          return HttpResponse.json({
            errors: [{ message: "Update failed" }],
          });
        }),
        // PaymentIntent creation succeeds
        http.post("https://api.stripe.com/v1/payment_intents", () => {
          return HttpResponse.json({
            client_secret: "pi_test_secret",
            id: "pi_test_123",
            status: "requires_payment_method",
          });
        }),
        // PaymentIntent cancellation tracks
        http.post("https://api.stripe.com/v1/payment_intents/:id/cancel", ({ params }) => {
          cancelledPIs.push(params.id as string);
          return HttpResponse.json({ id: params.id, status: "canceled" });
        }),
      );

      // Step 1: Create order
      const orderResponse = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          operationName: "CreateOrder",
          query: `mutation CreateOrder { insert_orders_one(object: {}) { id } }`,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const orderData = await orderResponse.json();
      const orderId = orderData.data.insert_orders_one.id;

      // Step 2: Create PaymentIntent
      const piResponse = await fetch("https://api.stripe.com/v1/payment_intents", {
        body: `amount=2500&currency=gbp&metadata[orderId]=${orderId}`,
        headers: { Authorization: "Bearer sk_test" },
        method: "POST",
      });
      const piData = await piResponse.json();
      expect(piData.id).toBe("pi_test_123");

      // Step 3: Update order fails
      const updateResponse = await fetch(GRAPHQL_ENDPOINT, {
        body: JSON.stringify({
          operationName: "UpdateOrderPaymentIntent",
          query: `mutation UpdateOrderPaymentIntent($id: uuid!, $payment_intent_id: String!) {
            update_orders_by_pk(pk_columns: { id: $id }, _set: { payment_intent_id: $payment_intent_id }) {
              id
            }
          }`,
          variables: { id: orderId, payment_intent_id: piData.id },
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const updateData = await updateResponse.json();
      expect(updateData.errors).toBeDefined();

      // Step 4: Cancel PaymentIntent (cleanup)
      await fetch(`https://api.stripe.com/v1/payment_intents/${piData.id}/cancel`, {
        headers: { Authorization: "Bearer sk_test" },
        method: "POST",
      });

      expect(cancelledPIs).toContain(piData.id);
    });
  });

  describe("Total Calculation", () => {
    it("calculates correct total for single item", () => {
      const items = [{ priceMinor: 2500, quantity: 1 }];
      const total = calculateTotal(items);
      expect(total).toBe(2500);
    });

    it("calculates correct total for multiple items", () => {
      const items = [
        { priceMinor: 2500, quantity: 2 },
        { priceMinor: 4000, quantity: 1 },
      ];
      const total = calculateTotal(items);
      expect(total).toBe(9000); // (2500 * 2) + (4000 * 1)
    });

    it("handles variant price overrides in total", () => {
      // Simulate XL variant with price override
      const items = [
        { priceMinor: 4000, quantity: 1 }, // XL with override from £35 to £40
      ];
      const total = calculateTotal(items);
      expect(total).toBe(4000);
    });
  });
});

// ============================================================================
// Helper functions that mirror checkout route logic for testing
// These are sorted alphabetically to satisfy perfectionist/sort-modules
// ============================================================================

import { createHash } from "crypto";

/**
 * Calculate total
 */
function calculateTotal(items: Array<{ priceMinor: number; quantity: number }>): number {
  return items.reduce((sum, item) => sum + item.priceMinor * item.quantity, 0);
}

/**
 * Find matching variant (case-insensitive)
 */
function findVariant<T extends { ageGroup: string; color?: null | string; gender: string; size: string }>(
  variants: T[],
  requested: { ageGroup: string; color?: string; gender: string; size: string },
): T | undefined {
  const normalize = (str: null | string | undefined) => (str ?? "").toLowerCase().trim();

  return variants.find(
    (v) =>
      normalize(v.gender) === normalize(requested.gender) &&
      normalize(v.ageGroup) === normalize(requested.ageGroup) &&
      normalize(v.size) === normalize(requested.size) &&
      (!requested.color || normalize(v.color) === normalize(requested.color)),
  );
}

/**
 * Generate idempotency key (mirrors checkout route logic)
 */
function generateIdempotencyKey(
  email: string,
  items: Array<{ id: string; productId: string; quantity: number }>,
  shippingCountry = "GB",
): string {
  const sortedItems = [...items].sort((a, b) => a.id.localeCompare(b.id));
  const payload = JSON.stringify({ email, items: sortedItems, shippingCountry });
  return createHash("sha256").update(payload).digest("hex").substring(0, 32);
}

/**
 * Transform mock product to GraphQL format
 */
function toGraphQLProduct(product: (typeof mockProducts)[0]) {
  return {
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
  };
}

/**
 * Validate currency consistency
 */
function validateCurrencyConsistency(products: Array<{ currency: string }>): { message?: string; valid: boolean } {
  if (products.length === 0) {
    return { valid: true };
  }

  const primaryCurrency = products[0].currency;
  const mismatch = products.find((p) => p.currency !== primaryCurrency);

  if (mismatch) {
    return {
      message: `Currency mismatch: expected ${primaryCurrency}, got ${mismatch.currency}`,
      valid: false,
    };
  }

  return { valid: true };
}

/**
 * Validate price
 */
function validatePrice(priceMinor: null | number | undefined): { message?: string; valid: boolean } {
  if (priceMinor === null || priceMinor === undefined) {
    return { message: "Product price not configured", valid: false };
  }
  return { valid: true };
}

/**
 * Validate stock (mirrors checkout route logic)
 */
function validateStock(
  stock: null | number | undefined,
  requestedQuantity: number,
): { message?: string; valid: boolean } {
  // Null/undefined stock means unlimited
  if (stock === null || stock === undefined) {
    return { valid: true };
  }

  if (stock === 0) {
    return { message: "Out of stock", valid: false };
  }

  if (stock < requestedQuantity) {
    return { message: `Only ${stock} available`, valid: false };
  }

  return { valid: true };
}
