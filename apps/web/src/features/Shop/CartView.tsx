"use client";

import { ShoppingCart, Trash2 } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo } from "react";

import { ActionButton, Breadcrumbs, Button, EmptyState, FallbackImage } from "~/components/ui";
import { useCart } from "~/contexts/CartContext";
import { useI18n } from "~/i18n/useI18n";
import {
  CLOTHING_AGE_GROUP,
  CLOTHING_GENDER,
  CLOTHING_SIZE_ADULT,
  CLOTHING_SIZE_KIDS,
} from "~/lib/constants/options/CLOTHING";
import { sendToMixpanel } from "~/lib/mixpanel";
import { formatPrice } from "~/lib/utils";
import { Locale } from "~/types";

const getVariantLabel = (
  variant: { ageGroup: string; gender: string; size: string } | undefined,
  locale: Locale,
): null | string => {
  if (!variant) return null;

  const ageLabel = CLOTHING_AGE_GROUP.find((a) => a.value === variant.ageGroup)?.label[locale] ?? variant.ageGroup;
  const genderLabel = CLOTHING_GENDER.find((g) => g.value === variant.gender)?.label[locale] ?? variant.gender;
  const sizeOptions = variant.ageGroup === "kids" ? CLOTHING_SIZE_KIDS : CLOTHING_SIZE_ADULT;
  const sizeLabel = sizeOptions.find((s) => s.value === variant.size)?.label[locale] ?? variant.size.toUpperCase();

  return `${ageLabel} · ${genderLabel} · ${sizeLabel}`;
};

export const CartView = () => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const { clear, clearCurrencyWarning, currencyMismatchWarning, items, removeItem, setQuantity, totalMinor } =
    useCart();

  const currency = items[0]?.currency ?? "USD";
  const totalLabel = formatPrice(totalMinor, currency, locale);

  const lineItems = useMemo(() => items, [items]);

  // Track cart view
  useEffect(() => {
    if (items.length > 0) {
      sendToMixpanel("Viewed Cart", {
        currency,
        itemCount: items.length,
        totalMinor,
        totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      });
    }
  }, [currency, items, totalMinor]);

  if (!items.length) {
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
          heading={i18n("Your cart is empty")}
          icon={<ShoppingCart size={50} />}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ title: i18n("Home"), url: "/" }, { title: i18n("Shop"), url: "/shop" }, { title: i18n("Cart") }]}
      />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className={`
          text-2xl font-semibold
          md:text-3xl
        `}>{i18n("Your Cart")}</h1>
        <span className="text-sm text-neutral/60">
          {items.length} {items.length === 1 ? i18n("item") : i18n("items")}
        </span>
      </div>

      <div className={`
        grid gap-8
        lg:grid-cols-3 lg:gap-12
      `}>
        {/* Currency mismatch warning */}
        {currencyMismatchWarning && (
          <div
            className={`
              flex items-center justify-between gap-4 rounded-lg border
              border-red-500 bg-red-500/10 px-4 py-3 text-red-700
              lg:col-span-3
            `}
          >
            <p className="text-sm">
              {i18n(
                "Some items were removed from your cart because they had a different currency. Only items in the same currency can be checked out together.",
              )}
            </p>
            <Button color="neutral" onClick={clearCurrencyWarning} size="sm" variant="ghost">
              {i18n("Dismiss")}
            </Button>
          </div>
        )}

        {/* Cart Items */}
        <div className={`
          space-y-6
          lg:col-span-2
        `}>
          {lineItems.map((item) => (
            <div className={`
              flex flex-col gap-5 rounded-lg border border-neutral/10 p-5
              md:flex-row
            `} key={item.id}>
              <Link
                className={`
                  relative h-32 w-full shrink-0 overflow-hidden rounded-lg
                  bg-surface-tint
                  md:h-28 md:w-28
                `}
                href={`/${locale}/shop/${item.slug}`}
              >
                <FallbackImage alt={item.name} className="object-cover" fill sizes="160px" src={item.image || ""} />
              </Link>
              <div className="flex flex-1 flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <Link className={`
                      transition-colors
                      hover:text-primary
                    `} href={`/${locale}/shop/${item.slug}`}>
                      <h3 className="text-lg leading-snug font-semibold">{item.name}</h3>
                    </Link>
                    {item.variant && <p className="text-sm text-neutral/70">{getVariantLabel(item.variant, locale)}</p>}
                  </div>
                  <span className="text-lg font-semibold">
                    {formatPrice(item.priceMinor * item.quantity, item.currency, locale)}
                  </span>
                </div>
                <div className={`
                  flex flex-wrap items-center justify-between gap-3
                `}>
                  <div className="flex items-center gap-4">
                    <div className={`
                      flex items-center rounded-lg border border-neutral/20 p-px
                    `}>
                      <Button
                        color="neutral"
                        onClick={() => setQuantity(item.id, Math.max(0, item.quantity - 1))}
                        size="sm"
                        variant="ghost"
                      >
                        −
                      </Button>
                      <span className={`
                        min-w-10 text-center text-sm font-medium
                      `}>{item.quantity}</span>
                      <Button
                        color="neutral"
                        disabled={item.stock !== undefined && item.quantity >= item.stock}
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                        size="sm"
                        variant="ghost"
                      >
                        +
                      </Button>
                    </div>
                    <span className="text-sm text-neutral/60">
                      {formatPrice(item.priceMinor, item.currency, locale)} {i18n("each")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.stock !== undefined && item.quantity >= item.stock && (
                      <span className={`
                        text-xs text-orange-600
                        dark:text-orange-400
                      `}>{i18n("Max stock")}</span>
                    )}
                    <ActionButton
                      aria-label={i18n("Remove")}
                      color="neutral"
                      icon={<Trash2 className="stroke-red-600" />}
                      onClick={() => {
                        sendToMixpanel("Removed from Cart", {
                          currency: item.currency,
                          itemId: item.id,
                          itemName: item.name,
                          priceMinor: item.priceMinor,
                          quantity: item.quantity,
                        });
                        removeItem(item.id);
                      }}
                      variant="ghost"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className={`
          h-fit space-y-2
          lg:sticky lg:top-24
        `}>
          <div className="mb-4 space-y-4">
            <h3 className="text-lg font-semibold">{i18n("Order summary")}</h3>
            <div className={`space-y-3 border-b border-neutral/10 pb-4`}>
              <div className={`
                flex items-center justify-between text-sm text-neutral/70
              `}>
                <span>{i18n("Subtotal")}</span>
                <span>{totalLabel}</span>
              </div>
              <div className={`
                flex items-center justify-between text-sm text-neutral/70
              `}>
                <span>{i18n("Shipping")}</span>
                <span>{i18n("Calculated at checkout")}</span>
              </div>
            </div>
            <div className={`flex items-center justify-between font-semibold`}>
              <span>{i18n("Total")}</span>
              <span className="text-lg">{totalLabel}</span>
            </div>
          </div>

          <Link className="block" href={`/${locale}/shop/checkout`}>
            <Button
              className="w-full"
              color="primary"
              disabled={!items.length}
              onClick={() => {
                sendToMixpanel("Clicked Proceed to Checkout", {
                  currency,
                  itemCount: items.length,
                  totalMinor,
                  totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
                });
              }}
              size="lg"
              variant="filled"
            >
              {i18n("Proceed to checkout")}
            </Button>
          </Link>

          <Link className="block" href={`/${locale}/shop`}>
            <Button className="w-full" color="neutral" size="lg" variant="outlined">
              {i18n("Continue shopping")}
            </Button>
          </Link>

          <Button className="w-full" color="neutral" onClick={clear} size="lg" variant="ghost">
            {i18n("Clear cart")}
          </Button>
        </div>
      </div>
    </div>
  );
};
