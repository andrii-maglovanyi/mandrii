import { GetPublicVenuesQuery } from "~/types";

import { CardBase } from "./CardBase";

interface VenuesMasonryCardProps {
  hasImage?: boolean;
  layoutSize: "full" | "half" | "small" | "third";
  venue: GetPublicVenuesQuery["venues"][number];
}

/**
 * Masonry-style venue card component with flexible layout sizes.
 *
 * @param {VenuesMasonryCardProps} props - Component props.
 * @returns {JSX.Element} The venue masonry card.
 */
export const VenuesMasonryCard = ({ hasImage = false, layoutSize, venue }: VenuesMasonryCardProps) => {
  const variantMap = {
    full: "masonry-full" as const,
    half: "masonry-half" as const,
    small: "masonry-small" as const,
    third: "masonry-third" as const,
  };

  return <CardBase hasImage={hasImage} variant={variantMap[layoutSize]} venue={venue} />;
};
