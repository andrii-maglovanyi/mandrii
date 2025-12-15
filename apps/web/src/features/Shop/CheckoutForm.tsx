"use client";

import {
  AddressElement,
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { StripeAddressElementChangeEvent } from "@stripe/stripe-js";
import { AlertCircle, Loader2 } from "lucide-react";
import { useLocale } from "next-intl";
import { FormEvent, useState } from "react";

import { Button } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";
import { formatPrice } from "~/lib/utils";
import { Locale } from "~/types";

interface CheckoutFormProps {
  addressKey: number;
  currency: string;
  email: string;
  onCountryChange: (country: string) => void;
  orderId: string;
  shippingDestination: string;
  totalMinor: number;
}

/**
 * Stripe checkout form component with address and payment elements.
 * Handles shipping address collection and payment confirmation.
 */
export function CheckoutForm({
  addressKey,
  currency,
  email,
  onCountryChange,
  orderId,
  shippingDestination,
  totalMinor,
}: CheckoutFormProps) {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState<null | string>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExpressCheckout, setShowExpressCheckout] = useState(false);

  /**
   * Handle address changes from Stripe AddressElement.
   * When user selects a different country, notify parent to update shipping destination.
   */
  const handleAddressChange = (event: StripeAddressElementChangeEvent) => {
    if (event.value?.address?.country) {
      onCountryChange(event.value.address.country);
    }
  };

  /**
   * Handle Express Checkout (Google Pay, Apple Pay, Link, etc.)
   */
  const handleExpressCheckoutConfirm = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    sendToMixpanel("Payment Attempted", {
      currency,
      orderId,
      paymentMethod: "express",
      totalMinor,
    });

    try {
      const { error: stripeError } = await stripe.confirmPayment({
        confirmParams: {
          return_url: `${window.location.origin}/${locale}/shop/order/${orderId}`,
        },
        elements,
      });

      if (stripeError) {
        console.error("[Checkout] Express checkout error:", stripeError);
        setError(stripeError.message ?? i18n("Payment failed. Please try again."));
      }
    } catch (err) {
      console.error("[Checkout] Express checkout unexpected error:", err);
      setError(i18n("An unexpected error occurred. Please try again."));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    sendToMixpanel("Payment Attempted", {
      currency,
      orderId,
      paymentMethod: "card",
      totalMinor,
    });

    try {
      const { error: stripeError } = await stripe.confirmPayment({
        confirmParams: {
          return_url: `${window.location.origin}/${locale}/shop/order/${orderId}`,
        },
        elements,
      });

      // This will only be reached if there's an error
      // Successful payments redirect to return_url
      if (stripeError) {
        console.error("[Checkout] Stripe error:", stripeError);
        if (stripeError.type === "card_error" || stripeError.type === "validation_error") {
          setError(stripeError.message ?? i18n("Payment failed. Please try again."));
        } else {
          setError(stripeError.message ?? i18n("An unexpected error occurred. Please try again."));
        }
      }
    } catch (err) {
      console.error("[Checkout] Unexpected error:", err);
      setError(i18n("An unexpected error occurred. Please try again."));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {/* Express Checkout - Google Pay, Apple Pay, Link, PayPal */}
      <div className={showExpressCheckout ? "space-y-4" : ""}>
        <ExpressCheckoutElement
          onConfirm={handleExpressCheckoutConfirm}
          onReady={({ availablePaymentMethods }) => {
            // Show section only if wallets are available
            setShowExpressCheckout(!!availablePaymentMethods);
          }}
          options={{
            buttonHeight: 48,
            paymentMethods: {
              applePay: "never",
              googlePay: "always",
              link: "never",
              paypal: "auto",
            },
          }}
        />
        {showExpressCheckout && (
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-neutral/20" />
            <span className="text-sm text-neutral/60">{i18n("Or pay another way")}</span>
            <div className="h-px flex-1 bg-neutral/20" />
          </div>
        )}
      </div>

      {/* Shipping Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{i18n("Shipping address")}</h3>
        <AddressElement
          key={addressKey}
          onChange={handleAddressChange}
          options={{
            defaultValues: {
              address: {
                country:
                  shippingDestination === "ROW" ? "UA" : shippingDestination === "EU" ? "DE" : shippingDestination,
              },
            },
            fields: {
              phone: "always",
            },
            mode: "shipping",
            validation: {
              phone: {
                required: "auto",
              },
            },
          }}
        />
      </div>

      {/* Payment */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{i18n("Payment")}</h3>
        <PaymentElement
          options={{
            defaultValues: {
              billingDetails: {
                email,
              },
            },
            layout: "tabs",
          }}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className={`
          flex items-center gap-3 rounded-lg bg-danger/10 p-4 text-danger
        `}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Submit button */}
      <Button
        className="w-full py-4"
        color="primary"
        disabled={!stripe || !elements || isProcessing}
        size="lg"
        type="submit"
        variant="filled"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {i18n("Processing...")}
          </>
        ) : (
          i18n("Pay {amount}", { amount: formatPrice(totalMinor, currency, locale) })
        )}
      </Button>

      <p className="text-center text-xs text-neutral/60">{i18n("Your payment is securely processed by Stripe.")}</p>
    </form>
  );
}
