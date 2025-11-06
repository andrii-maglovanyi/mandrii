"use client";

import clsx from "clsx";
import { BookMarked, Calendar, MapPin } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { AnimatedEllipsis, Button, EmptyState, ImageCarousel, RichText, TabPane, Tabs } from "~/components/ui";
import { VenueStatus } from "~/features/UserDirectory/Venues/VenueStatus";
import { useEvents } from "~/hooks/useEvents";
import { useVenues } from "~/hooks/useVenues";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { Locale, Venue_Status_Enum } from "~/types";

import { EventsListCard } from "../../Events/EventCard/EventsListCard";
import { CardHeader } from "../VenueCard/Components/CardHeader";
import { CardMetadata } from "../VenueCard/Components/CardMetadata";
import { ChainMetadata } from "../VenueCard/Components/ChainMetadata";

interface VenueViewProps {
  slug: string;
}

export const VenueView = ({ slug }: VenueViewProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const { useGetVenue } = useVenues();
  const { usePublicEvents } = useEvents();
  const router = useRouter();

  const { data: venue, loading } = useGetVenue(slug);

  // Memoize current date to prevent recalculation on every render
  const now = useMemo(() => new Date(), []);

  // Memoize events query params to prevent infinite loop
  const eventsQueryParams = useMemo(
    () => ({
      limit: 100,
      order_by: [{ start_date: "asc" as const }],
      where: {
        status: { _eq: "ACTIVE" as const },
        venue_id: { _eq: venue?.id },
      },
    }),
    [venue?.id],
  );

  // Fetch events for this venue
  const { data: allVenueEvents, loading: eventsLoading } = usePublicEvents(eventsQueryParams);

  // Separate ongoing and upcoming events, filter out past events
  const { ongoingEvents, upcomingEvents } = useMemo(() => {
    if (!allVenueEvents) return { ongoingEvents: [], upcomingEvents: [] };

    const ongoing: typeof allVenueEvents = [];
    const upcoming: typeof allVenueEvents = [];

    for (const event of allVenueEvents) {
      const startDate = new Date(event.start_date as string);
      const endDate = event.end_date ? new Date(event.end_date as string) : null;

      // Skip events that have already ended
      if (endDate && endDate < now) continue;
      // Also skip events without end_date that have already started and passed
      if (!endDate && startDate < now) continue;

      // Event is ongoing if it has started but hasn't ended
      if (startDate <= now && (!endDate || endDate >= now)) {
        ongoing.push(event);
      } else if (startDate > now) {
        upcoming.push(event);
      }
    }

    return { ongoingEvents: ongoing, upcomingEvents: upcoming };
  }, [allVenueEvents, now]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <AnimatedEllipsis size="lg" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          body={i18n("The venue you're looking for doesn't exist or has been removed")}
          heading={i18n("Venue not found")}
          icon={<MapPin size={50} />}
        />
      </div>
    );
  }

  const description = (locale === "uk" ? venue.description_uk : venue.description_en) || "";
  const normalizeUrl = (path?: null | string) => {
    if (!path) return undefined;
    return path.startsWith("http") ? path : `${constants.vercelBlobStorageUrl}/${path}`;
  };

  const images = (venue.images || []).filter(Boolean).map((img) => normalizeUrl(img)!) as string[];
  const logoUrl = normalizeUrl(venue.logo ?? undefined);

  return (
    <div className="flex flex-col">
      {/* Hero section. Edge to edge image carousel */}
      <div className={`
        relative w-full pb-2
        md:pb-4
      `}>
        <div className="relative mx-auto max-w-5xl">
          {/* Pending status badge for no-image state */}
          {venue.status === Venue_Status_Enum.Pending && (
            <div className="absolute top-4 right-4 z-10 max-w-5xl">
              <VenueStatus expanded status={venue.status} />
            </div>
          )}
        </div>
        {images.length ? (
          <div className={`
            relative aspect-video w-full
            md:aspect-21/9
          `}>
            <ImageCarousel images={images} showDots />
            {/* Gradient overlay */}
            <div
              className={`
                pointer-events-none absolute inset-0 bg-linear-to-t
                from-neutral-900 via-neutral-900/30 to-transparent
              `}
            />
          </div>
        ) : (
          <div
            className={`
              relative aspect-video w-full bg-linear-to-br from-primary/30
              via-primary/15 to-secondary/30
              md:aspect-21/9
            `}
          />
        )}

        {/* Venue name overlay on image */}
        <div className={`
          absolute right-0 bottom-20 left-0 px-4 pb-8
          md:bottom-28 md:px-8
        `}>
          <div className="mx-auto max-w-5xl">
            <div className="min-w-0">
              <h1
                className={clsx(
                  images.length ? "text-neutral-0" : "text-on-surface",
                  `
                    mb-3 text-3xl leading-tight font-black tracking-tight
                    drop-shadow-2xl
                    md:text-5xl
                    lg:text-6xl
                  `,
                )}
              >
                {venue.name}
              </h1>

              {venue.address && (
                <div
                  className={clsx(
                    images.length ? "text-neutral-0/80" : "text-on-surface/80",
                    `flex items-center gap-4`,
                  )}
                >
                  {venue.geo ? <MapPin /> : <BookMarked />}
                  <span className={`
                    text-base font-medium
                    md:text-lg
                  `}>{venue.address}</span>{" "}
                  {venue.geo ? (
                    <Button
                      color="primary"
                      onClick={() => router.push(`/map/${venue.slug}`)}
                      size="sm"
                      variant="filled"
                    >
                      {i18n("Map")}
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logo overlapping image and content */}
        {logoUrl && (
          <div className={`
            absolute right-0 bottom-0 left-0 px-4
            md:px-8
          `}>
            <div className="mx-auto max-w-5xl">
              <div
                className={`
                  relative h-24 w-24 overflow-hidden rounded-3xl border-4
                  border-surface bg-surface shadow-2xl
                  md:h-32 md:w-32
                `}
              >
                <Image alt={`${venue.name} logo`} className="object-cover" fill src={logoUrl} />
              </div>
            </div>
          </div>
        )}

        <div className={clsx(logoUrl && `
          pl-32
          md:pl-44
          lg:pl-40
          xl:pl-36
        `, `mx-auto mt-2 w-full max-w-5xl px-4`)}>
          <CardHeader hideUntilHover={false} venue={venue} />
        </div>
      </div>

      {/* Main content */}
      <div className={`
        mx-auto w-full max-w-5xl px-4 py-2
        lg:py-4
      `}>
        <Tabs defaultActiveKey="about">
          <TabPane tab={i18n("Events")}>
            {eventsLoading ? (
              <div className="py-20">
                <AnimatedEllipsis centered size="md" />
              </div>
            ) : ongoingEvents.length > 0 || upcomingEvents.length > 0 ? (
              <div className="space-y-6">
                {/* Ongoing events */}
                {ongoingEvents.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{i18n("Happening now")}</h3>
                      <span className={`
                        rounded-full bg-primary/20 px-3 py-1 text-xs font-medium
                        text-primary
                      `}>
                        {i18n("{count} ongoing", { count: ongoingEvents.length })}
                      </span>
                    </div>
                    <div className={`
                      grid grid-cols-1 gap-4
                      sm:grid-cols-2
                      lg:grid-cols-3
                    `}>
                      {ongoingEvents.map((event) => (
                        <div className="relative" key={event.id as string}>
                          <div
                            className={`
                              absolute -top-2 -right-2 z-10 rounded-full
                              border-2 border-primary/30 bg-primary/10 px-3 py-1
                            `}
                          >
                            <span className="text-xs font-bold text-primary">{i18n("LIVE")}</span>
                          </div>
                          <EventsListCard event={event} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {upcomingEvents.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{i18n("Upcoming events")}</h3>
                      <span className={`
                        rounded-full bg-surface-tint px-3 py-1 text-xs
                        font-medium text-neutral
                      `}>
                        {i18n("{count} upcoming", { count: upcomingEvents.length })}
                      </span>
                    </div>
                    <div className={`
                      grid grid-cols-1 gap-4
                      sm:grid-cols-2
                      lg:grid-cols-3
                    `}>
                      {upcomingEvents.map((event) => (
                        <EventsListCard event={event} key={event.id as string} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                body={i18n("Check back later for updates!")}
                className="mt-20"
                heading={i18n("No upcoming events at this time")}
                icon={<Calendar size={50} />}
              />
            )}
          </TabPane>

          <TabPane tab={i18n("About venue")}>
            <div className={`
              grid grid-cols-1 gap-4
              lg:grid-cols-3
            `}>
              {/* Description. Left side (2/3) */}
              <div className="lg:col-span-2">
                {description ? (
                  <RichText className={`
                    prose max-w-none
                    dark:prose-invert
                  `}>{description}</RichText>
                ) : (
                  <div
                    className={`
                      flex items-center justify-center rounded-2xl border-2
                      border-dashed border-gray-200 py-16
                      dark:border-gray-700
                    `}
                  >
                    <p className="text-neutral/60">{i18n("No description available")}</p>
                  </div>
                )}
              </div>

              {/* Info cards. Right side (1/3) */}
              <div className="flex flex-col gap-4">
                <section
                  className={`
                    group/card rounded-xl border border-primary/0
                    bg-surface-tint/50 p-4 transition-all duration-300
                    hover:border-primary/20 hover:shadow-lg
                    lg:text-base
                  `}
                >
                  <CardMetadata expanded variant="list" venue={venue} />
                </section>
                {venue.chain && (
                  <section
                    className={`
                      group/card rounded-xl border border-primary/0
                      bg-surface-tint/50 p-4 transition-all duration-300
                      hover:border-primary/20 hover:shadow-lg
                      lg:text-base
                    `}
                  >
                    <ChainMetadata venue={venue} />
                  </section>
                )}
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};
