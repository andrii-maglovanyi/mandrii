"use client";

import { Calendar, MapPin } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";

import { AnimatedEllipsis, EmptyState, ImageCarousel, RichText, TabPane, Tabs } from "~/components/ui";
import { useVenues } from "~/hooks/useVenues";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { Locale } from "~/types";

import { CardHeader } from "../VenueCard/Components/CardHeader";
import { CardMetadata } from "../VenueCard/Components/CardMetadata";

interface VenueViewProps {
  slug: string;
}

export const VenueView = ({ slug }: VenueViewProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const { useGetVenue } = useVenues();

  const { data: venues, loading } = useGetVenue(slug);
  const venue = venues?.[0];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <AnimatedEllipsis size="lg" />
      </div>
    );
  }

  if (!venue) {
    return (
      <EmptyState
        body={i18n("The venue you're looking for doesn't exist or has been removed")}
        heading={i18n("Venue not found")}
        icon={<MapPin size={50} />}
      />
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
      {/* Hero Section - Edge to Edge Image Carousel */}
      <div className={`relative w-full pb-2 md:pb-4`}>
        {images.length > 0 ? (
          <div className={`relative aspect-video w-full md:aspect-21/9`}>
            <ImageCarousel images={images} showDots />
            {/* Gradient Overlay */}
            <div
              className={`pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent`}
            />
          </div>
        ) : (
          <div
            className={`from-primary/20 via-primary/10 to-secondary/20 relative aspect-video w-full bg-linear-to-br md:aspect-21/9`}
          />
        )}

        {/* Venue Name Overlay on Image */}
        <div className={`pointer-events-none absolute right-0 bottom-20 left-0 p-8 md:bottom-28`}>
          <div className="mx-auto max-w-7xl">
            <div className="min-w-0">
              <h1
                className={`mb-3 text-3xl leading-tight font-black tracking-tight text-white drop-shadow-2xl md:text-5xl lg:text-6xl`}
              >
                {venue.name}
              </h1>
              {venue.address && (
                <div className={`flex items-start gap-2 text-white/95 drop-shadow-lg`}>
                  <MapPin className="mt-1 shrink-0" size={20} />
                  <span className={`text-base font-medium md:text-lg`}>{venue.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logo Overlapping Image and Content */}
        {logoUrl && (
          <div className="absolute right-0 bottom-0 left-0 px-8">
            <div className="mx-auto max-w-7xl">
              <div
                className={`relative h-24 w-24 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-2xl md:h-32 md:w-32`}
              >
                <Image alt={`${venue.name} logo`} className="object-cover" fill src={logoUrl} />
              </div>
            </div>
          </div>
        )}

        {/* Share Button - Below Carousel */}
        <div className="mx-auto mt-2 w-full max-w-5xl pr-4 pl-24">
          <CardHeader hideUntilHover={false} venue={venue} />
        </div>
      </div>

      {/* Main Content */}
      <div className={`mx-auto w-full max-w-5xl px-4 py-2 lg:py-4`}>
        {/* Tabs for About and Events */}
        <Tabs defaultActiveKey="about">
          <TabPane tab={i18n("About")}>
            <div className={`grid grid-cols-1 gap-4 lg:grid-cols-3`}>
              {/* Description - Left side (2/3) */}
              <div className="lg:col-span-2">
                {description ? (
                  <div className={`prose dark:prose-invert max-w-none`}>
                    <RichText>{description}</RichText>
                  </div>
                ) : (
                  <div
                    className={`flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16 dark:border-gray-700`}
                  >
                    <p className="text-neutral/60">{i18n("No description available")}</p>
                  </div>
                )}
              </div>

              {/* Info Cards - Right side (1/3) */}
              <div className="flex flex-col">
                <section
                  className={`group/card border-primary/0 bg-surface-tint/50 hover:border-primary/20 rounded-xl border p-4 transition-all duration-300 hover:shadow-lg lg:text-base`}
                >
                  <CardMetadata variant="list" venue={venue} />
                </section>
              </div>
            </div>
          </TabPane>

          <TabPane tab={i18n("Events")}>
            <EmptyState
              body={i18n("Check back later for updates!")}
              className="mt-20"
              heading={i18n("No upcoming events at this time")}
              icon={<Calendar size={50} />}
            />
            {/* TODO: Wire up real events when available */}
            {/* <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 dark:border-gray-700">
              <div className="from-primary/10 to-secondary/10 mb-6 rounded-full bg-linear-to-br p-8 shadow-inner">
                <Calendar className="text-neutral/40" size={56} />
              </div>
              <p className="text-neutral mb-3 text-xl font-bold">{i18n("No upcoming events at this time")}</p>
              <p className="text-neutral/60 text-sm">{i18n("Check back later for updates!")}</p>
            </div> */}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};
