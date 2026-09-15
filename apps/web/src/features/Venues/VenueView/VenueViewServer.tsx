import { cache } from "react";

import { JsonLd } from "~/components/seo/JsonLd";
import { Alert } from "~/components/ui";
import { getEventsFilter } from "~/features/Events/utils/getEventsFilter";
import { GET_PUBLIC_EVENTS } from "~/graphql/events";
import { GET_VENUE_BY_SLUG } from "~/graphql/venues";
import { getI18n } from "~/i18n/getI18n";
import { getServerClient } from "~/lib/apollo/server-client";
import { auth } from "~/lib/auth";
import { getDiscoverableEventsWhere, getDiscoverableVenuesWhere } from "~/lib/content-visibility";
import { isEventScheduleFinished, sortEventsByNextOccurrence } from "~/lib/events/recurrence";
import { getPublicMediaUrl } from "~/lib/media";
import { buildPublicPageUrl, buildVenueStructuredData } from "~/lib/seo";
import { getVenueMessagingState } from "~/lib/venues/messaging";
import { getVenueData } from "~/lib/venues/presentation";
import {
  GetPublicEventsQuery,
  GetPublicEventsQueryVariables,
  GetVenueViewBySlugQuery,
  GetVenueViewBySlugQueryVariables,
  Order_By,
  Scalars,
  Venue_Status_Enum,
} from "~/types/graphql.generated";

import { VenueView } from "./VenueView";

interface VenueViewServerProps {
  locale: string;
  slug: string;
}

/**
 * Shared per-request loader for the venue page and its metadata. React's cache
 * prevents the metadata pass from issuing a second identical query.
 */
export const getVenueViewBySlug = cache(async (slug: string) => {
  const client = await getServerClient();
  const { data } = await client.query<GetVenueViewBySlugQuery, GetVenueViewBySlugQueryVariables>({
    query: GET_VENUE_BY_SLUG,
    variables: {
      where: getDiscoverableVenuesWhere({
        slug: { _eq: slug },
      }),
      whereEvents: getDiscoverableEventsWhere(getEventsFilter({}).variables.where),
    },
  });

  return data?.venues?.[0] ? getVenueData(data.venues[0]) : null;
});

export async function VenueViewServer({ locale, slug }: VenueViewServerProps) {
  const i18n = await getI18n({ locale });
  let data: Awaited<ReturnType<typeof loadVenueView>>;
  try {
    data = await loadVenueView({ locale, slug });
  } catch (error) {
    console.error("Error fetching venue data:", error);
    return <Alert variant="warning">{i18n("Venue is not available at the moment. Please try again later.")}</Alert>;
  }

  if (!data) return <VenueView initialEvents={[]} initialVenue={null} slug={slug} />;
  const {
    events,
    initialMessagingRole,
    initialTelegramLinked,
    initialTelegramReviewNotificationsEnabled,
    structuredData,
    venue,
  } = data;
  return (
    <>
      {venue.status === Venue_Status_Enum.Active && <JsonLd data={structuredData} />}
      <VenueView
        initialEvents={events}
        initialMessagingRole={initialMessagingRole}
        initialTelegramLinked={initialTelegramLinked}
        initialTelegramReviewNotificationsEnabled={initialTelegramReviewNotificationsEnabled}
        initialVenue={venue}
        slug={slug}
      />
    </>
  );
}

async function loadVenueView({ locale, slug }: VenueViewServerProps) {
  const venue = await getVenueViewBySlug(slug);

  if (!venue) {
    return null;
  }

  // Fetch events for the venue
  const client = await getServerClient();
  const { data: eventsData } = await client.query<GetPublicEventsQuery, GetPublicEventsQueryVariables>({
    query: GET_PUBLIC_EVENTS,
    variables: {
      limit: undefined,
      offset: 0,
      order_by: [{ start_date: Order_By.Asc }],
      totalWhere: getDiscoverableEventsWhere(),
      where: getDiscoverableEventsWhere({
        _or: [
          { is_recurring: { _eq: true } },
          { end_date: { _gte: new Date().toISOString() as Scalars["timestamptz"]["input"] } },
          { start_date: { _gte: new Date().toISOString() as Scalars["timestamptz"]["input"] } },
        ],
        venue_id: { _eq: venue.id },
      }),
    },
  });

  const events = sortEventsByNextOccurrence(
    (eventsData?.events ?? []).filter((event) => !isEventScheduleFinished(event)),
  );

  const session = await auth();
  const { initialMessagingRole, initialTelegramLinked, initialTelegramReviewNotificationsEnabled } =
    await getVenueMessagingState(venue.id, session?.user?.id);

  const description = (locale === "uk" ? venue.description_uk : venue.description_en) || venue.name;
  const structuredData = buildVenueStructuredData({
    address: venue.address,
    city: venue.city,
    country: venue.country,
    description,
    image: getPublicMediaUrl(venue.logo ?? venue.images?.[0]),
    name: venue.name,
    url: buildPublicPageUrl(locale, `/venues/${slug}`),
    website: venue.website,
  });

  return {
    events,
    initialMessagingRole,
    initialTelegramLinked,
    initialTelegramReviewNotificationsEnabled,
    structuredData,
    venue,
  };
}
