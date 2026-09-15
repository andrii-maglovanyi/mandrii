import { GetPublicEventsQuery } from "~/types";

import { CardBase } from "./CardBase";

interface EventsListCardProps {
  analyticsSource?: string;
  event: GetPublicEventsQuery["events"][number];
}

export const EventsListCard = ({ analyticsSource, event }: EventsListCardProps) => {
  const mainImage = event.images?.[0];

  return <CardBase analyticsSource={analyticsSource} event={event} hasImage={Boolean(mainImage)} variant="list" />;
};
