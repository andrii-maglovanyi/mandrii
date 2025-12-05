/**
 * Checkout Library
 *
 * Shared checkout utilities for calculating totals, shipping, and validation.
 */

export {
  calculateTotals,
  EU_SHIPPING_MINOR,
  FREE_SHIPPING_THRESHOLD_MINOR,
  getShippingCost,
  ROW_SHIPPING_MINOR,
  UK_SHIPPING_MINOR,
} from "./totals";

export type { CheckoutTotals, ShippingCountry, ValidatedItem } from "./totals";
