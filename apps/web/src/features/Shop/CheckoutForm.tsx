"use client";

import {
  AddressElement,
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { StripeExpressCheckoutElementConfirmEvent } from "@stripe/stripe-js";
import { AlertCircle, Loader2 } from "lucide-react";
import { useLocale } from "next-intl";
import { FormEvent, useState } from "react";

import { Button } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";
import { formatPrice } from "~/lib/utils";
import { Locale } from "~/types";

interface CheckoutFormProps {
  currency: string;
  email: string;
  orderId: string;
  totalMinor: number;
}

/**
 * Stripe checkout form component with address and payment elements.
 * Handles shipping address collection and payment confirmation.
 */
export function CheckoutForm({ currency, email, orderId, totalMinor }: CheckoutFormProps) {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState<null | string>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExpressCheckout, setShowExpressCheckout] = useState(false);

  /**
   * Handle Express Checkout (Google Pay, Apple Pay, Link, etc.)
   */
  const handleExpressCheckoutConfirm = async (_event: StripeExpressCheckoutElementConfirmEvent) => {
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    sendToMixpanel("Payment Attempted", {
      orderId,
      totalMinor,
      currency,
      paymentMethod: "express",
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
      orderId,
      totalMinor,
      currency,
      paymentMethod: "card",
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
            <div className="bg-neutral/20 h-px flex-1" />
            <span className="text-neutral/60 text-sm">{i18n("Or pay another way")}</span>
            <div className="bg-neutral/20 h-px flex-1" />
          </div>
        )}
      </div>

      {/* Shipping Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{i18n("Shipping address")}</h3>
        <AddressElement
          options={{
            mode: "shipping",
            defaultValues: {
              address: {
                country: "GB",
              },
            },
            fields: {
              phone: "always",
            },
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
            layout: "tabs",
            defaultValues: {
              billingDetails: {
                email,
              },
            },
          }}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-danger/10 text-danger flex items-center gap-3 rounded-lg p-4">
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

      <p className="text-neutral/60 text-center text-xs">{i18n("Your payment is securely processed by Stripe.")}</p>
    </form>
  );
}
