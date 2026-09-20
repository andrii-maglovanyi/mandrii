import { cache } from "react";

import { JsonLd } from "~/components/seo/JsonLd";
import { Alert } from "~/components/ui";
import { getI18n } from "~/i18n/getI18n";
import { getDiscoverableEventsWhere, getPubliclyViewableEventsWhere } from "~/lib/content-visibility";
import { getNextOccurrenceStart, getOccurrenceEnd } from "~/lib/events/recurrence";
import { getEffectiveEventStatus } from "~/lib/events/status";
import { getPublicMediaUrl } from "~/lib/media";
import { getCachedPublicQuery } from "~/lib/public-cache/query";
import { buildEventStructuredData, buildPublicPageUrl } from "~/lib/seo";
import { Event_Status_Enum, GetPublicEventsQuery } from "~/types/graphql.generated";

import { EventView } from "./EventView";

type EventViewServerProps = {
  locale: string;
  slug: string;
};

/** Shared per-request loader for the event page and its metadata. */
export const getEventViewBySlug = cache(async (slug: string) => {
  const { data } = await getCachedPublicQuery<GetPublicEventsQuery>("GetPublicEvents", {
    limit: 1,
    offset: 0,
    totalWhere: getDiscoverableEventsWhere(),
    where: getPubliclyViewableEventsWhere({ slug: { _eq: slug } }),
  });

  return data?.events[0] ?? null;
});

export async function EventViewServer({ locale, slug }: EventViewServerProps) {
  const i18n = await getI18n({ locale });

  try {
    const event = await getEventViewBySlug(slug);

    if (!event) return <EventView initialEvent={null} slug={slug} />;

    const effectiveStatus = getEffectiveEventStatus(event);
    const nextOccurrenceStart = getNextOccurrenceStart(event);
    const title = locale === "uk" ? event.title_uk : event.title_en;
    const description = (locale === "uk" ? event.description_uk : event.description_en) || title;
    const structuredData = buildEventStructuredData({
      country: event.country,
      description,
      endDate: nextOccurrenceStart ? getOccurrenceEnd(nextOccurrenceStart, event).toISOString() : event.end_date,
      image: getPublicMediaUrl(event.images?.[0]),
      isOnline: event.is_online,
      locationAddress: event.custom_location_address,
      locationName: event.custom_location_name ?? event.venue?.name,
      onlineUrl: event.external_url ?? event.registration_url,
      organizerName: event.organizer_name,
      startDate: nextOccurrenceStart?.toISOString() ?? event.start_date,
      title,
      url: buildPublicPageUrl(locale, `/events/${slug}`),
    });

    return (
      <>
        {effectiveStatus === Event_Status_Enum.Active && <JsonLd data={structuredData} />}
        <EventView initialEvent={event} slug={slug} />
      </>
    );
  } catch (error) {
    console.error("Error fetching event data:", error);

    return <Alert variant="warning">{i18n("Event is not available at the moment. Please try again later.")}</Alert>;
  }
}
