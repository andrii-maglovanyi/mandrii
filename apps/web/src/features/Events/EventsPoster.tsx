import Link from "next/link";

import { Alert } from "~/components/ui";
import { GET_PUBLIC_EVENTS } from "~/graphql/events";
import { getI18n } from "~/i18n/getI18n";
import { getServerClient } from "~/lib/apollo/server-client";
import { GetPublicEventsQuery, GetPublicEventsQueryVariables, Order_By } from "~/types";

import { EventsMasonryCard } from "./EventCard/EventsMasonryCard";

interface EventsPosterProps {
  locale: string;
}

export const EventsPoster = async ({ locale }: EventsPosterProps) => {
  try {
    const client = await getServerClient();
    const i18n = await getI18n({ locale });

    const { data } = await client.query<GetPublicEventsQuery, GetPublicEventsQueryVariables>({
      query: GET_PUBLIC_EVENTS,
      variables: {
        limit: 4,
        order_by: [{ created_at: Order_By.Desc }],
        where: {},
      },
    });

    const events = data?.events;

    if (!events || events.length === 0) {
      return null;
    }

    return (
      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{i18n("Upcoming events")}</h2>
          <Link
            className={`
              inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm
              font-medium text-primary no-underline transition-colors
              hover:bg-primary/10
            `}
            href="/events"
          >
            {i18n("View all")}
            <span className={`
              transition-transform
              group-hover:translate-x-1
            `}>→</span>
          </Link>
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
  } catch (error) {
    console.error("Error fetching events:", error);

    const i18n = await getI18n({ locale });

    return <Alert variant="warning">{i18n("Events are not available at the moment")}</Alert>;
  }
};
