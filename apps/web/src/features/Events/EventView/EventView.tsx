"use client";

import clsx from "clsx";
import { format, parse } from "date-fns";
import { enGB } from "date-fns/locale";
import { ArrowUpRight, Calendar, Globe, Info, MapPin, Newspaper, Pencil, Star } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import {
  AnimatedEllipsis,
  Button,
  ContentStatusBadge,
  EmptyState,
  ImageCarousel,
  RichText,
  SectionCard,
  TabPane,
  Tabs,
} from "~/components/ui";
import { useEvents } from "~/hooks/useEvents";
import { useUser } from "~/hooks/useUser";
import { ContentRating } from "~/features/Ratings/ContentRating";
import { ContentReviews } from "~/features/Ratings/ContentReviews";
import { ContentUpdates } from "~/features/ContentUpdates/ContentUpdates";
import { ContentViewOwnerActions } from "~/features/shared/ContentViewOwnerActions";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getEffectiveEventStatus } from "~/lib/events/status";
import { toDateLocale } from "~/lib/utils/locale";
import { Event_Status_Enum, Locale } from "~/types";

import { CardHeader } from "../EventCard/Components/CardHeader";
import { AdditionalInfo } from "./Components/AdditionalInfo";
import { CardMetadata } from "./Components/CardMetadata";
import { OrganizerInfo } from "./Components/OrganizerInfo";

interface EventViewProps {
  slug: string;
}

export const EventView = ({ slug }: EventViewProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const { useGetEvent } = useEvents();
  const { data: profile } = useUser();
  const router = useRouter();

  const { data: event, loading } = useGetEvent(slug);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <AnimatedEllipsis size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          body={i18n("The event you're looking for doesn't exist or has been removed")}
          heading={i18n("Event not found")}
          icon={<Calendar size={50} />}
        />
      </div>
    );
  }

  const title = locale === "uk" ? event.title_uk : event.title_en;
  const description = (locale === "uk" ? event.description_uk : event.description_en) || "";
  const normalizeUrl = (path?: null | string) => {
    if (!path) return undefined;
    return path.startsWith("http") ? path : `${constants.vercelBlobStorageUrl}/${path}`;
  };

  const images = (event.images || []).filter(Boolean).map((img: string) => normalizeUrl(img)!) as string[];

  const startDate = new Date(event.start_date);

  const formatDate = (date: Date, locale = enGB) => {
    return format(date, "EEEE, d MMMM yyyy", { locale });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRecurrenceRule = (rule: string) => {
    // Parse RRULE format and convert to human-readable text
    const parts = rule.split(";");
    const ruleObj: Record<string, string> = {};

    parts.forEach((part) => {
      const [key, value] = part.split("=");
      if (key && value) {
        ruleObj[key] = value;
      }
    });

    const freq = ruleObj.FREQ?.toLowerCase();
    const interval = ruleObj.INTERVAL ? parseInt(ruleObj.INTERVAL) : 1;
    const byday = ruleObj.BYDAY;
    const count = ruleObj.COUNT;
    const until = ruleObj.UNTIL;

    let text = "";

    // Frequency
    if (freq === "daily") {
      text = interval === 1 ? i18n("Every day") : i18n("Every {count} days", { count: interval });
    } else if (freq === "weekly") {
      if (interval === 1) {
        text = i18n("Every week");
      } else {
        text = i18n("Every {count} weeks", { count: interval });
      }

      if (byday) {
        const days = byday.split(",").map((day) => {
          const dayMap: Record<string, string> = {
            FR: i18n("Friday"),
            MO: i18n("Monday"),
            SA: i18n("Saturday"),
            SU: i18n("Sunday"),
            TH: i18n("Thursday"),
            TU: i18n("Tuesday"),
            WE: i18n("Wednesday"),
          };
          return dayMap[day] || day;
        });
        text += ` ${i18n("on")} ${days.join(", ")}`;
      }
    } else if (freq === "monthly") {
      text = interval === 1 ? i18n("Every month") : i18n("Every {count} months", { count: interval });
    } else if (freq === "yearly") {
      text = interval === 1 ? i18n("Every year") : i18n("Every {count} years", { count: interval });
    }

    if (count) {
      text += `, ${i18n("{n} times", { n: parseInt(count) })}`;
    } else if (until) {
      const untilDate = parse(until, "yyyyMMdd", new Date());
      text += `, ${i18n("until")}: ${formatDate(untilDate, toDateLocale(locale))}`;
    }

    return text;
  };

  const effectiveStatus = getEffectiveEventStatus(event);
  const showStatus = effectiveStatus !== Event_Status_Enum.Active;
  const isOwner = Boolean(profile?.id && event.owner_id === profile.id);
  const canManageInfo = Boolean(
    profile &&
      (profile.role === "admin" || profile.id === event.owner_id || (profile.id === event.user_id && !event.owner_id)),
  );
  const canShowRatings = [Event_Status_Enum.Active, Event_Status_Enum.Archived, Event_Status_Enum.Completed].includes(
    event.status,
  );
  const canManageUpdates = isOwner && [Event_Status_Enum.Active, Event_Status_Enum.Completed].includes(event.status);
  const openSettings = () => router.push(`/user-directory/events/${event.slug}/manage`);

  return (
    <div className="flex flex-col">
      {/* Hero section. Edge to edge image carousel */}
      <div className={`relative w-full pb-2 md:pb-4`}>
        {showStatus && (
          <div className="absolute top-4 right-4 z-10">
            <ContentStatusBadge appearance="label-with-icon" size="md" status={effectiveStatus} />
          </div>
        )}
        {images.length ? (
          <div className={`relative aspect-video w-full md:aspect-21/9`}>
            <ImageCarousel images={images} priority showDots />
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

        {/* Event title overlay on image */}
        <div className={`absolute right-0 bottom-24 left-0 px-4 pb-4 md:bottom-20 md:px-8`}>
          <div className="mx-auto max-w-5xl">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1
                  className={clsx(
                    images.length ? "text-neutral-0" : "text-on-surface",
                    `mb-3 text-3xl leading-tight font-black tracking-tight drop-shadow-2xl md:text-5xl lg:text-6xl`,
                  )}
                >
                  {title}
                </h1>

                {/* Date & location */}
                <div
                  className={clsx(
                    images.length ? "text-neutral-0/80" : "text-on-surface/80",
                    `flex flex-col gap-2 md:flex-row md:items-center md:gap-4`,
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="shrink-0" size={20} />
                    <span className={`text-base font-medium md:text-lg`}>
                      {format(new Date(startDate), "EEEE, dd MMMM yyyy", { locale: toDateLocale(locale) })}
                    </span>
                  </div>

                  {!event.is_online && event.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="shrink-0" size={20} />
                      <span className={`text-base font-medium md:text-lg`}>{event.city}</span>
                    </div>
                  )}

                  {event.is_online && (
                    <div className="flex items-center gap-2">
                      <Globe className="shrink-0" size={20} />
                      <span className={`text-base font-medium md:text-lg`}>{i18n("Online event")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Registration Button */}
              {event.registration_url && (
                <div className={`hidden shrink-0 md:block`}>
                  <a href={event.registration_url} rel="noopener noreferrer" target="_blank">
                    <Button color="primary" size="lg" variant="filled">
                      {event.registration_required ? i18n("Register Now") : i18n("Learn More")}
                      <ArrowUpRight className="ml-2" size={20} />
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Registration Button - Mobile (below hero) */}
        {event.registration_url && (
          <div className={`absolute right-0 bottom-0 left-0 px-4 md:hidden`}>
            <div className="mx-auto max-w-5xl">
              <a href={event.registration_url} rel="noopener noreferrer" target="_blank">
                <Button color="primary" variant="filled">
                  {event.registration_required ? i18n("Register Now") : i18n("Learn More")}
                  <ArrowUpRight className="ml-2" size={20} />
                </Button>
              </a>
            </div>
          </div>
        )}

        <div className={`mx-auto mt-2 w-full max-w-5xl px-4`}>
          <CardHeader
            event={event}
            hideUntilHover={false}
            hideCurrentOwnerProfileAction={isOwner}
            showManageAction={false}
            viewActions={
              isOwner ? (
                <ContentViewOwnerActions
                  onOpenAnalytics={() =>
                    router.push(`/user-directory/events/${event.slug}/manage#${encodeURIComponent(i18n("Analytics"))}`)
                  }
                  onOpenSettings={openSettings}
                />
              ) : undefined
            }
          />
        </div>
      </div>

      {/* Main Content */}
      <div className={`mx-auto w-full max-w-5xl px-4 py-2 lg:py-4`}>
        <Tabs defaultActiveKey="about" defer mobileFullWidth>
          <TabPane
            icon={<Info aria-hidden className="size-6 sm:size-5" />}
            label={<span className="hidden sm:inline">{i18n("About")}</span>}
            tab={i18n("About")}
          >
            {canManageInfo && (
              <div className="mb-4 flex justify-end">
                <Button
                  onClick={() => router.push(`/user-directory/events/${event.slug}`)}
                  size="sm"
                  variant="outlined"
                >
                  <Pencil size={16} />
                  {i18n("Manage event info")}
                </Button>
              </div>
            )}
            <div className={`grid grid-cols-1 gap-4 lg:grid-cols-3`}>
              {/* Description - Left side (2/3) */}
              <div className="lg:col-span-2">
                {description ? (
                  <RichText className={`prose dark:prose-invert max-w-none`}>{description}</RichText>
                ) : (
                  <div
                    className={`flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16 dark:border-gray-700`}
                  >
                    <p className="text-neutral/60">{i18n("No description available")}</p>
                  </div>
                )}
              </div>

              {/* Info Cards - Right side (1/3) */}
              <div className="flex flex-col gap-4">
                {canShowRatings && (
                  <ContentRating
                    onOpenReviews={() => {
                      window.location.hash = encodeURIComponent(i18n("Reviews"));
                    }}
                    targetId={String(event.id)}
                    type="event"
                  />
                )}
                <SectionCard title={i18n("Details")}>
                  <CardMetadata
                    event={event}
                    expanded
                    formatDate={formatDate}
                    formatRecurrenceRule={formatRecurrenceRule}
                    formatTime={formatTime}
                    locale={locale}
                  />
                </SectionCard>

                {(event.capacity || event.language || event.age_restriction || event.accessibility_info) && (
                  <SectionCard title={i18n("Additional information")}>
                    <AdditionalInfo event={event} expanded locale={locale} />
                  </SectionCard>
                )}

                {event.organizer_name && (
                  <SectionCard title={i18n("Organizer")}>
                    <OrganizerInfo event={event} expanded locale={locale} />
                  </SectionCard>
                )}
              </div>
            </div>
          </TabPane>

          {canShowRatings && (
            <TabPane
              icon={<Newspaper aria-hidden className="size-6 sm:size-5" />}
              label={<span className="hidden sm:inline">{i18n("Feed")}</span>}
              tab={i18n("Feed")}
            >
              <ContentUpdates canManage={canManageUpdates} targetId={event.id} type="event" />
            </TabPane>
          )}

          {canShowRatings && (
            <TabPane
              icon={<Star aria-hidden className="size-6 sm:size-5" />}
              label={<span className="hidden sm:inline">{i18n("Reviews")}</span>}
              tab={i18n("Reviews")}
            >
              <ContentReviews context={event.type} targetId={String(event.id)} type="event" />
            </TabPane>
          )}
        </Tabs>
      </div>
    </div>
  );
};
