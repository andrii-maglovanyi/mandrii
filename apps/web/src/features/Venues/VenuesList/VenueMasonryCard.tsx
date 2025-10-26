import { GetPublicVenuesQuery } from "~/types";

import { VenueCardBase } from "./VenueCardBase";

interface VenueMasonryCardProps {
  hasImage?: boolean;
  layoutSize: "full" | "half" | "small" | "third";
  venue: GetPublicVenuesQuery["venues"][number];
}

/**
 * Masonry-style venue card component with flexible layout sizes.
 *
 * @param {VenueMasonryCardProps} props - Component props.
 * @returns {JSX.Element} The venue masonry card.
 */
export const VenueMasonryCard = ({ hasImage = false, layoutSize, venue }: VenueMasonryCardProps) => {
  const variantMap = {
    full: "masonry-full" as const,
    half: "masonry-half" as const,
    small: "masonry-small" as const,
    third: "masonry-third" as const,
  };

  return <VenueCardBase hasImage={hasImage} variant={variantMap[layoutSize]} venue={venue} />;
};
