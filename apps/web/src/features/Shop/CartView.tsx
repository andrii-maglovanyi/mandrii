"use client";

import { ShoppingCart } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useMemo } from "react";

import { Button, EmptyState, RichText } from "~/components/ui";
import { useCart } from "~/contexts/CartContext";
import { useI18n } from "~/i18n/useI18n";
import {
  CLOTHING_AGE_GROUP,
  CLOTHING_GENDER,
  CLOTHING_SIZE_ADULT,
  CLOTHING_SIZE_KIDS,
} from "~/lib/constants/options/CLOTHING";
import { formatPrice } from "~/lib/utils";
import { Locale } from "~/types";

const getVariantLabel = (
  variant: { ageGroup: string; gender: string; size: string } | undefined,
  locale: Locale,
): null | string => {
  if (!variant) return null;

  const genderLabel = CLOTHING_GENDER.find((g) => g.value === variant.gender)?.label[locale] ?? variant.gender;
  const ageLabel = CLOTHING_AGE_GROUP.find((a) => a.value === variant.ageGroup)?.label[locale] ?? variant.ageGroup;
  const sizeOptions = variant.ageGroup === "kids" ? CLOTHING_SIZE_KIDS : CLOTHING_SIZE_ADULT;
  const sizeLabel = sizeOptions.find((s) => s.value === variant.size)?.label[locale] ?? variant.size.toUpperCase();

  return `${genderLabel} · ${ageLabel} · ${sizeLabel}`;
};

export const CartView = () => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const { clear, clearCurrencyWarning, currencyMismatchWarning, items, removeItem, setQuantity, totalMinor } =
    useCart();

  const currency = items[0]?.currency ?? "USD";
  const totalLabel = formatPrice(totalMinor, currency, locale);

  const lineItems = useMemo(() => items, [items]);

  if (!items.length) {
    return (
      <EmptyState
        body={i18n("Add something from the shop to start checkout")}
        heading={i18n("Your cart is empty")}
        icon={<ShoppingCart size={50} />}
      />
    );
  }

  return (
    <div className={`grid gap-6 lg:grid-cols-3`}>
      {/* Currency mismatch warning */}
      {currencyMismatchWarning && (
        <div
          className={`bg-warning/10 border-warning/30 text-warning-dark flex items-center justify-between gap-4 rounded-xl border px-4 py-3 lg:col-span-3`}
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
      <div className={`space-y-4 lg:col-span-2`}>
        {lineItems.map((item) => (
          <div
            className={`border-primary/10 bg-surface flex flex-col gap-4 rounded-2xl border p-4 shadow-sm md:flex-row`}
            key={item.id}
          >
            <div className={`bg-surface-tint relative h-32 w-full overflow-hidden rounded-xl md:h-28 md:w-28`}>
              {item.image ? (
                <Image alt={item.name} className="object-cover" fill sizes="160px" src={item.image} />
              ) : (
                <div className={`text-neutral/50 flex h-full items-center justify-center`}>{i18n("No image")}</div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg leading-snug font-semibold">{item.name}</h3>
                  {item.variant && (
                    <p className="text-primary/80 text-sm font-medium">{getVariantLabel(item.variant, locale)}</p>
                  )}
                  <p className="text-neutral/70 text-sm">/shop/{item.slug}</p>
                </div>
                <Button color="neutral" onClick={() => removeItem(item.id)} size="sm" variant="ghost">
                  {i18n("Remove")}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className={`border-neutral/20 flex items-center rounded-lg border`}>
                  <Button
                    color="neutral"
                    onClick={() => setQuantity(item.id, Math.max(0, item.quantity - 1))}
                    size="sm"
                    variant="ghost"
                  >
                    −
                  </Button>
                  <span className={`min-w-12 text-center text-sm font-semibold`}>{item.quantity}</span>
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
                <span className="text-neutral/80 text-sm">
                  {i18n("Price per item")} {formatPrice(item.priceMinor, item.currency, locale)}
                </span>
                {item.stock !== undefined && item.quantity >= item.stock && (
                  <span className="text-xs text-orange-600 dark:text-orange-400">{i18n("Max stock reached")}</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end text-lg font-bold">
              {formatPrice(item.priceMinor * item.quantity, item.currency, locale)}
            </div>
          </div>
        ))}
      </div>

      <div className={`border-primary/10 bg-surface flex flex-col gap-4 rounded-2xl border p-4 shadow-md`}>
        <h3 className="text-xl font-semibold">{i18n("Order summary")}</h3>
        <div className={`text-neutral/80 flex items-center justify-between text-sm`}>
          <span>{i18n("Subtotal")}</span>
          <span>{totalLabel}</span>
        </div>
        <RichText className="text-neutral/70 text-sm">
          {i18n(
            "Checkout and payment are stubbed until the products API is ready. We'll connect this button to Stripe/Hasura next.",
          )}
        </RichText>
        <Button color="primary" disabled={!items.length} size="md" variant="filled">
          {i18n("Proceed to checkout")}
        </Button>
        <Button color="neutral" onClick={clear} size="sm" variant="ghost">
          {i18n("Clear cart")}
        </Button>
      </div>
    </div>
  );
};
