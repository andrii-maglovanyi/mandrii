"use client";

import { AtSign, Calendar, Clock, Globe, ImageIcon, MapPin, Phone, Share2 } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useState } from "react";

import { AnimatedEllipsis, Button, EmptyState } from "~/components/ui";
import { useNotifications } from "~/hooks/useNotifications";
import { useVenues } from "~/hooks/useVenues";
import { useI18n } from "~/i18n/useI18n";
import { Locale } from "~/types";

interface VenueDetailProps {
  slug: string;
}

export const VenueDetail = ({ slug }: VenueDetailProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const { useGetVenue } = useVenues();
  const { showSuccess } = useNotifications();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
  const images = venue.images || [];
  const selectedImage = images[selectedImageIndex];

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className={`flex flex-col gap-4 md:flex-row md:items-start md:justify-between`}>
        <div className="flex-1">
          <h1
            className={`from-primary to-secondary mb-2 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent md:text-4xl`}
          >
            {venue.name}
          </h1>
          {venue.address && (
            <div className="text-neutral mb-4 flex items-start gap-2">
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
          {/* Main Image */}
          <div className={`bg-neutral/5 relative aspect-video w-full overflow-hidden rounded-2xl`}>
            {selectedImage ? (
              <Image
                alt={`${venue.name} - Image ${selectedImageIndex + 1}`}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
                src={selectedImage}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageIcon className="text-neutral opacity-30" size={64} />
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  className={`relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                    index === selectedImageIndex ? "ring-primary ring-2 ring-offset-2" : `opacity-60 hover:opacity-100`
                  } `}
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  type="button"
                >
                  <Image alt={`${venue.name} thumbnail ${index + 1}`} className={`object-cover`} fill src={image} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Grid */}
      <div className={`grid grid-cols-1 gap-8 lg:grid-cols-3`}>
        {/* Main Content */}
        <div className={`flex flex-col gap-6 lg:col-span-2`}>
          {/* Description */}
          {description && (
            <section className={`border-primary/10 bg-surface-tint rounded-xl border p-6`}>
              <h2 className="mb-4 text-2xl font-bold">{i18n("About")}</h2>
              <div className={`prose prose-neutral dark:prose-invert max-w-none`}>
                <p className="text-neutral whitespace-pre-wrap">{description}</p>
              </div>
            </section>
          )}

          {/* Events Section (Placeholder) */}
          <section className={`border-primary/10 bg-surface-tint rounded-xl border p-6`}>
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
              <Calendar size={24} />
              {i18n("Upcoming Events")}
            </h2>
            <div className="text-neutral text-center">
              <p>{i18n("No upcoming events at this time")}</p>
              <p className="mt-2 text-sm">{i18n("Check back later for updates!")}</p>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Contact Information */}
          <section className={`border-primary/10 bg-surface-tint rounded-xl border p-6`}>
            <h2 className="mb-4 text-xl font-bold">{i18n("Contact Information")}</h2>
            <div className="flex flex-col gap-3">
              {venue.website && (
                <a
                  className={`hover:bg-primary/5 flex items-center gap-3 rounded-lg p-3 transition-colors`}
                  href={venue.website}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Globe className="text-primary flex-shrink-0" size={20} />
                  <span className="truncate text-sm">{venue.website}</span>
                </a>
              )}

              {venue.emails && venue.emails.length > 0 && (
                <div className="flex items-start gap-3 rounded-lg p-3">
                  <AtSign className="text-primary mt-0.5 flex-shrink-0" size={20} />
                  <div className="flex flex-col gap-1">
                    {venue.emails.map((email, index) => (
                      <a className={`text-sm hover:underline`} href={`mailto:${email}`} key={index}>
                        {email}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {venue.phone_numbers && venue.phone_numbers.length > 0 && (
                <div className="flex items-start gap-3 rounded-lg p-3">
                  <Phone className="text-primary mt-0.5 flex-shrink-0" size={20} />
                  <div className="flex flex-col gap-1">
                    {venue.phone_numbers.map((phone, index) => (
                      <a className={`text-sm hover:underline`} href={`tel:${phone}`} key={index}>
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {!venue.website &&
                (!venue.emails || venue.emails.length === 0) &&
                (!venue.phone_numbers || venue.phone_numbers.length === 0) && (
                  <p className="text-neutral text-center text-sm">{i18n("No contact information available")}</p>
                )}
            </div>
          </section>

          {/* Quick Info */}
          <section
            className={`border-primary/10 from-primary/5 to-secondary/5 rounded-xl border bg-gradient-to-br p-6`}
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
