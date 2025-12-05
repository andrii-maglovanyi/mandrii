"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { AlertCircle, Loader2, ShoppingBag } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

import { Breadcrumbs, Button, EmptyState, FallbackImage, Input, Select } from "~/components/ui";
import { Link } from "~/i18n/navigation";
import { useAuth } from "~/contexts/AuthContext";
import { CartItem, useCart } from "~/contexts/CartContext";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";
import { publicConfig } from "~/lib/config/public";
import { formatPrice, isEmail } from "~/lib/utils";
import { Locale } from "~/types";

import { CheckoutForm } from "./CheckoutForm";
import {
  EU_SHIPPING_COST_MINOR,
  FREE_SHIPPING_THRESHOLD_MINOR,
  ROW_SHIPPING_COST_MINOR,
  ShippingInfo,
  UK_SHIPPING_COST_MINOR,
} from "./components";

interface CheckoutErrorResponse {
  code: string;
  data?: { errors: ValidationError[] };
  error: string;
}

interface CheckoutResponse {
  clientSecret: string;
  currency: string;
  items: ValidatedItem[];
  orderId: string;
  paymentIntentId: string;
  shippingMinor: number;
  subtotalMinor: number;
  totalMinor: number;
}

interface ValidatedItem {
  currency: string;
  name: string;
  priceMinor: number;
  productId: string;
  quantity: number;
  variantId?: string;
}

interface ValidationError {
  itemId: string;
  message: string;
  type: "currency_mismatch" | "not_found" | "out_of_stock" | "price_changed";
}

type ShippingCountry = "GB" | "EU" | "ROW";

// Store stripe promise at module level to prevent recreation
let stripePromise: null | Promise<null | Stripe> = null;

const calculateShippingMinor = (subtotalMinor: number, shippingCountry: ShippingCountry) => {
  if (shippingCountry === "GB" && subtotalMinor >= FREE_SHIPPING_THRESHOLD_MINOR) return 0;
  if (shippingCountry === "GB") return UK_SHIPPING_COST_MINOR;
  if (shippingCountry === "EU") return EU_SHIPPING_COST_MINOR;
  return ROW_SHIPPING_COST_MINOR;
};

/**
 * Main checkout view component.
 * Single-page checkout flow:
 * 1. Shows cart summary on left, email + payment form on right
 * 2. Auto-validates cart when email is entered
 * 3. Stripe Elements loads inline once validated
 */
export function CheckoutView() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={publicConfig.recaptcha.siteKey}>
      <CheckoutViewInner />
    </GoogleReCaptchaProvider>
  );
}

function CheckoutViewInner() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const { items: cartItems } = useCart();
  const { profile } = useAuth();

  const [email, setEmail] = useState(profile?.email ?? "");
  const [shippingCountry, setShippingCountry] = useState<ShippingCountry>("GB");
  const [website, setWebsite] = useState(""); // Honeypot field
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);

  // Track if we've already initiated checkout to prevent duplicate calls
  const hasInitiatedRef = useRef(false);

  // Calculate totals from cart
  const currency = cartItems[0]?.currency ?? "GBP";
  const subtotalMinor = cartItems.reduce((sum, item) => sum + item.priceMinor * item.quantity, 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shippingMinor = checkoutData?.shippingMinor ?? calculateShippingMinor(subtotalMinor, shippingCountry);
  const estimatedTotalMinor = subtotalMinor + shippingMinor;

  // Prefill email when user profile loads
  useEffect(() => {
    if (profile?.email && !email) {
      setEmail(profile.email);
    }
  }, [profile?.email, email]);

  // Reset checkout if cart changes
  useEffect(() => {
    setCheckoutData(null);
    setError(null);
    setValidationErrors([]);
    hasInitiatedRef.current = false;
  }, [cartItems, shippingCountry]);

  const handleInitiateCheckout = async () => {
    if (!isEmail(email.trim())) {
      setError(i18n("Please enter a valid email address."));
      return;
    }

    if (hasInitiatedRef.current) return;
    hasInitiatedRef.current = true;

    await initiateCheckout();
  };

  const initiateCheckout = async () => {
    if (!executeRecaptcha) {
      setError(i18n("Security verification not ready. Please try again."));
      return;
    }

    setIsLoading(true);
    setError(null);
    setValidationErrors([]);

    try {
      const captchaToken = await executeRecaptcha("checkout");

      const response = await fetch("/api/checkout", {
        body: JSON.stringify({
          captchaToken,
          email,
          items: cartItems.map((item) => ({
            id: item.id,
            productId: extractProductId(item.id),
            quantity: item.quantity,
            variant: item.variant,
          })),
          shippingCountry,
          website,
        }),
        headers: {
          "Accept-Language": locale,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const errorData = (await response.json()) as CheckoutErrorResponse;

        if (errorData.code === "CART_VALIDATION_FAILED" && errorData.data?.errors) {
          setValidationErrors(errorData.data.errors);
          setError(i18n("Some items in your cart have issues. Please review and try again."));
        } else if (errorData.code === "VALIDATION_ERROR") {
          // Zod validation failed - likely invalid data format
          console.error("Checkout validation error:", errorData);
          setError(i18n("Invalid checkout data. Please refresh and try again."));
        } else if (errorData.code === "RATE_LIMIT") {
          setError(i18n("Too many requests. Please wait a moment and try again."));
        } else {
          setError(errorData.error || i18n("Failed to initiate checkout. Please try again."));
        }
        hasInitiatedRef.current = false;
        return;
      }

      const data = (await response.json()) as CheckoutResponse;
      setCheckoutData(data);

      sendToMixpanel("Checkout Initiated", {
        orderId: data.orderId,
        itemCount: cartItems.length,
        subtotalMinor: data.subtotalMinor,
        shippingMinor: data.shippingMinor,
        totalMinor: data.totalMinor,
        currency: data.currency,
      });
    } catch (err) {
      // Handle network errors with retry guidance
      const isNetworkError = err instanceof TypeError && err.message.includes("fetch");
      if (isNetworkError) {
        setError(i18n("Connection error. Please check your internet and try again."));
      } else {
        setError(i18n("An unexpected error occurred. Please try again."));
      }
      console.error("[Checkout] Error:", err);
      hasInitiatedRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  // Empty cart
  if (!cartItems.length && !checkoutData) {
    return (
      <div className="flex flex-col gap-8">
        <Breadcrumbs
          items={[
            { title: i18n("Home"), url: "/" },
            { title: i18n("Shop"), url: "/shop" },
          ]}
        />
        <EmptyState
          body={i18n("Add something from the shop to start checkout")}
          heading={i18n("Your bag is empty")}
          icon={<ShoppingBag size={50} />}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs
        items={[
          { title: i18n("Home"), url: "/" },
          { title: i18n("Shop"), url: "/shop" },
          { title: i18n("Bag"), url: "/shop/cart" },
          { title: i18n("Checkout") },
        ]}
      />

      <h1 className="text-2xl font-semibold md:text-3xl">{i18n("Checkout")}</h1>

      {/* Honeypot field - hidden from humans, bots fill it out */}
      <input
        aria-hidden="true"
        autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        name="website"
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        type="text"
        value={website}
      />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Left column: Order summary */}
        <div className="order-2 lg:order-1">
          <div className="space-y-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{i18n("Order summary:")}</h3>
              <Link className="text-primary hover:text-primary/80 mt-2 inline-block" href="/shop/cart">
                <Button variant="filled" color="neutral" size="sm">
                  ← {i18n("Edit bag")}
                </Button>
              </Link>
            </div>

            {/* Items list */}
            <div className="space-y-4">
              {cartItems.map((item) => {
                const itemError = validationErrors.find((e) => e.itemId === item.id);

                return (
                  <div className={`flex items-start gap-4 ${itemError ? "text-danger" : ""}`} key={item.id}>
                    <div className="bg-surface-tint relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                      <FallbackImage
                        alt={item.name}
                        className="object-cover"
                        fill
                        sizes="56px"
                        src={item.image || ""}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="leading-tight">{item.name}</p>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="font-medium">
                            {formatPrice(item.priceMinor * item.quantity, item.currency, locale)}
                          </span>
                        </div>
                      </div>
                      <p className="text-neutral/60 mt-1 text-sm">
                        {i18n("Qty")}: {item.quantity}
                      </p>
                      {itemError && <p className="text-danger mt-1 text-xs">{itemError.message}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Shipping selection */}
            <div className="border-neutral/10 space-y-2 border-t pt-5">
              <Select
                label={i18n("Shipping destination")}
                onChange={(e) => {
                  setShippingCountry(e.target.value as ShippingCountry);
                  hasInitiatedRef.current = false;
                }}
                options={[
                  { label: i18n("United Kingdom"), value: "GB" },
                  { label: i18n("European Union"), value: "EU" },
                  { label: i18n("Rest of World"), value: "ROW" },
                ]}
                value={shippingCountry}
              />
            </div>

            {/* Totals */}
            <div className="border-neutral/10 space-y-3 border-t pt-5">
              <div className="text-neutral/70 flex justify-between">
                <span>
                  {i18n("Subtotal")} ({totalQuantity} {totalQuantity === 1 ? i18n("item") : i18n("items")})
                </span>
                <span>{formatPrice(subtotalMinor, currency, locale)}</span>
              </div>
              <div className="text-neutral/70 flex justify-between">
                <span>{i18n("Shipping")}</span>
                <span>{shippingMinor === 0 ? i18n("Free") : formatPrice(shippingMinor, currency, locale)}</span>
              </div>
            </div>

            <div className="border-neutral/10 flex justify-between border-t pt-5 text-lg font-semibold">
              <span>{i18n("Total")}</span>
              <span>{formatPrice(checkoutData?.totalMinor ?? estimatedTotalMinor, currency, locale)}</span>
            </div>

            {shippingCountry === "GB" && subtotalMinor < FREE_SHIPPING_THRESHOLD_MINOR && (
              <p className="text-primary text-sm">
                {i18n("Add {amount} more for free UK shipping", {
                  amount: formatPrice(FREE_SHIPPING_THRESHOLD_MINOR - subtotalMinor, currency, locale),
                })}
              </p>
            )}
          </div>
        </div>

        {/* Right column: Checkout form */}
        <div className="order-1 space-y-8 lg:order-2">
          {/* Email input */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{i18n("Contact information")}</h3>
            <div>
              <Input
                disabled={isLoading || !!checkoutData}
                onChange={(e) => {
                  setEmail(e.target.value);
                  hasInitiatedRef.current = false;
                }}
                placeholder={i18n("Email address")}
                type="email"
                value={email}
              />
              <p className="text-neutral/60 mt-2 text-xs">
                {i18n("I'll send your order confirmation to this address.")}
              </p>
            </div>
          </div>

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="bg-danger/10 text-danger rounded-lg p-4">
              <div className="mb-2 flex items-center gap-2 font-medium">
                <AlertCircle size={16} />
                <span>{i18n("Cart issues detected")}</span>
              </div>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* General error */}
          {error && !validationErrors.length && (
            <div className="bg-danger/10 text-danger flex items-center gap-3 rounded-lg p-4">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Payment section */}
          <div className="space-y-4">
            {/* Loading state while validating cart */}
            {isLoading && (
              <>
                <h3 className="text-lg font-semibold">{i18n("Shipping & Payment")}</h3>
                <div className="bg-surface-tint flex items-center gap-3 rounded-lg p-8">
                  <Loader2 className="text-primary h-5 w-5 animate-spin" />
                  <span className="text-neutral/70">{i18n("Validating your order...")}</span>
                </div>
              </>
            )}

            {/* Continue to payment button */}
            {!isLoading && !checkoutData && (
              <>
                <h3 className="text-lg font-semibold">{i18n("Shipping & Payment")}</h3>
                <Button
                  className="w-full py-4"
                  color="primary"
                  disabled={!isEmail(email.trim()) || !executeRecaptcha}
                  onClick={handleInitiateCheckout}
                  size="lg"
                  variant="filled"
                >
                  {!executeRecaptcha ? i18n("Loading...") : i18n("Continue")}
                </Button>
              </>
            )}

            {/* Stripe checkout form with address and payment */}
            {checkoutData &&
              (publicConfig.stripe.publishableKey ? (
                <Elements
                  options={{
                    appearance: {
                      theme: "stripe",
                      variables: {
                        borderRadius: "8px",
                      },
                    },
                    clientSecret: checkoutData.clientSecret,
                    // Use auto-detection for all locales - Stripe will show appropriate language
                    locale: "auto",
                  }}
                  stripe={getStripePromise()}
                >
                  <CheckoutForm
                    currency={checkoutData.currency}
                    email={email}
                    orderId={checkoutData.orderId}
                    totalMinor={checkoutData.totalMinor}
                  />
                </Elements>
              ) : (
                <div className="bg-danger/10 text-danger flex items-center gap-3 rounded-lg p-4">
                  <AlertCircle size={18} />
                  <span>{i18n("Payment system is not configured. Please contact support.")}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Extract productId from composite cart item ID.
 * Cart item IDs are formatted as: `productId::gender::ageGroup::size[::color]`
 */
function extractProductId(cartItemId: string): string {
  return cartItemId.split("::")[0];
}

function getStripePromise(): Promise<null | Stripe> {
  if (!stripePromise) {
    stripePromise = loadStripe(publicConfig.stripe.publishableKey);
  }
  return stripePromise;
}
