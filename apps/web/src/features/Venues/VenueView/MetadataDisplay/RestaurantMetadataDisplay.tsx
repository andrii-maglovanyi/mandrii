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

  const { cuisine_types, features, price_range, seating_capacity } = restaurantDetails ?? {};

  const hasCuisine = cuisine_types && cuisine_types.length > 0;
  const hasBasicInfo = seating_capacity || price_range;
  const hasFeatures = features && features.length > 0;

  if (!hasCuisine && !hasBasicInfo && !hasFeatures) return null;

  return (
    <div className="space-y-6">
      {hasCuisine && (
        <MetadataSection icon={UtensilsCrossed} title={i18n("Cuisine")}>
          <MetadataChips
            items={(cuisine_types as (typeof constants.cuisineOptions)[number]["value"][]).map(
              (cuisine) =>
                constants.cuisineOptions.find((option) => option.value === cuisine)?.label[locale] || cuisine,
            )}
          />
        </MetadataSection>
      )}

      {hasBasicInfo && (
        <MetadataSection icon={Users} title={i18n("Details")}>
          {seating_capacity !== undefined && (
            <MetadataRow icon={Users} label={i18n("Capacity")} showDots value={seating_capacity} />
          )}
          {price_range && (
            <MetadataRow
              icon={DollarSign}
              label={i18n("Price range")}
              showDots
              value={
                constants.priceRangeOptions.find((option) => option.value === price_range)?.label[locale] || price_range
              }
            />
          )}
        </MetadataSection>
      )}

      {/* Features */}
      {hasFeatures && (
        <MetadataSection icon={Sparkles} title={i18n("Features")}>
          <MetadataChips
            items={(features as (typeof constants.featureOptions)[number]["value"][]).map(
              (feature) =>
                constants.featureOptions.find((option) => option.value === feature)?.label[locale] || feature,
            )}
          />
        </MetadataSection>
      )}
    </div>
  );
};
