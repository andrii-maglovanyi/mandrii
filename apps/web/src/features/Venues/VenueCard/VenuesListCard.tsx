import { GetPublicVenuesQuery } from "~/types";

import { CardBase } from "./CardBase";

interface VenuesListCardProps {
  showFlag?: boolean;
  venue: GetPublicVenuesQuery["venues"][number];
}

export const VenuesListCard = ({ showFlag, venue }: VenuesListCardProps) => {
  const mainImage = venue.logo ?? venue.chain?.logo ?? venue.chain?.chain?.logo ?? venue.images?.[0];

  return <CardBase hasImage={Boolean(mainImage)} showFlag={showFlag} variant="list" venue={venue} />;
};
