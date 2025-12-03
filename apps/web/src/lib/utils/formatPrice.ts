import { Locale } from "~/types";

/**
 * Format a price in minor units (cents/pence) to a human-readable currency string.
 *
 * @param valueMinor - Price in minor units (e.g., 1999 for $19.99).
 * @param currency - ISO 4217 currency code (e.g., "USD", "GBP", "EUR").
 * @param locale - Locale for formatting (defaults to English).
 * @returns Formatted price string (e.g., "$19.99", "£19.99").
 */
export const formatPrice = (valueMinor: number, currency = "USD", locale: Locale = Locale.EN): string =>
  new Intl.NumberFormat(locale, { currency, style: "currency" }).format(valueMinor / 100);
