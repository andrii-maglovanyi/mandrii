import { BedDouble, Gavel, Sparkles } from "lucide-react";
import { useLocale } from "next-intl";
import { useCallback } from "react";

import { Checkbox, Input, Separator } from "~/components/ui";
import { FormProps } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { VenueFormData, VenueSchema } from "~/lib/validation/venue";
import { Locale } from "~/types";

type VenueAccommodationDetails = NonNullable<VenueFormData["venue_accommodation_details"]>;
type VenueAccommodationDetailsProps = Pick<FormProps<VenueSchema["shape"]>, "setValues" | "values">;

export const VenueAccommodationDetails = ({ setValues, values }: VenueAccommodationDetailsProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  const accommodationData = values.venue_accommodation_details ?? {};

  const updateAccommodationData = useCallback(
    (updates: Partial<VenueAccommodationDetails>) => {
      setValues((prev) => {
        const currentAccommodationDetails = prev.venue_accommodation_details ?? {};

        return {
          ...prev,
          venue_accommodation_details: {
            ...currentAccommodationDetails,
            ...updates,
          },
        };
      });
    },
    [setValues],
  );

  const toggleAmenity = useCallback(
    (amenity: (typeof constants.amenityOptions)[number]["value"]) => {
      const currentAmenities = accommodationData.amenities || [];
      const newAmenities = currentAmenities.includes(amenity)
        ? currentAmenities.filter((a) => a !== amenity)
        : [...currentAmenities, amenity];

      updateAccommodationData({ amenities: newAmenities });
    },
    [accommodationData.amenities, updateAccommodationData],
  );

  const updateNumber = useCallback(
    (field: "bathrooms" | "bedrooms" | "max_guests" | "minimum_stay_nights", value: number) => {
      updateAccommodationData({ [field]: Math.max(0, value) });
    },
    [updateAccommodationData],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <BedDouble size={20} />
          {i18n("Capacity")}
        </h3>

        <div className={`
          grid grid-cols-1 gap-4
          md:grid-cols-3
        `}>
          <div className="flex items-center gap-2">
            <Input
              label={i18n("Bedrooms")}
              min={0}
              onChange={(e) => {
                updateNumber("bedrooms", Number.parseInt(e.target.value) || 0);
              }}
              type="number"
              value={accommodationData.bedrooms || ""}
            />
          </div>

          <div className="flex items-center gap-2">
            <Input
              label={i18n("Bathrooms")}
              min={0}
              onChange={(e) => {
                updateNumber("bathrooms", Number.parseFloat(e.target.value) || 0);
              }}
              step={0.5}
              type="number"
              value={accommodationData.bathrooms || ""}
            />
          </div>

          <div className="flex items-center gap-2">
            <Input
              label={i18n("Max guests")}
              min={1}
              onChange={(e) => {
                updateNumber("max_guests", Number.parseInt(e.target.value) || 0);
              }}
              type="number"
              value={accommodationData.max_guests || ""}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Gavel size={20} />
          {i18n("Rules")}
        </h3>

        <div className={`
          grid grid-cols-1 gap-4
          md:grid-cols-3
        `}>
          <Input
            label={i18n("Check-in")}
            onChange={(e) => {
              updateAccommodationData({ check_in_time: e.target.value });
            }}
            placeholder="14:00"
            type="time"
            value={accommodationData.check_in_time || ""}
          />

          <Input
            label={i18n("Check-out")}
            onChange={(e) => {
              updateAccommodationData({ check_out_time: e.target.value });
            }}
            placeholder="11:00"
            type="time"
            value={accommodationData.check_out_time || ""}
          />

          <Input
            label={i18n("Minimum stay")}
            min={1}
            onChange={(e) => {
              updateNumber("minimum_stay_nights", Number.parseInt(e.target.value) || 1);
            }}
            type="number"
            value={accommodationData.minimum_stay_nights || ""}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles size={20} />
          {i18n("Amenities")}
        </h3>

        <div className={`
          grid grid-cols-1 gap-3
          md:grid-cols-2
          lg:grid-cols-3
        `}>
          {constants.amenityOptions.map((amenity) => (
            <Checkbox
              checked={(accommodationData.amenities || []).includes(amenity.value)}
              key={amenity.value}
              label={i18n(amenity.label[locale])}
              onChange={() => {
                toggleAmenity(amenity.value);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
