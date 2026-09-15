import { GetPublicVenuesQuery } from "~/types";

import { CardBase } from "./CardBase";

interface VenuesListCardProps {
  analyticsSource?: string;
  showFlag?: boolean;
  venue: GetPublicVenuesQuery["venues"][number];
}

export const VenuesListCard = ({ analyticsSource, showFlag, venue }: VenuesListCardProps) => {
  const mainImage = venue.logo || venue.chain?.logo || venue.chain?.chain?.logo || venue.images?.[0];

  return (
    <CardBase
      analyticsSource={analyticsSource}
      hasImage={Boolean(mainImage)}
      showFlag={showFlag}
      variant="list"
      venue={venue}
    />
  );
};
