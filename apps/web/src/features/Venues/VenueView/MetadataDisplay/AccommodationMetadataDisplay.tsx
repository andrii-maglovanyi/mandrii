import { Bath, Bed, BedDouble, Gavel, LogIn, LogOut, Sparkles, Tally5, Users } from "lucide-react";
import { useLocale } from "next-intl";

import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { formatTime } from "~/lib/utils";
import { GetPublicVenuesQuery, Locale } from "~/types";

import { MetadataChips, MetadataRow, MetadataSection } from "./MetadataSection";

interface AccommodationMetadataDisplayProps {
  accommodationDetails: GetPublicVenuesQuery["venues"][number]["venue_accommodation_details"][number];
}

export const AccommodationMetadataDisplay = ({ accommodationDetails }: AccommodationMetadataDisplayProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  const { amenities, bathrooms, bedrooms, check_in_time, check_out_time, max_guests, minimum_stay_nights } =
    accommodationDetails ?? {};

  const hasCapacityInfo = bedrooms || bathrooms || max_guests;
  const hasCheckInInfo = check_in_time || check_out_time || minimum_stay_nights;
  const hasAmenities = amenities && amenities.length > 0;

  if (!hasCapacityInfo && !hasCheckInInfo && !hasAmenities) return null;

  return (
    <div className="space-y-6">
      {hasCapacityInfo && (
        <MetadataSection icon={BedDouble} title={i18n("Capacity")}>
          {bedrooms !== undefined && <MetadataRow icon={Bed} label={i18n("Bedrooms")} showDots value={bedrooms} />}
          {bathrooms !== undefined && <MetadataRow icon={Bath} label={i18n("Bathrooms")} showDots value={bathrooms} />}
          {max_guests && <MetadataRow icon={Users} label={i18n("Max guests")} showDots value={max_guests} />}
        </MetadataSection>
      )}

      {hasCheckInInfo && (
        <MetadataSection icon={Gavel} title={i18n("Rules")}>
          {check_in_time && (
            <MetadataRow icon={LogIn} label={i18n("Check-in")} showDots value={formatTime(check_in_time)} />
          )}
          {check_out_time && (
            <MetadataRow icon={LogOut} label={i18n("Check-out")} showDots value={formatTime(check_out_time)} />
          )}
          {minimum_stay_nights && (
            <MetadataRow
              icon={Tally5}
              label={i18n("Minimum stay")}
              showDots
              value={i18n("{count} nights", { count: minimum_stay_nights })}
            />
          )}
        </MetadataSection>
      )}

      {hasAmenities && (
        <MetadataSection icon={Sparkles} title={i18n("Amenities")}>
          <MetadataChips
            items={(amenities as (typeof constants.amenityOptions)[number]["value"][]).map(
              (amenity) =>
                constants.amenityOptions.find((option) => option.value === amenity)?.label[locale] || amenity,
            )}
          />
        </MetadataSection>
      )}
    </div>
  );
};
