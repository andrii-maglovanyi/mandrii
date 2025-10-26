"use client";

import { AtSign, Calendar, Clock, Globe, MapPin, Phone, Share2 } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";

import { AnimatedEllipsis, Button, EmptyState, ImageCarousel } from "~/components/ui";
import { useNotifications } from "~/hooks/useNotifications";
import { useVenues } from "~/hooks/useVenues";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { Locale } from "~/types";

interface VenueDetailProps {
  slug: string;
}

export const VenueDetail = ({ slug }: VenueDetailProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const { useGetVenue } = useVenues();
  const { showSuccess } = useNotifications();

  const { data: venues, loading } = useGetVenue(slug);
  const venue = venues?.[0];

  const handleShare = () => {
    const url = `${globalThis.location.origin}/venues/${slug}`;
    navigator.clipboard.writeText(url);
    showSuccess(i18n("Venue link copied to clipboard"));
  };

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
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className={`
        flex flex-col gap-4
        md:flex-row md:items-start md:justify-between
      `}>
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            {logoUrl && (
              <div className={`
                relative h-12 w-12 overflow-hidden rounded-md border
                border-primary/10 bg-surface-tint
              `}>
                <Image alt={`${venue.name} logo`} className="object-cover" fill src={logoUrl} />
              </div>
            )}
            <h1
              className={`
                bg-gradient-to-r from-primary to-secondary bg-clip-text text-3xl
                font-bold text-transparent
                md:text-4xl
              `}
            >
              {venue.name}
            </h1>
          </div>
          {venue.address && (
            <div className="mb-4 flex items-start gap-2 text-neutral">
              <MapPin className="mt-1 flex-shrink-0" size={20} />
              <span className="text-lg">{venue.address}</span>
            </div>
          )}
        </div>

        {/* Share Button */}
        <Button className="gap-2" onClick={handleShare} variant="outlined">
          <Share2 size={18} />
          {i18n("Share")}
        </Button>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className={`
            relative aspect-video w-full overflow-hidden rounded-2xl
            bg-neutral/5
          `}>
            <ImageCarousel images={images} showDots />
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className={`
        grid grid-cols-1 gap-8
        lg:grid-cols-3
      `}>
        {/* Main Content */}
        <div className={`
          flex flex-col gap-6
          lg:col-span-2
        `}>
          {/* Description */}
          {description && (
            <section className={`
              rounded-xl border border-primary/10 bg-surface-tint p-6
            `}>
              <h2 className="mb-4 text-2xl font-bold">{i18n("About")}</h2>
              <div className={`
                prose max-w-none prose-neutral
                dark:prose-invert
              `}>
                <p className="whitespace-pre-wrap text-neutral">{description}</p>
              </div>
            </section>
          )}

          {/* Events Section (Wall) */}
          <section className={`
            rounded-xl border border-primary/10 bg-surface-tint p-6
          `}>
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
              <Calendar size={24} />
              {i18n("Upcoming Events")}
            </h2>
            {/* TODO: Wire up real events when available */}
            <div className="text-center text-neutral">
              <p>{i18n("No upcoming events at this time")}</p>
              <p className="mt-2 text-sm">{i18n("Check back later for updates!")}</p>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Contact Information */}
          <section className={`
            rounded-xl border border-primary/10 bg-surface-tint p-6
          `}>
            <h2 className="mb-4 text-xl font-bold">{i18n("Contact Information")}</h2>
            <div className="flex flex-col gap-3">
              {venue.website && (
                <a
                  className={`
                    flex items-center gap-3 rounded-lg p-3 transition-colors
                    hover:bg-primary/5
                  `}
                  href={venue.website}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Globe className="flex-shrink-0 text-primary" size={20} />
                  <span className="truncate text-sm">{venue.website}</span>
                </a>
              )}

              {venue.emails && venue.emails.length > 0 && (
                <div className="flex items-start gap-3 rounded-lg p-3">
                  <AtSign className="mt-0.5 flex-shrink-0 text-primary" size={20} />
                  <div className="flex flex-col gap-1">
                    {venue.emails.map((email, index) => (
                      <a className={`
                        text-sm
                        hover:underline
                      `} href={`mailto:${email}`} key={index}>
                        {email}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {venue.phone_numbers && venue.phone_numbers.length > 0 && (
                <div className="flex items-start gap-3 rounded-lg p-3">
                  <Phone className="mt-0.5 flex-shrink-0 text-primary" size={20} />
                  <div className="flex flex-col gap-1">
                    {venue.phone_numbers.map((phone, index) => (
                      <a className={`
                        text-sm
                        hover:underline
                      `} href={`tel:${phone}`} key={index}>
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {!venue.website &&
                (!venue.emails || venue.emails.length === 0) &&
                (!venue.phone_numbers || venue.phone_numbers.length === 0) && (
                  <p className="text-center text-sm text-neutral">{i18n("No contact information available")}</p>
                )}
            </div>
          </section>

          {/* Quick Info */}
          <section
            className={`
              rounded-xl border border-primary/10 bg-gradient-to-br
              from-primary/5 to-secondary/5 p-6
            `}
          >
            <h2 className="mb-4 text-xl font-bold">{i18n("Quick Info")}</h2>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="text-primary" size={16} />
                <span>{venue.address || i18n("Address not provided")}</span>
              </div>
              {venue.status && (
                <div className="flex items-center gap-2">
                  <Clock className="text-primary" size={16} />
                  <span className="capitalize">{venue.status.toLowerCase()}</span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
