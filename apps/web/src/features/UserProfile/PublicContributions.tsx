"use client";

import { ArrowUpRight, MapPin, Store } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";

import { ContentStatusBadge, SectionCard, TextLink } from "~/components/ui";
import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";
import { getEffectiveEventStatus } from "~/lib/events/status";
import { getPublicMediaUrl } from "~/lib/media";
import { Event_Status_Enum, Venue_Status_Enum } from "~/types";

export type PublicEventContribution = {
  city?: null | string;
  country?: null | string;
  created_at: string;
  end_date?: null | string;
  is_online: boolean;
  is_recurring: boolean;
  images?: null | string[];
  slug: string;
  start_date: string;
  status: Event_Status_Enum;
  title_en: string;
  title_uk: string;
};

export type PublicVenueContribution = {
  city?: null | string;
  country?: null | string;
  created_at: string;
  images?: null | string[];
  logo?: null | string;
  name: string;
  slug: string;
  status?: Venue_Status_Enum;
};

type PublicContributionsProps = {
  events: PublicEventContribution[];
  showDirectoryLinks?: boolean;
  venues: PublicVenueContribution[];
};

const locationLabel = (city?: null | string, country?: null | string) => [city, country].filter(Boolean).join(", ");
export const PublicContributions = ({ events, showDirectoryLinks = false, venues }: PublicContributionsProps) => {
  const i18n = useI18n();
  const locale = useLocale();
  const dateLocale = locale === "uk" ? "uk-UA" : "en-GB";
  const formatDate = (date: string) =>
    new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));

  if (!venues.length && !events.length) return null;

  return (
    <section>
      <h2
        className={`from-primary to-secondary mb-4 bg-linear-to-r bg-clip-text text-xl font-bold text-transparent md:text-2xl`}
      >
        {i18n("Recent contributions")}
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {venues.length > 0 && (
          <SectionCard
            action={
              showDirectoryLinks ? (
                <TextLink className="shrink-0 text-xs" href="/user-directory#Venues">
                  {i18n("View my venues")}
                  <ArrowUpRight aria-hidden size={14} />
                </TextLink>
              ) : undefined
            }
            title={i18n("Last added venues")}
          >
            <div className="-mx-4 mt-4 mb-2 flex flex-col">
              {venues.map((venue) => {
                const location = locationLabel(venue.city, venue.country);
                const logoUrl = getPublicMediaUrl(venue.logo || venue.images?.[0]);
                return (
                  <Link
                    className="group/info hover:bg-on-surface/5 focus-visible:bg-on-surface/5 grid min-h-16 w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-2 transition-colors hover:no-underline"
                    href={`/venues/${venue.slug}`}
                    key={venue.slug}
                  >
                    <span className="bg-primary/10 text-primary relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full">
                      {logoUrl ? (
                        <Image alt={`${venue.name} logo`} className="object-cover" fill sizes="40px" src={logoUrl} />
                      ) : (
                        <Store size={18} />
                      )}
                    </span>
                    <span className="min-w-0 overflow-hidden">
                      <span className="block max-w-full truncate font-medium" title={venue.name}>
                        {venue.name}
                      </span>
                      <span className="text-neutral mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                        {location && (
                          <span className="flex min-w-0 items-center gap-1">
                            <MapPin size={12} />
                            <span className="truncate">{location}</span>
                          </span>
                        )}
                        &bull;
                        <time dateTime={venue.created_at}>
                          {i18n("Added")} {formatDate(venue.created_at)}
                        </time>
                      </span>
                    </span>
                    <ContentStatusBadge className="shrink-0" status={venue.status ?? Venue_Status_Enum.Active} />
                    <ArrowUpRight
                      className="text-neutral shrink-0 transition-transform group-hover/info:translate-x-0.5 group-hover/info:-translate-y-0.5"
                      size={16}
                    />
                  </Link>
                );
              })}
            </div>
          </SectionCard>
        )}

        {events.length > 0 && (
          <SectionCard
            action={
              showDirectoryLinks ? (
                <TextLink className="shrink-0 text-xs" href="/user-directory#Events">
                  {i18n("View my events")}
                  <ArrowUpRight aria-hidden size={14} />
                </TextLink>
              ) : undefined
            }
            title={i18n("Last added events")}
          >
            <div className="-mx-4 mt-4 mb-2 flex flex-col">
              {events.map((event) => {
                const title = locale === "uk" ? event.title_uk : event.title_en;
                const location = event.is_online ? i18n("Online") : locationLabel(event.city, event.country);
                const imageUrl = getPublicMediaUrl(event.images?.[0]);
                const status = getEffectiveEventStatus(event);
                return (
                  <Link
                    className={`group/info hover:bg-on-surface/5 focus-visible:bg-on-surface/5 grid min-h-16 w-full items-center gap-3 px-4 py-2 transition-colors hover:no-underline ${
                      imageUrl ? "grid-cols-[auto_minmax(0,1fr)_auto_auto]" : "grid-cols-[minmax(0,1fr)_auto_auto]"
                    }`}
                    href={`/events/${event.slug}`}
                    key={event.slug}
                  >
                    {imageUrl && (
                      <span className="bg-secondary/20 text-secondary relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full">
                        <Image alt={title} className="object-cover" fill sizes="40px" src={imageUrl} />
                      </span>
                    )}
                    <span className="min-w-0 overflow-hidden">
                      <span className="block max-w-full truncate font-medium" title={title}>
                        {title}
                      </span>
                      <span className="text-neutral mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                        {location && (
                          <>
                            <span className="truncate">{location}</span>&bull;
                          </>
                        )}
                        <time dateTime={event.start_date}>{formatDate(event.start_date)}</time>
                      </span>
                    </span>
                    <ContentStatusBadge className="shrink-0" status={status} />
                    <ArrowUpRight
                      className="text-neutral shrink-0 transition-transform group-hover/info:translate-x-0.5 group-hover/info:-translate-y-0.5"
                      size={16}
                    />
                  </Link>
                );
              })}
            </div>
          </SectionCard>
        )}
      </div>
    </section>
  );
};
