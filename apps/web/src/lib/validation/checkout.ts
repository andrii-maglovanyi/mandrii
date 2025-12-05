import { z } from "zod";

/**
 * Cart item variant schema for checkout validation.
 */
const cartItemVariantSchema = z.object({
  ageGroup: z.string(),
  color: z.string().optional(),
  gender: z.string(),
  size: z.string(),
});

/**
 * Cart item schema for checkout request.
 * Note: priceMinor from client is ignored - server fetches authoritative price.
 */
const cartItemSchema = z.object({
  /** Unique cart item ID (includes variant info) */
  id: z.string(),
  /** Product ID (UUID) - used to fetch authoritative price */
  productId: z.string().uuid(),
  /** Quantity to purchase */
  quantity: z.number().int().positive(),
  /** Variant selection (for clothing items) */
  variant: cartItemVariantSchema.optional(),
});

/**
 * Checkout request schema.
 */
export const checkoutSchema = z.object({
  /** reCAPTCHA v3 token for bot protection */
  captchaToken: z.string().min(1, "Captcha token required"),
  /** Customer email for order confirmation */
  email: z.string().email(),
  /** Shipping country (ISO alpha-2 / zone) used for rate calculation */
  shippingCountry: z.enum(["GB", "EU", "ROW"]).default("GB"),
  /** Honeypot field - should be empty (bots fill this) */
  website: z.string().max(0, "Invalid submission").optional(),
  /** Cart items to purchase */
  items: z.array(cartItemSchema).min(1, "Cart cannot be empty"),
});

export type CartItemRequest = z.infer<typeof cartItemSchema>;
export type CheckoutRequest = z.infer<typeof checkoutSchema>;

/**
 * Payment confirmation request schema.
 */
export const confirmPaymentSchema = z.object({
  /** Order ID returned from checkout */
  orderId: z.string().uuid(),
  /** Stripe payment intent ID */
  paymentIntentId: z.string(),
});

export type ConfirmPaymentRequest = z.infer<typeof confirmPaymentSchema>;
