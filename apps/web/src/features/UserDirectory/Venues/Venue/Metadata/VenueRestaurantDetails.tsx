import { ChefHat, Star, Utensils } from "lucide-react";
import { useLocale } from "next-intl";
import { useCallback } from "react";

import { Checkbox, Input, Select, Separator } from "~/components/ui";
import { FormProps } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { VenueFormData, VenueSchema } from "~/lib/validation/venue";
import { Locale } from "~/types";

type VenueRestaurantDetails = NonNullable<VenueFormData["venue_restaurant_details"]>;
type VenueRestaurantDetailsProps = Pick<FormProps<VenueSchema["shape"]>, "setValues" | "values">;

export const VenueRestaurantDetails = ({ setValues, values }: VenueRestaurantDetailsProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  const restaurantData = values.venue_restaurant_details ?? {};

  const updateRestaurantData = useCallback(
    (updates: Partial<VenueRestaurantDetails>) => {
      setValues((prev) => {
        const currentRestaurantDetails = prev.venue_restaurant_details ?? {};

        return {
          ...prev,
          venue_restaurant_details: {
            ...currentRestaurantDetails,
            ...updates,
          },
        };
      });
    },
    [setValues],
  );

  const toggleCuisine = useCallback(
    (cuisine: (typeof constants.cuisineOptions)[number]["value"]) => {
      const currentCuisines = restaurantData.cuisine_types || [];
      const newCuisines = currentCuisines.includes(cuisine)
        ? currentCuisines.filter((c) => c !== cuisine)
        : [...currentCuisines, cuisine];

      updateRestaurantData({ cuisine_types: newCuisines });
    },
    [restaurantData.cuisine_types, updateRestaurantData],
  );

  const toggleFeature = useCallback(
    (feature: (typeof constants.featureOptions)[number]["value"]) => {
      const currentFeatures = restaurantData.features || [];
      const newFeatures = currentFeatures.includes(feature)
        ? currentFeatures.filter((f) => f !== feature)
        : [...currentFeatures, feature];

      updateRestaurantData({ features: newFeatures });
    },
    [restaurantData.features, updateRestaurantData],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <ChefHat size={20} />
          {i18n("Cuisine")}
        </h3>

        <div className={`
          grid grid-cols-1 gap-3
          md:grid-cols-2
          lg:grid-cols-3
        `}>
          {constants.cuisineOptions.map((cuisine) => (
            <Checkbox
              checked={(restaurantData.cuisine_types || []).includes(cuisine.value)}
              key={cuisine.value}
              label={i18n(cuisine.label[locale])}
              onChange={() => {
                toggleCuisine(cuisine.value);
              }}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Utensils size={20} />
          {i18n("Capacity & pricing")}
        </h3>

        <div className={`
          grid grid-cols-1 gap-4
          md:grid-cols-2
        `}>
          <Input
            label={i18n("Capacity")}
            min={0}
            onChange={(e) => {
              updateRestaurantData({ seating_capacity: Number.parseInt(e.target.value) || undefined });
            }}
            placeholder="50"
            type="number"
            value={restaurantData.seating_capacity || ""}
          />

          <Select
            label={i18n("Price range")}
            onChange={(e) => {
              updateRestaurantData({ price_range: e.target.value });
            }}
            options={constants.priceRangeOptions.map((option) => ({
              label: i18n(option.label[locale]),
              value: option.value,
            }))}
            value={restaurantData.price_range}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Star size={20} />
          {i18n("Features & services")}
        </h3>

        <div className={`
          grid grid-cols-1 gap-3
          md:grid-cols-2
          lg:grid-cols-3
        `}>
          {constants.featureOptions.map((feature) => (
            <Checkbox
              checked={(restaurantData.features || []).includes(feature.value)}
              key={feature.value}
              label={i18n(feature.label[locale])}
              onChange={() => {
                toggleFeature(feature.value);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
