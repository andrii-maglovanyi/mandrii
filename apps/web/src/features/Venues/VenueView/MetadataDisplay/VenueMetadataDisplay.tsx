import { hasOperatingHours } from "~/lib/utils";
import { GetPublicVenuesQuery, Venue_Status_Enum } from "~/types";

import { OpeningHoursDisplay } from "./OpeningHoursDisplay";

interface VenueMetadataDisplayProps {
  venue: GetPublicVenuesQuery["venues"][number];
}

export const VenueMetadataDisplay = ({ venue }: VenueMetadataDisplayProps) => {
  if (!hasOperatingHours(venue.category)) return null;

  return (
    <div className="space-y-6">
      <OpeningHoursDisplay isArchived={venue.status === Venue_Status_Enum.Archived} schedules={venue.venue_schedules} />
    </div>
  );
};
