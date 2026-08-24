"use client";

import clsx from "clsx";
import { BookMarked, MapPin } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import {
  AnimatedEllipsis,
  Button,
  EmptyState,
  ImageCarousel,
  RichText,
  SectionCard,
  TabPane,
  Tabs,
} from "~/components/ui";
import { EventsMasonryCard } from "~/features/Events/EventCard/EventsMasonryCard";
import { VenueMessaging } from "~/features/Messaging/VenueMessaging";
import { VenueStatus } from "~/features/UserDirectory/Venues/VenueStatus";
import { useEvents } from "~/hooks/useEvents";
import { useVenues } from "~/hooks/useVenues";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import {
  FilterParams,
  GetPublicEventsQuery,
  GetPublicVenuesQuery,
  Locale,
  SortDirections,
  Venue_Category_Enum,
  Venue_Status_Enum,
} from "~/types";

import { CardHeader } from "../VenueCard/Components/CardHeader";
import { CardMetadata } from "../VenueCard/Components/CardMetadata";
import { ChainMetadata } from "../VenueCard/Components/ChainMetadata";
import {
  AccommodationMetadataDisplay,
  BeautyMetadataDisplay,
  OpeningHoursDisplay,
  RestaurantMetadataDisplay,
  SchoolMetadataDisplay,
  ShopMetadataDisplay,
} from "./MetadataDisplay";

interface VenueViewProps {
  initialEvents?: GetPublicEventsQuery["events"] | null;
  initialMessagingRole?: "OWNER" | "USER" | null;
  initialTelegramLinked?: boolean | null;
  initialVenue?: GetPublicVenuesQuery["venues"][number] | null;
  slug: string;
}

export const VenueView = ({
  initialEvents = null,
  initialMessagingRole = null,
  initialTelegramLinked = null,
  initialVenue = undefined,
  slug,
}: VenueViewProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const { useGetVenue } = useVenues();
  const { usePublicEvents } = useEvents();
  const router = useRouter();

  // Use initial data if provided (from server), otherwise fetch client-side
  const shouldFetchClientSide = initialVenue === undefined;
  const { data: clientVenue, loading } = useGetVenue(shouldFetchClientSide ? slug : undefined);
  const venue = shouldFetchClientSide ? clientVenue : initialVenue;

  const eventsQueryParams = useMemo(
    () => ({
      limit: 100,
      order_by: [{ start_date: "asc" as SortDirections }],
      where: {
        _or: [{ end_date: { _gte: new Date().toISOString() } }, { start_date: { _gte: new Date().toISOString() } }],
        venue_id: { _eq: venue?.id },
      } as FilterParams,
    }),
    [venue?.id],
  );

  const { data: clientEvents } = usePublicEvents(shouldFetchClientSide && venue?.id ? eventsQueryParams : {});
  const upcomingEvents = shouldFetchClientSide ? clientEvents : initialEvents || [];

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

  const isArchived = venue.status === Venue_Status_Enum.Archived;
  const showStatus = venue.status !== Venue_Status_Enum.Active;
  return (
    <div className="flex flex-col">
      {/* Hero section. Edge to edge image carousel */}
      <div className={`relative w-full pb-2 md:pb-4`}>
        {showStatus && (
          <div className="absolute top-4 right-4 z-10">
            <VenueStatus expanded status={venue.status} />
          </div>
        )}
        {images.length ? (
          <div className={`relative aspect-video w-full md:aspect-21/9`}>
            <ImageCarousel autoPlay images={images} showDots />
            {/* Gradient overlay */}
            <div
              className={`pointer-events-none absolute inset-0 bg-linear-to-t from-neutral-900 via-neutral-900/30 to-transparent`}
            />
          </div>
        ) : (
          <div
            className={`from-primary/30 via-primary/15 to-secondary/30 relative aspect-video w-full bg-linear-to-br md:aspect-21/9`}
          />
        )}

        {/* Venue name overlay on image */}
        <div className={`absolute right-0 bottom-20 left-0 px-4 pb-8 md:bottom-28 md:px-8`}>
          <div className="mx-auto max-w-5xl">
            <div className="min-w-0">
              <h1
                className={clsx(
                  isArchived && "line-through",
                  images.length ? "text-neutral-0" : "text-on-surface",
                  `mb-3 text-3xl leading-tight font-black tracking-tight drop-shadow-2xl md:text-5xl lg:text-6xl`,
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
                  <span className={`text-base font-medium md:text-lg`}>{venue.address}</span>{" "}
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

        <div className="mx-auto mt-2 w-full max-w-5xl px-4">
          <CardHeader hideUntilHover={false} venue={venue} />
        </div>
      </div>

      <div className={`mx-auto w-full max-w-5xl px-4 py-2 lg:py-4`}>
        <Tabs defaultActiveKey="about">
          <TabPane tab={i18n("About")}>
            <div className={`grid grid-cols-1 gap-8 lg:grid-cols-3`}>
              {/* Description. Left side (2/3) */}
              <div className={`space-y-8 lg:col-span-2`}>
                {description ? (
                  <RichText className={`prose dark:prose-invert max-w-none text-base`}>{description}</RichText>
                ) : (
                  <div
                    className={`flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16 dark:border-gray-700`}
                  >
                    <p className="text-neutral/60">{i18n("No description available")}</p>
                  </div>
                )}

                {venue.category === Venue_Category_Enum.Accommodation && (
                  <AccommodationMetadataDisplay accommodationDetails={venue.venue_accommodation_details[0]} />
                )}
                {venue.category === Venue_Category_Enum.BeautySalon && (
                  <BeautyMetadataDisplay beautySalonDetails={venue.venue_beauty_salon_details[0]} />
                )}
                {venue.category === Venue_Category_Enum.Restaurant && (
                  <RestaurantMetadataDisplay restaurantDetails={venue.venue_restaurant_details[0]} />
                )}
                {venue.category === Venue_Category_Enum.School && (
                  <SchoolMetadataDisplay schoolDetails={venue.venue_school_details[0]} />
                )}
                {venue.category === Venue_Category_Enum.Shop && (
                  <ShopMetadataDisplay shopDetails={venue.venue_shop_details[0]} />
                )}
              </div>

              {/* Info cards. Right side (1/3) */}
              <div className="flex flex-col gap-4">
                <SectionCard title={i18n("Details")}>
                  <CardMetadata expanded variant="list" venue={venue} />
                </SectionCard>
                {venue.venue_schedules?.length ? (
                  <SectionCard>
                    <OpeningHoursDisplay schedules={venue.venue_schedules} isArchived={isArchived} />{" "}
                  </SectionCard>
                ) : null}
                {venue.chain && (
                  <SectionCard>
                    <ChainMetadata venue={venue} />
                  </SectionCard>
                )}
              </div>
            </div>
          </TabPane>

          {upcomingEvents.length > 0 && !isArchived && (
            <TabPane tab={i18n("Events")}>
              <div className="space-y-6">
                {upcomingEvents.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-end">
                      <span className={`bg-surface-tint text-neutral rounded-full px-3 py-1 text-xs font-medium`}>
                        {i18n("{count} events", { count: upcomingEvents.length })}
                      </span>
                    </div>

                    {upcomingEvents.map((event) => (
                      <EventsMasonryCard
                        event={event}
                        hasImage={Boolean(event.images?.length)}
                        key={event.id as string}
                        layoutSize="full"
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabPane>
          )}

          {initialMessagingRole !== null && (
            <TabPane tab={i18n("Chat")}>
              <VenueMessaging
                hasOwner={Boolean(venue.owner_id)}
                initialRole={initialMessagingRole}
                initialTelegramLinked={initialTelegramLinked}
                venueId={venue.id}
                venueName={venue.name}
              />
            </TabPane>
          )}
        </Tabs>
      </div>
    </div>
  );
};
