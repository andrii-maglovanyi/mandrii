import { Alert } from "~/components/ui";
import { GET_PUBLIC_EVENTS } from "~/graphql/events";
import { getI18n } from "~/i18n/getI18n";
import { getServerClient } from "~/lib/apollo/server-client";
import { GetPublicEventsQuery, GetPublicEventsQueryVariables } from "~/types/graphql.generated";

import { EventView } from "./EventView";

type EventViewServerProps = {
  locale: string;
  slug: string;
};

export async function EventViewServer({ locale, slug }: EventViewServerProps) {
  const i18n = await getI18n({ locale });

  try {
    const client = await getServerClient();
    const { data } = await client.query<GetPublicEventsQuery, GetPublicEventsQueryVariables>({
      query: GET_PUBLIC_EVENTS,
      variables: {
        limit: 1,
        offset: 0,
        where: { slug: { _eq: slug } },
      },
    });

    return <EventView initialEvent={data?.events[0] ?? null} slug={slug} />;
  } catch (error) {
    console.error("Error fetching event data:", error);

    return <Alert variant="warning">{i18n("Event is not available at the moment. Please try again later.")}</Alert>;
  }
}
