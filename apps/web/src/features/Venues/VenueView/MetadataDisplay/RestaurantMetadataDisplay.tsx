import { DollarSign, Sparkles, Users, UtensilsCrossed } from "lucide-react";
import { useLocale } from "next-intl";

import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { GetPublicVenuesQuery, Locale } from "~/types";

import { MetadataChips, MetadataRow, MetadataSection } from "./MetadataSection";

interface RestaurantMetadataDisplayProps {
  restaurantDetails: GetPublicVenuesQuery["venues"][number]["venue_restaurant_details"][number];
}

export const RestaurantMetadataDisplay = ({ restaurantDetails }: RestaurantMetadataDisplayProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  if (!restaurantDetails) return null;

  const { cuisine_types, features, price_range, seating_capacity } = restaurantDetails;

  const cuisineItems = cuisine_types
    ?.map((cuisine) => {
      const option = constants.options.CUISINE.find((opt) => opt.value === cuisine);
      return option?.label[locale];
    })
    .filter(Boolean) as string[] | undefined;

  const hasCuisine = cuisineItems && cuisineItems.length > 0;

  const featureItems = features
    ?.map((feature) => {
      const option = constants.options.FEATURES.find((opt) => opt.value === feature);
      return option?.label[locale];
    })
    .filter(Boolean) as string[] | undefined;

  const hasFeatures = featureItems && featureItems.length > 0;

  const priceRangeLabel = price_range
    ? constants.options.PRICE_RANGE.find((opt) => opt.value === price_range)?.label[locale]
    : undefined;

  const hasBasicInfo = seating_capacity !== undefined || priceRangeLabel !== undefined;

  if (!hasCuisine && !hasBasicInfo && !hasFeatures) return null;

  return (
    <div className="space-y-6">
      {hasCuisine && (
        <MetadataSection icon={UtensilsCrossed} title={i18n("Cuisine")}>
          <MetadataChips items={cuisineItems} />
        </MetadataSection>
      )}

      {hasBasicInfo && (
        <MetadataSection icon={Users} title={i18n("Details")}>
          {seating_capacity && <MetadataRow icon={Users} label={i18n("Capacity")} showDots value={seating_capacity} />}
          {priceRangeLabel && (
            <MetadataRow icon={DollarSign} label={i18n("Price range")} showDots value={priceRangeLabel} />
          )}
        </MetadataSection>
      )}

      {hasFeatures && (
        <MetadataSection icon={Sparkles} title={i18n("Features")}>
          <MetadataChips items={featureItems} />
        </MetadataSection>
      )}
    </div>
  );
};
