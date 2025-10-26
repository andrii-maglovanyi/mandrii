import { GetPublicVenuesQuery } from "~/types";

import { VenueCardBase } from "./VenueCardBase";

interface VenuesTileCardProps {
  venue: GetPublicVenuesQuery["venues"][number];
}

/**
 * Tile-based venue card component for grid and list views.
 *
 * @param {VenuesTileCardProps} props - Component props.
 * @returns {JSX.Element} The venue tile card.
 */
export const VenuesTileCard = ({ venue }: VenuesTileCardProps) => {
  const mainImage = venue.logo ?? venue.images?.[0];

  return <VenueCardBase hasImage={!!mainImage} variant="tile" venue={venue} />;
};
