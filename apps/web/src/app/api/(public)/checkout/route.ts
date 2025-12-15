import { captureException } from "@sentry/nextjs";
import Stripe from "stripe";

import { CartItemVariant } from "~/contexts/CartContext";
import { I18nFunction } from "~/features/ILRCalculator/ILRCalculator";
import {
  buildVariantLabel,
  calculateTotals,
  CheckoutTotals,
  findVariant,
  generateIdempotencyKey,
} from "~/features/Shop/utils";
import {
  CREATE_ORDER,
  DELETE_ORDER,
  GET_ORDER_BY_IDEMPOTENCY_KEY,
  UPDATE_ORDER_PAYMENT_INTENT,
} from "~/graphql/orders";
import { GET_PRODUCTS_BY_IDS } from "~/graphql/products";
import {
  BadRequestError,
  getApiContext,
  InternalServerError,
  rateLimiters,
  validateRequest,
  verifyCaptcha,
  withErrorHandling,
} from "~/lib/api";
import { privateConfig } from "~/lib/config/private";
import { getAdminClient } from "~/lib/graphql/adminClient";
import { CartItemRequest, checkoutSchema } from "~/lib/validation/checkout";
import { Product, ProductVariant, ShippingCountry, ValidatedItem } from "~/types";

const stripe = new Stripe(privateConfig.stripe.secretKey);

interface CartValidationResult {
  errors: ValidationError[];
  primaryCurrency: string | undefined;
  validatedItems: ValidatedItem[];
}

interface CheckoutResponse {
  clientSecret: null | string;
  currency: string;
  items: Array<{
    currency: string;
    name: string;
    priceMinor: number;
    productId: string;
    quantity: number;
    variantId?: string;
  }>;
  orderId: string;
  paymentIntentId: string;
  shippingMinor: number;
  subtotalMinor: number;
  totalMinor: number;
}

interface ExistingOrder {
  id: string;
  payment_intent_id: string;
  status: string;
}

interface ValidationError {
  itemId: string;
  message: string;
  type: "currency_mismatch" | "not_found" | "out_of_stock" | "price_changed";
}

async function fetchProducts(productIds: string[]): Promise<Map<string, Product>> {
  const client = getAdminClient();
  const { data } = await client.query<{ products: Product[] }>({
    fetchPolicy: "network-only",
    query: GET_PRODUCTS_BY_IDS,
    variables: { ids: productIds },
  });

  return new Map(data.products.map((p) => [p.id, p]));
}

/**
 * Validate all cart items against current product data.
 * Checks: product exists, is active, currency matches, variant exists, stock available.
 */
function validateCartItems(
  items: CartItemRequest[],
  productsMap: Map<string, Product>,
  i18n: I18nFunction,
): CartValidationResult {
  const errors: ValidationError[] = [];
  const validatedItems: ValidatedItem[] = [];
  let primaryCurrency: string | undefined;

  for (const item of items) {
    const product = productsMap.get(item.productId);

    if (!product || product.status !== "ACTIVE") {
      errors.push({
        itemId: item.id,
        message: i18n("Product not found or unavailable"),
        type: "not_found",
      });
      continue;
    }

    if (!primaryCurrency) {
      primaryCurrency = product.currency;
    }

    if (product.currency !== primaryCurrency) {
      errors.push({
        itemId: item.id,
        message: i18n("Currency mismatch: expected {expectedCurrency}, got {actualCurrency}", {
          actualCurrency: product.currency,
          expectedCurrency: primaryCurrency,
        }),
        type: "currency_mismatch",
      });
      continue;
    }

    // Determine price and stock based on variant
    let priceMinor: null | number = product.price_minor;
    let stock: null | number = product.stock ?? null;
    let variant: ProductVariant | undefined;

    if (item.variant) {
      variant = findVariant(product, item.variant as CartItemVariant);

      if (!variant) {
        errors.push({
          itemId: item.id,
          message: i18n("Selected variant not available"),
          type: "not_found",
        });
        continue;
      }

      // Use variant price override if exists
      if (variant.price_override_minor !== undefined && variant.price_override_minor !== null) {
        priceMinor = variant.price_override_minor;
      }

      // Variant stock: null/undefined means unlimited
      stock = variant.stock ?? null;
    }

    // Validate price is set
    if (priceMinor === null || priceMinor === undefined) {
      errors.push({
        itemId: item.id,
        message: i18n("Product price not configured"),
        type: "not_found",
      });
      continue;
    }

    // Check stock availability (null means unlimited, skip check)
    if (stock !== null && stock < item.quantity) {
      errors.push({
        itemId: item.id,
        message: stock === 0 ? i18n("Out of stock") : i18n("Only {stock} available", { stock }),
        type: "out_of_stock",
      });
      continue;
    }

    const variantLabel = buildVariantLabel(item.variant as CartItemVariant | undefined);

    validatedItems.push({
      currency: product.currency,
      name: `${product.name}${variantLabel}`,
      priceMinor,
      product,
      productId: product.id,
      quantity: item.quantity,
      variant,
      variantLabel,
    });
  }

  return { errors, primaryCurrency, validatedItems };
}

const buildCheckoutResponse = (
  orderId: string,
  paymentIntent: { client_secret: null | string; id: string },
  currency: string,
  validatedItems: ValidatedItem[],
  totals: CheckoutTotals,
) => {
  return {
    clientSecret: paymentIntent.client_secret,
    currency,
    items: validatedItems.map((item) => ({
      currency: item.currency,
      name: item.name,
      priceMinor: item.priceMinor,
      productId: item.productId,
      quantity: item.quantity,
      variantId: item.variant?.id,
    })),
    orderId,
    paymentIntentId: paymentIntent.id,
    shippingMinor: totals.shippingMinor,
    subtotalMinor: totals.subtotalMinor,
    totalMinor: totals.totalMinor,
  };
};

/**
 * POST /api/checkout
 *
 * Validates cart items, checks stock/prices server-side, and creates a Stripe payment intent.
 * Returns client secret for Stripe Elements and validated cart summary.
 */
export async function POST(req: Request) {
  return withErrorHandling(async () => {
    await rateLimiters.checkout.check();

    const { i18n, locale, session } = await getApiContext(req, { withAuth: true, withI18n: true });

    const { captchaToken, email, items, shippingCountry, website } = await validateRequest(req, checkoutSchema);
    const destination: ShippingCountry = shippingCountry ?? "GB";

    // Honeypot check: bots fill hidden fields, humans don't
    if (website) {
      throw new BadRequestError("Invalid submission");
    }

    await verifyCaptcha(captchaToken, "checkout");

    const userId = session?.user?.id ?? null;

    const productIds = [...new Set(items.map((item) => item.productId))];
    const productsMap = await fetchProducts(productIds);

    const { errors, primaryCurrency, validatedItems } = validateCartItems(items, productsMap, i18n);

    if (errors.length > 0) {
      throw new BadRequestError(i18n("Cart validation failed"), "CART_VALIDATION_FAILED", { errors });
    }

    if (!primaryCurrency) {
      throw new BadRequestError(i18n("No valid items in cart"), "EMPTY_CART");
    }

    const totals = calculateTotals(validatedItems, destination);

    // ========================================================================
    // 4. Idempotency Check
    // ========================================================================
    const idempotencyKey = generateIdempotencyKey(email, items, destination);

    interface ExistingOrderResponse {
      orders: ExistingOrder[];
    }

    const client = getAdminClient();
    const { data: existingOrderData } = await client.query<ExistingOrderResponse>({
      fetchPolicy: "network-only",
      query: GET_ORDER_BY_IDEMPOTENCY_KEY,
      variables: { idempotencyKey },
    });

    const existingOrder = existingOrderData.orders[0];

    // ========================================================================
    // 5. Handle Existing Order or Create New
    // ========================================================================
    if (existingOrder) {
      const response = await handleExistingOrder(
        existingOrder,
        primaryCurrency,
        validatedItems,
        totals,
        destination,
        email,
        locale,
      );
      if (response) {
        return Response.json(response);
      }
    }

    // ========================================================================
    // 6. Create New Order
    // ========================================================================
    const response = await createNewOrder(
      validatedItems,
      totals,
      primaryCurrency,
      email,
      idempotencyKey,
      userId,
      locale,
      destination,
    );

    return Response.json(response);
  });
}

/**
 * Clean up order after PaymentIntent creation failure.
 */
async function cleanupFailedOrder(orderId: string, error: unknown): Promise<void> {
  console.error(`[Checkout] PaymentIntent creation failed, deleting order ${orderId}:`, error);
  captureException(error, {
    extra: { orderId },
    tags: { action: "checkout_pi_creation_failed" },
  });

  try {
    const client = getAdminClient();
    await client.mutate({
      mutation: DELETE_ORDER,
      variables: { id: orderId },
    });
    console.log(`[Checkout] Cleaned up order ${orderId} after PI creation failure`);
  } catch (cleanupError) {
    console.error(`[Checkout] Failed to clean up order ${orderId}:`, cleanupError);
    captureException(cleanupError, {
      extra: { orderId },
      tags: { action: "checkout_order_cleanup_failed" },
    });
  }
}

/**
 * Clean up after order update failure - cancel PI and delete order.
 */
async function cleanupFailedPaymentIntent(orderId: string, paymentIntentId: string, error: unknown): Promise<void> {
  console.error(`[Checkout] Failed to update order with PI, canceling PI:`, error);
  captureException(error, {
    extra: { orderId, paymentIntentId },
    tags: { action: "checkout_order_update_failed" },
  });

  try {
    await stripe.paymentIntents.cancel(paymentIntentId);
    const client = getAdminClient();
    await client.mutate({
      mutation: DELETE_ORDER,
      variables: { id: orderId },
    });
  } catch (cleanupError) {
    console.error(`[Checkout] Cleanup failed:`, cleanupError);
    captureException(cleanupError, {
      extra: { orderId, paymentIntentId },
      tags: { action: "checkout_cleanup_failed" },
    });
  }
}

/**
 * Create a new order and PaymentIntent.
 */
async function createNewOrder(
  validatedItems: ValidatedItem[],
  totals: CheckoutTotals,
  currency: string,
  email: string,
  idempotencyKey: string,
  userId: null | string,
  locale: string,
  shippingCountry: ShippingCountry,
): Promise<CheckoutResponse> {
  const client = getAdminClient();

  // Prepare order items
  const orderItems = validatedItems.map((item) => ({
    currency: item.currency,
    metadata: item.variant
      ? {
          variant: {
            ageGroup: item.variant.age_group,
            color: item.variant.color,
            gender: item.variant.gender,
            size: item.variant.size,
          },
        }
      : null,
    name_snapshot: item.name,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price_minor: item.priceMinor,
    variant_id: item.variant?.id ?? null,
  }));

  interface OrderResponse {
    insert_orders_one: {
      id: string;
    };
  }

  // Step 1: Create order first (without payment_intent_id)
  const { data: orderData } = await client.mutate<OrderResponse>({
    mutation: CREATE_ORDER,
    variables: {
      currency,
      email,
      idempotency_key: idempotencyKey,
      items: orderItems,
      payment_intent_id: null,
      status: "pending",
      subtotal_minor: totals.subtotalMinor,
      total_minor: totals.totalMinor,
      user_id: userId,
    },
  });

  if (!orderData?.insert_orders_one?.id) {
    throw new InternalServerError("Failed to create order");
  }

  const orderId = orderData.insert_orders_one.id;

  // Step 2: Create Stripe PaymentIntent with order ID
  let paymentIntent: Stripe.PaymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create(
      {
        amount: totals.totalMinor,
        automatic_payment_methods: { enabled: true },
        currency: currency.toLowerCase(),
        metadata: {
          email,
          itemCount: validatedItems.length.toString(),
          locale,
          orderId,
          shippingCountry,
          shippingMinor: totals.shippingMinor.toString(),
        },
      },
      { idempotencyKey: `order_${orderId}` },
    );
  } catch (stripeError) {
    // PaymentIntent creation failed - clean up the order
    await cleanupFailedOrder(orderId, stripeError);
    throw new InternalServerError("Failed to create payment session");
  }

  // Step 3: Update order with payment_intent_id
  try {
    await client.mutate({
      mutation: UPDATE_ORDER_PAYMENT_INTENT,
      variables: { id: orderId, payment_intent_id: paymentIntent.id },
    });
  } catch (updateError) {
    // Order update failed - cancel PI and clean up
    await cleanupFailedPaymentIntent(orderId, paymentIntent.id, updateError);
    throw new InternalServerError("Failed to finalize payment session");
  }

  return buildCheckoutResponse(orderId, paymentIntent, currency, validatedItems, totals);
}

// ============================================================================
// POST Handler
// ============================================================================

/**
 * Handle existing order with idempotency key.
 * Returns response if order can be reused, null if new order needed.
 */
async function handleExistingOrder(
  existingOrder: ExistingOrder,
  currency: string,
  validatedItems: ValidatedItem[],
  totals: CheckoutTotals,
  shippingCountry: ShippingCountry,
  email: string,
  locale: string,
): Promise<CheckoutResponse | null> {
  // If order has a PaymentIntent, try to reuse it
  if (existingOrder.payment_intent_id) {
    try {
      const existingPaymentIntent = await stripe.paymentIntents.retrieve(existingOrder.payment_intent_id);

      // Handle processing state - payment is in progress, don't create duplicates
      if (existingPaymentIntent.status === "processing") {
        console.log(`[Checkout] PaymentIntent ${existingPaymentIntent.id} is processing, returning existing order`);
        return buildCheckoutResponse(existingOrder.id, existingPaymentIntent, currency, validatedItems, totals);
      }

      // Reuse PaymentIntent if it's still awaiting customer action
      if (
        existingPaymentIntent.status === "requires_payment_method" ||
        existingPaymentIntent.status === "requires_confirmation" ||
        existingPaymentIntent.status === "requires_action"
      ) {
        console.log(`[Checkout] Returning existing order ${existingOrder.id} for idempotency key`);
        return buildCheckoutResponse(existingOrder.id, existingPaymentIntent, currency, validatedItems, totals);
      }

      // PaymentIntent already succeeded
      if (existingPaymentIntent.status === "succeeded") {
        console.warn(
          `[Checkout] Order ${existingOrder.id} already has succeeded PaymentIntent ${existingPaymentIntent.id}`,
        );
        return buildCheckoutResponse(existingOrder.id, existingPaymentIntent, currency, validatedItems, totals);
      }
    } catch {
      // PaymentIntent doesn't exist or is invalid, will create new one
      console.log(`[Checkout] Existing PaymentIntent invalid for order ${existingOrder.id}`);
    }
  }

  // Order exists but needs new PaymentIntent
  console.log(`[Checkout] Creating new PaymentIntent for existing order ${existingOrder.id}`);

  const newPaymentIntent = await stripe.paymentIntents.create(
    {
      amount: totals.totalMinor,
      automatic_payment_methods: { enabled: true },
      currency: currency.toLowerCase(),
      metadata: {
        email,
        itemCount: validatedItems.length.toString(),
        locale,
        orderId: existingOrder.id,
        shippingCountry,
        shippingMinor: totals.shippingMinor.toString(),
      },
    },
    { idempotencyKey: `order_${existingOrder.id}_retry_${Date.now()}` },
  );

  // Update order with new payment_intent_id
  const client = getAdminClient();
  await client.mutate({
    mutation: UPDATE_ORDER_PAYMENT_INTENT,
    variables: { id: existingOrder.id, payment_intent_id: newPaymentIntent.id },
  });

  return buildCheckoutResponse(existingOrder.id, newPaymentIntent, currency, validatedItems, totals);
}
