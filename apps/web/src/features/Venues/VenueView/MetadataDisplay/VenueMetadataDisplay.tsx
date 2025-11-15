import { GetPublicVenuesQuery, Venue_Category_Enum } from "~/types";

import { OpeningHoursDisplay } from "./OpeningHoursDisplay";

interface VenueMetadataDisplayProps {
  venue: GetPublicVenuesQuery["venues"][number];
}

export const VenueMetadataDisplay = ({ venue }: VenueMetadataDisplayProps) => {
  // Show opening hours for most categories
  const showOpeningHours = [
    Venue_Category_Enum.BeautySalon,
    Venue_Category_Enum.Cafe,
    Venue_Category_Enum.CulturalCentre,
    Venue_Category_Enum.GroceryStore,
    Venue_Category_Enum.Library,
    Venue_Category_Enum.Medical,
    Venue_Category_Enum.Restaurant,
    Venue_Category_Enum.School,
    Venue_Category_Enum.Shop,
  ].includes(venue.category);

  if (!showOpeningHours) return null;

  return (
    <div className="space-y-6">
      <OpeningHoursDisplay schedules={venue.venue_schedules} />
    </div>
  );
};
