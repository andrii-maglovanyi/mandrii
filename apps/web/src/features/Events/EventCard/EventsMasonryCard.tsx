import { GetPublicEventsQuery } from "~/types";

import { CardBase } from "./CardBase";

interface EventsMasonryCardProps {
  analyticsSource?: string;
  event: GetPublicEventsQuery["events"][number];
  hasImage?: boolean;
  layoutSize: "full" | "half" | "small" | "third";
}

export const EventsMasonryCard = ({ analyticsSource, event, hasImage = false, layoutSize }: EventsMasonryCardProps) => {
  const variantMap = {
    full: "masonry-full" as const,
    half: "masonry-half" as const,
    small: "masonry-small" as const,
    third: "masonry-third" as const,
  };

  return (
    <CardBase analyticsSource={analyticsSource} event={event} hasImage={hasImage} variant={variantMap[layoutSize]} />
  );
};
