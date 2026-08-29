"use client";

import { ArrowRight, CalendarDays, Plus } from "lucide-react";
import { useLocale } from "next-intl";
import { useMemo } from "react";

import { AnimatedEllipsis, Button } from "~/components/ui";
import { EventsMasonryCard } from "~/features/Events/EventCard/EventsMasonryCard";
import { getEventDatePreset } from "~/features/Events/utils/getEventDatePreset";
import { getEventsFilter } from "~/features/Events/utils/getEventsFilter";
import { useAddEntity } from "~/features/shared/AddEntityButton";
import { useEvents } from "~/hooks/useEvents";
import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { Locale } from "~/types";

import { appendDiscoveryLocationToUrl } from "./discoveryLocation";
import { useDiscoveryLocation } from "./useDiscoveryLocation";

const EVENTS_LIMIT = 3;

export function ThisWeekendNearYou() {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const { isReady: isLocationReady, location } = useDiscoveryLocation();
  const { usePublicEvents } = useEvents();
  const { handleAdd: handleAddEvent } = useAddEntity({
    mixpanelEvent: "Clicked Add Event",
    mixpanelSource: "this_weekend_empty_state",
    route: "/user-directory/events",
  });

  const country = location.countryCode ? constants.whitelisted_countries[location.countryCode].label.en : undefined;
  const locationLabel =
    location.city || (location.countryCode ? constants.whitelisted_countries[location.countryCode].label[locale] : "");
  const weekend = useMemo(() => getEventDatePreset("weekend"), []);
  const queryParams = useMemo(() => {
    const { variables } = getEventsFilter({
      city: location.city || undefined,
      country,
      dateFrom: weekend?.dateFrom,
      dateTo: weekend?.dateTo,
    });

    return {
      ...variables,
      limit: EVENTS_LIMIT,
    };
  }, [country, location.city, weekend?.dateFrom, weekend?.dateTo]);
  const { data: events, loading } = usePublicEvents(queryParams, { skip: !isLocationReady });

  const allEventsHref = useMemo(() => appendDiscoveryLocationToUrl("/events?when=weekend", location), [location]);

  const title = locationLabel
    ? i18n("This weekend in {location}", { location: locationLabel })
    : i18n("This weekend in the community");
  const emptyLocationLabel = locationLabel || i18n("your area");

  return (
    <section className="my-12" aria-labelledby="this-weekend-heading">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <div>
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">{i18n("Plan your weekend")}</p>
          <h2 className="mt-1 text-2xl font-bold md:text-3xl" id="this-weekend-heading">
            {title}
          </h2>
          <p className="text-on-surface/70 mt-2">
            {locationLabel
              ? i18n("A few Ukrainian community events chosen for your location.")
              : i18n("Choose a location above to make these suggestions more personal.")}
          </p>
        </div>
        <Link
          className="text-primary inline-flex min-h-11 items-center gap-2 self-start py-2 font-semibold no-underline hover:underline sm:self-auto"
          href={allEventsHref}
        >
          {i18n("View all events")}
          <ArrowRight aria-hidden size={17} />
        </Link>
      </div>

      {!isLocationReady || loading ? (
        <div className="flex min-h-48 items-center justify-center" data-testid="this-weekend-loading">
          <AnimatedEllipsis size="md" />
        </div>
      ) : events.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {events.map((event) => (
            <EventsMasonryCard
              event={event}
              hasImage={Boolean(event.images?.length)}
              key={event.id}
              layoutSize="third"
            />
          ))}
        </div>
      ) : (
        <div className="border-on-surface/10 bg-surface-tint/50 rounded-2xl border px-4 py-8 text-center sm:px-6 md:py-10">
          <div className="bg-primary/10 text-primary mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <CalendarDays size={30} />
          </div>
          <h3 className="mt-5 text-xl font-bold">{i18n("No events this weekend")}</h3>
          <p className="text-on-surface/70 mx-auto mt-2 max-w-xl">
            {i18n("Know about something happening in {location}? Add it so others can find it.", {
              location: emptyLocationLabel,
            })}
          </p>
          <Button className="mt-6 w-full gap-2 sm:w-auto" color="primary" onClick={handleAddEvent}>
            <Plus size={17} />
            {i18n("Add an event")}
          </Button>
        </div>
      )}
    </section>
  );
}
