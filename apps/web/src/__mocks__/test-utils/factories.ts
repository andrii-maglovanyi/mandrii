/**
 * Test Data Factories
 *
 * Factory functions for creating test data objects.
 * Use these to create consistent test data across all test files.
 */

import { CartItem } from "~/contexts/CartContext";
import { Clothing_Age_Group_Enum, Clothing_Gender_Enum, Clothing_Size_Enum } from "~/types/graphql.generated";

/**
 * Creates a mock cart item with sensible defaults.
 * All properties can be overridden via the overrides parameter.
 */
export function createCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    currency: "GBP",
    id: "prod-1",
    image: "test-image.webp",
    name: "Test Product",
    priceMinor: 2500,
    quantity: 1,
    slug: "test-product",
    stock: 10,
    ...overrides,
  };
}

/**
 * Creates a mock cart item with variant information.
 */
export function createCartItemWithVariant(overrides: Partial<CartItem> = {}): CartItem {
  return createCartItem({
    id: "prod-1::unisex::adult::m",
    variant: {
      ageGroup: Clothing_Age_Group_Enum.Adult,
      gender: Clothing_Gender_Enum.Unisex,
      size: Clothing_Size_Enum.M,
    },
    ...overrides,
  });
}

/**
 * Creates a mock order for OrderConfirmation tests.
 */
export function createMockOrder(overrides: Record<string, unknown> = {}) {
  return {
    created_at: "2024-01-15T10:00:00Z",
    currency: "GBP",
    email: "test@example.com",
    id: "order-123-456-789",
    order_items: [
      {
        currency: "GBP",
        id: "item-1",
        metadata: null,
        name_snapshot: "Test Product",
        product: {
          id: "prod-1",
          images: ["test.webp"],
          name: "Test Product",
          slug: "test-product",
        },
        quantity: 2,
        unit_price_minor: 2500,
      },
    ],
    payment_intent_id: "pi_test_123",
    status: "paid",
    subtotal_minor: 5000,
    total_minor: 5350,
    ...overrides,
  };
}

/**
 * Creates mock order items for tests.
 */
export function createMockOrderItem(overrides: Record<string, unknown> = {}) {
  return {
    currency: "GBP",
    id: "item-1",
    metadata: null,
    name_snapshot: "Test Product",
    product: {
      id: "prod-1",
      images: ["test.webp"],
      name: "Test Product",
      slug: "test-product",
    },
    quantity: 1,
    unit_price_minor: 2500,
    ...overrides,
  };
}
