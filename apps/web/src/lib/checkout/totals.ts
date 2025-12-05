/**
 * Checkout Totals Calculator
 *
 * Pure functions for calculating checkout totals.
 * Extracted from the checkout API route for testability and reuse.
 */

// ============================================================================
// Types
// ============================================================================

export type ShippingCountry = "EU" | "GB" | "ROW";

export interface ValidatedItem {
  currency: string;
  name: string;
  priceMinor: number;
  productId: string;
  quantity: number;
  variantLabel?: string;
}

export interface CheckoutTotals {
  shippingMinor: number;
  subtotalMinor: number;
  totalMinor: number;
}

// ============================================================================
// Constants
// ============================================================================

export const UK_SHIPPING_MINOR = 399; // £3.99
export const EU_SHIPPING_MINOR = 899; // £8.99
export const ROW_SHIPPING_MINOR = 1499; // £14.99
export const FREE_SHIPPING_THRESHOLD_MINOR = 7000; // £70.00 (UK only)

// ============================================================================
// Functions
// ============================================================================

/**
 * Calculate checkout totals from validated items.
 *
 * @param validatedItems - Array of validated cart items with prices
 * @param shippingCountry - Shipping destination zone
 * @returns Calculated subtotal, shipping, and total in minor units
 */
export function calculateTotals(
  validatedItems: Pick<ValidatedItem, "priceMinor" | "quantity">[],
  shippingCountry: ShippingCountry,
): CheckoutTotals {
  const subtotalMinor = validatedItems.reduce((sum, item) => sum + item.priceMinor * item.quantity, 0);

  // Flat shipping by zone with free UK shipping above threshold
  const shippingMinor =
    shippingCountry === "GB" && subtotalMinor >= FREE_SHIPPING_THRESHOLD_MINOR
      ? 0
      : shippingCountry === "GB"
        ? UK_SHIPPING_MINOR
        : shippingCountry === "EU"
          ? EU_SHIPPING_MINOR
          : ROW_SHIPPING_MINOR;

  // Total = subtotal + shipping (tax included in prices)
  const totalMinor = subtotalMinor + shippingMinor;

  return { shippingMinor, subtotalMinor, totalMinor };
}

/**
 * Get shipping cost for a given country zone.
 *
 * @param shippingCountry - Shipping destination zone
 * @param subtotalMinor - Cart subtotal for free shipping calculation
 * @returns Shipping cost in minor units
 */
export function getShippingCost(shippingCountry: ShippingCountry, subtotalMinor: number = 0): number {
  if (shippingCountry === "GB" && subtotalMinor >= FREE_SHIPPING_THRESHOLD_MINOR) {
    return 0;
  }

  switch (shippingCountry) {
    case "GB":
      return UK_SHIPPING_MINOR;
    case "EU":
      return EU_SHIPPING_MINOR;
    case "ROW":
      return ROW_SHIPPING_MINOR;
  }
}
