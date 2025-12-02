import { hasOperatingHours } from "~/lib/utils";
import { GetPublicVenuesQuery } from "~/types";

import { OpeningHoursDisplay } from "./OpeningHoursDisplay";

interface VenueMetadataDisplayProps {
  venue: GetPublicVenuesQuery["venues"][number];
}

export const VenueMetadataDisplay = ({ venue }: VenueMetadataDisplayProps) => {
  if (!hasOperatingHours(venue.category)) return null;

  return (
    <div className="space-y-6">
      <OpeningHoursDisplay schedules={venue.venue_schedules} />
    </div>
  );
};
