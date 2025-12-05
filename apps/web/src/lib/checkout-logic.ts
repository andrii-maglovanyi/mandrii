/**
 * Checkout Business Logic
 *
 * This module contains framework-agnostic business logic for the checkout flow.
 * It's extracted from route.ts to enable direct unit testing and reduce duplication.
 *
 * @module checkout-logic
 */

import { createHash } from "crypto";

// ============================================================================
// Types
// ============================================================================

export interface CartItemVariant {
  ageGroup: string;
  color?: string;
  gender: string;
  size: string;
}

export interface CartItemRequest {
  id: string;
  productId: string;
  quantity: number;
  variant?: CartItemVariant;
}

export interface Product {
  currency: string;
  id: string;
  name: string;
  price_minor: number | null;
  product_variants: ProductVariant[];
  slug: string;
  status: string;
  stock?: number | null;
}

export interface ProductVariant {
  age_group: string;
  color?: string | null;
  gender: string;
  id: string;
  price_override_minor?: number | null;
  size: string;
  stock?: number | null;
}

export interface StockCheckResult {
  available: boolean;
  reason?: "insufficient_stock" | "out_of_stock";
}

export interface CurrencyValidationResult {
  mismatchedProducts?: string[];
  primaryCurrency?: string;
  valid: boolean;
}

export interface VariantLookupResult {
  error?: "invalid_combination" | "not_found";
  found: boolean;
  variant?: ProductVariant;
}

// ============================================================================
// Idempotency
// ============================================================================

/**
 * Generate a deterministic idempotency key from cart contents and email.
 * This ensures the same cart + email always produces the same key,
 * preventing duplicate orders on retries.
 *
 * @param email - Customer email address
 * @param items - Cart items array
 * @returns 32-character hex hash
 */
export function generateIdempotencyKey(email: string, items: CartItemRequest[], shippingCountry?: string): string {
  const sortedItems = [...items].sort((a, b) => a.id.localeCompare(b.id));
  const payload = JSON.stringify({ email, items: sortedItems, shippingCountry });
  return createHash("sha256").update(payload).digest("hex").substring(0, 32);
}

// ============================================================================
// Stock Validation
// ============================================================================

/**
 * Check if requested quantity is available.
 * null stock means unlimited inventory (always available).
 *
 * @param stock - Available stock (null = unlimited)
 * @param requestedQuantity - Quantity to check
 * @returns Stock check result with availability and reason
 */
export function checkStock(stock: number | null, requestedQuantity: number): StockCheckResult {
  // null means unlimited - always available
  if (stock === null) {
    return { available: true };
  }

  // Check if enough stock
  if (stock < requestedQuantity) {
    if (stock === 0) {
      return { available: false, reason: "out_of_stock" };
    }
    return { available: false, reason: "insufficient_stock" };
  }

  return { available: true };
}

// ============================================================================
// Currency Validation
// ============================================================================

/**
 * Validate that all products in cart have the same currency.
 * Multi-currency carts are not supported in a single checkout.
 *
 * @param products - Array of products with currency field
 * @returns Validation result with primary currency and any mismatches
 */
export function validateCartCurrency(products: Array<{ currency: string; id: string }>): CurrencyValidationResult {
  if (products.length === 0) {
    return { valid: true };
  }

  const primaryCurrency = products[0].currency;
  const mismatched = products.filter((p) => p.currency !== primaryCurrency);

  if (mismatched.length > 0) {
    return {
      mismatchedProducts: mismatched.map((p) => p.id),
      primaryCurrency,
      valid: false,
    };
  }

  return { primaryCurrency, valid: true };
}

// ============================================================================
// Price Resolution
// ============================================================================

/**
 * Resolve the effective price for a product/variant combination.
 * Variant price_override_minor takes precedence over base product price.
 *
 * @param productPriceMinor - Base product price in minor units
 * @param variant - Optional variant with potential price override
 * @returns Effective price in minor units
 */
export function resolvePrice(productPriceMinor: number, variant?: { price_override_minor?: number | null }): number {
  if (variant && variant.price_override_minor !== null && variant.price_override_minor !== undefined) {
    return variant.price_override_minor;
  }
  return productPriceMinor;
}

// ============================================================================
// String Normalization
// ============================================================================

/**
 * Normalize string for case-insensitive comparison.
 *
 * @param str - String to normalize
 * @returns Lowercase trimmed string
 */
export function normalize(str: string | null | undefined): string {
  return (str ?? "").toLowerCase().trim();
}

// ============================================================================
// Variant Lookup
// ============================================================================

/**
 * Find matching variant for a cart item.
 * Comparison is case-insensitive to handle client/server casing differences.
 *
 * IMPORTANT: Variant matching relies on string equality after lowercasing.
 * If enum values in the database change casing or format (e.g., "Men" → "MALE"),
 * matching will fail silently with a 404-style error to the user.
 *
 * To maintain alignment:
 * 1. Use constants/enums shared between client and server where possible
 * 2. Consider storing canonical enum values and using a mapping layer
 * 3. When changing enum values, update both DB seeds and client constants
 *
 * @see ~/lib/constants.ts for client-side enum definitions
 *
 * @param product - Product with variants array
 * @param variant - Requested variant criteria
 * @returns Matching variant or undefined if not found
 */
export function findVariant(product: Product, variant: CartItemVariant | undefined): ProductVariant | undefined {
  if (!variant) return undefined;

  const matched = product.product_variants.find(
    (v) =>
      normalize(v.gender) === normalize(variant.gender) &&
      normalize(v.age_group) === normalize(variant.ageGroup) &&
      normalize(v.size) === normalize(variant.size) &&
      (!variant.color || normalize(v.color) === normalize(variant.color)),
  );

  // Log when variant matching fails for debugging enum misalignment issues
  if (!matched && product.product_variants.length > 0) {
    console.warn(
      `[Checkout] Variant not found for product ${product.id}. ` +
        `Requested: ${JSON.stringify(variant)}. ` +
        `Available: ${product.product_variants
          .map((v) => `${v.gender}/${v.age_group}/${v.size}${v.color ? `/${v.color}` : ""}`)
          .join(", ")}`,
    );
  }

  return matched;
}

/**
 * Find variant with structured result for testing.
 * This version returns a result object instead of just the variant.
 *
 * @param variants - Array of variants to search
 * @param request - Requested variant criteria
 * @returns Lookup result with found status and variant/error
 */
export function findVariantWithResult(variants: ProductVariant[], request: CartItemVariant): VariantLookupResult {
  const variant = variants.find(
    (v) =>
      normalize(v.gender) === normalize(request.gender) &&
      normalize(v.age_group) === normalize(request.ageGroup) &&
      normalize(v.size) === normalize(request.size) &&
      (request.color ? normalize(v.color) === normalize(request.color) : !v.color),
  );

  if (!variant) {
    return { error: "not_found", found: false };
  }

  return { found: true, variant };
}

// ============================================================================
// Variant Label Building
// ============================================================================

/**
 * Build variant label for order item name.
 *
 * @param variant - Cart item variant
 * @returns Formatted variant label string (e.g., " (men, adult, XL, black)")
 */
export function buildVariantLabel(variant: CartItemVariant | undefined): string {
  if (!variant) return "";
  const parts = [variant.gender, variant.ageGroup, variant.size.toUpperCase()];
  if (variant.color) parts.push(variant.color);
  return ` (${parts.join(", ")})`;
}
