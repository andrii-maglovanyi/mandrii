import { GetPublicEventsQuery } from "~/types";

import { CardBase } from "./CardBase";

interface EventsListCardProps {
  event: GetPublicEventsQuery["events"][number];
}

export const EventsListCard = ({ event }: EventsListCardProps) => {
  const mainImage = event.images?.[0];

  return <CardBase event={event} hasImage={Boolean(mainImage)} variant="list" />;
};
