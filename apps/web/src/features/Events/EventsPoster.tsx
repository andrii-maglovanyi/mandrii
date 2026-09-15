import { ArrowRight } from "lucide-react";

import { Alert, TextLink } from "~/components/ui";
import { GET_PUBLIC_EVENT_SCHEDULES, GET_PUBLIC_EVENTS } from "~/graphql/events";
import { getI18n } from "~/i18n/getI18n";
import { getServerClient } from "~/lib/apollo/server-client";
import { getDiscoverableEventsWhere } from "~/lib/content-visibility";
import { EventSchedule, orderEventsByIds, selectEventSchedules } from "~/lib/events/discovery";
import { GetPublicEventsQuery, GetPublicEventsQueryVariables } from "~/types";

import { EventsMasonryCard } from "./EventCard/EventsMasonryCard";
import { getEventsFilter } from "./utils/getEventsFilter";

interface EventsPosterProps {
  locale: string;
}

export const EventsPoster = async ({ locale }: EventsPosterProps) => {
  const i18n = await getI18n({ locale });
  let events: GetPublicEventsQuery["events"];
  try {
    const client = await getServerClient();
    const now = new Date().toISOString();

    const { variables } = getEventsFilter({
      dateFrom: now,
    });

    const where = getDiscoverableEventsWhere(variables.where);
    const { data: schedules } = await client.query<{ events: EventSchedule[] }>({
      query: GET_PUBLIC_EVENT_SCHEDULES,
      variables: { where },
    });
    const ids = selectEventSchedules(schedules.events, { from: now }, new Date(now))
      .slice(0, 4)
      .map(({ id }) => id);
    if (!ids.length) return null;
    const { data } = await client.query<GetPublicEventsQuery, GetPublicEventsQueryVariables>({
      query: GET_PUBLIC_EVENTS,
      variables: {
        limit: ids.length,
        totalWhere: getDiscoverableEventsWhere(),
        where: getDiscoverableEventsWhere({ id: { _in: ids } }),
      },
    });
    events = orderEventsByIds(data.events, ids);
  } catch (error) {
    console.error("Error fetching events:", error);

    return <Alert variant="warning">{i18n("Events are not available at the moment")}</Alert>;
  }
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{i18n("Upcoming events")}</h2>
        <TextLink href="/events">
          {i18n("View all")}
          <ArrowRight aria-hidden size={16} />
        </TextLink>
      </div>
      <div className={`
        grid grid-cols-1 gap-4
        md:grid-cols-2
        lg:grid-cols-3
      `}>
        {events.map((event, index) => (
          <EventsMasonryCard
            event={event}
            hasImage={Boolean(event.images?.length)}
            key={event.id}
            layoutSize={index === 0 ? "full" : "small"}
          />
        ))}
      </div>
    </div>
  );
};
