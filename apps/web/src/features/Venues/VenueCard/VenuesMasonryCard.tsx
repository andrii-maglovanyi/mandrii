import { GetPublicVenuesQuery } from "~/types";

import { CardBase } from "./CardBase";

interface VenuesMasonryCardProps {
  hasImage?: boolean;
  layoutSize: "full" | "half" | "small" | "third";
  showFlag?: boolean;
  venue: GetPublicVenuesQuery["venues"][number];
}

export const VenuesMasonryCard = ({ hasImage = false, layoutSize, showFlag, venue }: VenuesMasonryCardProps) => {
  const variantMap = {
    full: "masonry-full" as const,
    half: "masonry-half" as const,
    small: "masonry-small" as const,
    third: "masonry-third" as const,
  };

  return <CardBase hasImage={hasImage} showFlag={showFlag} variant={variantMap[layoutSize]} venue={venue} />;
};
