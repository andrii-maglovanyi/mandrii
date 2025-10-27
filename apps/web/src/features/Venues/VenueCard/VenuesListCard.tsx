import { GetPublicVenuesQuery } from "~/types";

import { CardBase } from "./CardBase";

interface VenuesListCardProps {
  venue: GetPublicVenuesQuery["venues"][number];
}

/**
 * List-based venue card component for grid and list views.
 *
 * @param {VenuesListCardProps} props - Component props.
 * @returns {JSX.Element} The venue list card.
 */
export const VenuesListCard = ({ venue }: VenuesListCardProps) => {
  const mainImage = venue.logo ?? venue.images?.[0];

  return <CardBase hasImage={!!mainImage} variant="list" venue={venue} />;
};
