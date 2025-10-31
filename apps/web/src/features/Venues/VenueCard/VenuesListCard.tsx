import { GetPublicVenuesQuery } from "~/types";

import { CardBase } from "./CardBase";

interface VenuesListCardProps {
  showFlag?: boolean;
  venue: GetPublicVenuesQuery["venues"][number];
}

/**
 * List-based venue card component for grid and list views.
 *
 * @param {VenuesListCardProps} props - Component props.
 * @returns {JSX.Element} The venue list card.
 */
export const VenuesListCard = ({ showFlag, venue }: VenuesListCardProps) => {
  const mainImage = venue.logo ?? venue.images?.[0];

  return <CardBase hasImage={!!mainImage} showFlag={showFlag} variant="list" venue={venue} />;
};
