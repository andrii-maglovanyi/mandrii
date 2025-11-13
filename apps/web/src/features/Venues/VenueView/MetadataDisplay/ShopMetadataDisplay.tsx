import { CreditCard, ShoppingBag } from "lucide-react";
import { useLocale } from "next-intl";

import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { Locale } from "~/types";
import { GetPublicVenuesQuery } from "~/types/graphql.generated";

import { MetadataChips, MetadataSection } from "./MetadataSection";

interface ShopMetadataDisplayProps {
  shopDetails: GetPublicVenuesQuery["venues"][number]["venue_shop_details"][number];
}

export const ShopMetadataDisplay = ({ shopDetails }: ShopMetadataDisplayProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  const { payment_methods, product_categories } = shopDetails ?? {};

  const hasProducts = product_categories && product_categories.length > 0;
  const hasPayments = payment_methods && payment_methods.length > 0;

  if (!hasProducts && !hasPayments) return null;

  return (
    <div className="space-y-6">
      {hasProducts && (
        <MetadataSection icon={ShoppingBag} title={i18n("Products")}>
          <MetadataChips
            items={(product_categories as (typeof constants.productCategoryOptions)[number]["value"][]).map(
              (category) =>
                constants.productCategoryOptions.find((option) => option.value === category)?.label[locale] || category,
            )}
          />
        </MetadataSection>
      )}

      {hasPayments && (
        <MetadataSection icon={CreditCard} title={i18n("Payment methods")}>
          {hasPayments && (
            <div className="space-y-2">
              <MetadataChips
                items={(payment_methods as (typeof constants.paymentOptions)[number]["value"][]).map(
                  (method) =>
                    constants.paymentOptions.find((option) => option.value === method)?.label[locale] || method,
                )}
              />
            </div>
          )}
        </MetadataSection>
      )}
    </div>
  );
};
