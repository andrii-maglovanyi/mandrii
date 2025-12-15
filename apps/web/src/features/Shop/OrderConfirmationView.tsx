"use client";

import { CheckCircle, Clock, Loader2, XCircle } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AnimatedEllipsis, Button } from "~/components/ui";
import { useCart } from "~/contexts/CartContext";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";
import { formatPrice } from "~/lib/utils";
import { Locale } from "~/types";

interface Order {
  created_at: string;
  currency: string;
  email: string;
  id: string;
  order_items: OrderItem[];
  payment_intent_id: string;
  shipping_minor: number;
  status: string;
  subtotal_minor: number;
  total_minor: number;
}

interface OrderConfirmationViewProps {
  orderId: string;
}

interface OrderItem {
  currency: string;
  id: string;
  metadata: unknown;
  name_snapshot: string;
  product: {
    id: string;
    images: string[];
    name: string;
    slug: string;
  } | null;
  quantity: number;
  unit_price_minor: number;
}

type PaymentStatus = "failed" | "loading" | "processing" | "requires_action" | "succeeded";

export function OrderConfirmationView({ orderId }: OrderConfirmationViewProps) {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const searchParams = useSearchParams();
  const { clear } = useCart();

  const [order, setOrder] = useState<null | Order>(null);
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [error, setError] = useState<null | string>(null);
  const [pollCount, setPollCount] = useState(0);

  // After N polls, show extended processing message
  const MAX_POLLS_BEFORE_EXTENDED_MESSAGE = 5;
  const isExtendedProcessing = status === "processing" && pollCount >= MAX_POLLS_BEFORE_EXTENDED_MESSAGE;

  // Clear cart and track on successful payment
  useEffect(() => {
    if (status === "succeeded") {
      clear();
    }
  }, [status, clear]);

  // Track order confirmation status
  useEffect(() => {
    if (order && status !== "loading") {
      sendToMixpanel("Order Confirmation Viewed", {
        currency: order.currency,
        itemCount: order.order_items.length,
        orderId: order.id,
        status,
        subtotalMinor: order.subtotal_minor,
        totalMinor: order.total_minor,
      });

      // Track completed purchase separately for funnel analysis
      if (status === "succeeded") {
        sendToMixpanel("Purchase Completed", {
          currency: order.currency,
          itemCount: order.order_items.length,
          orderId: order.id,
          subtotalMinor: order.subtotal_minor,
          totalMinor: order.total_minor,
        });
      }
    }
  }, [order, status]); // Track when order loads or status changes

  // Fetch order and check payment status
  useEffect(() => {
    let isCancelled = false;
    let pollTimeout: ReturnType<typeof setTimeout> | undefined;

    const mapStatus = (orderStatus: string | undefined, redirectStatus: null | string): PaymentStatus => {
      if (!orderStatus || orderStatus === "pending") {
        if (redirectStatus === "failed") return "failed";
        if (redirectStatus === "requires_action") return "requires_action";
        return "processing";
      }
      if (orderStatus === "paid") return "succeeded";
      if (orderStatus === "failed") return "failed";
      if (orderStatus === "refunded") return "failed";
      return "processing";
    };

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            "Accept-Language": locale,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = (await response.json()) as { order: Order };
        if (isCancelled) return;

        setOrder(data.order);
        const redirectStatus = searchParams.get("redirect_status");
        const nextStatus = mapStatus(data.order?.status, redirectStatus);
        setStatus(nextStatus);

        // If still processing/pending, poll again after a short delay to wait for webhook
        if (nextStatus === "processing") {
          setPollCount((prev) => prev + 1);
          pollTimeout = setTimeout(fetchOrder, 3000);
        }
      } catch {
        if (!isCancelled) {
          setError(i18n("Failed to load order details"));
        }
      }
    };

    fetchOrder();

    return () => {
      isCancelled = true;
      if (pollTimeout) clearTimeout(pollTimeout);
    };
  }, [orderId, locale, searchParams, i18n]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <XCircle className="text-danger mx-auto mb-4 h-16 w-16" />
        <h1 className="mb-2 text-2xl font-bold">{i18n("Something went wrong")}</h1>
        <p className="text-neutral/70 mb-6">{error}</p>
        <Link href={`/${locale}/shop`}>
          <Button color="primary" variant="filled">
            {i18n("Continue shopping")}
          </Button>
        </Link>
      </div>
    );
  }

  if (status === "loading" || !order) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <AnimatedEllipsis size="md" />
        <h1 className="mb-2 text-2xl font-bold">{i18n("Loading order...")}</h1>
      </div>
    );
  }

  const statusConfig = {
    failed: {
      color: "text-danger",
      description: i18n("Your payment could not be processed. Please try again or contact support."),
      icon: XCircle,
      title: i18n("Payment failed"),
    },
    loading: {
      color: "text-primary",
      description: "",
      icon: Loader2,
      title: i18n("Loading..."),
    },
    processing: {
      color: "text-warning",
      description: isExtendedProcessing
        ? i18n(
            "Your payment is still being verified. This can take a few minutes. We'll send you a confirmation email once your order is confirmed - no need to wait on this page.",
          )
        : i18n("Your payment is being processed. We'll send you a confirmation email once complete."),
      icon: Clock,
      title: isExtendedProcessing ? i18n("Still processing...") : i18n("Payment processing"),
    },
    requires_action: {
      color: "text-warning",
      description: i18n("Additional authentication is required. Please complete the payment."),
      icon: Clock,
      title: i18n("Action required"),
    },
    succeeded: {
      color: "text-success",
      description: i18n("Your order has been confirmed! We'll send you an email with the details."),
      icon: CheckCircle,
      title: i18n("Payment successful!"),
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 text-center">
        <StatusIcon className={`mx-auto mb-4 h-16 w-16 ${config.color} `} />
        <h1 className="mb-2 text-2xl font-bold">{config.title}</h1>
        <p className="text-neutral/70">{config.description}</p>
      </div>

      {/* Order details */}
      <div className="border-primary/10 bg-surface mb-6 rounded-xl border p-4">
        <h3 className="mb-3 font-semibold">{i18n("Order details")}</h3>

        <div className="text-neutral/70 mb-4 space-y-1 text-sm">
          <p>
            <span className="font-medium">{i18n("Order ID")}:</span> {order.id.slice(0, 8)}...
          </p>
          <p>
            <span className="font-medium">{i18n("Email")}:</span> {order.email}
          </p>
          <p>
            <span className="font-medium">{i18n("Date")}:</span>{" "}
            {new Date(order.created_at).toLocaleDateString(locale, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <ul className="mb-4 space-y-2">
          {order.order_items.map((item) => (
            <li className="text-neutral/80 flex justify-between text-sm" key={item.id}>
              <span>
                {item.name_snapshot} × {item.quantity}
              </span>
              <span>{formatPrice(item.unit_price_minor * item.quantity, item.currency, locale)}</span>
            </li>
          ))}
        </ul>

        <div className="border-primary/10 border-t pt-3">
          <div className="text-neutral/70 flex justify-between text-sm">
            <span>{i18n("Subtotal")}</span>
            <span>{formatPrice(order.subtotal_minor, order.currency, locale)}</span>
          </div>

          <div className="text-neutral/70 flex justify-between text-sm">
            <span>{i18n("Shipping")}</span>
            <span>{formatPrice(order.shipping_minor, order.currency, locale)}</span>
          </div>

          <div className="mt-1 flex justify-between font-semibold">
            <span>{i18n("Total")}</span>
            <span>{formatPrice(order.total_minor, order.currency, locale)}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <Link href={`/${locale}/shop`}>
          <Button className="w-full" color="primary" variant="filled">
            {i18n("Continue shopping")}
          </Button>
        </Link>
        {status === "failed" && (
          <Link href={`/${locale}/shop/cart`}>
            <Button className="w-full" color="neutral" variant="outlined">
              {i18n("Try again")}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
