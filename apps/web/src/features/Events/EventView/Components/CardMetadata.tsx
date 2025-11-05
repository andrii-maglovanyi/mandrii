"use client";

import { Calendar, Clock, DollarSign, Euro, Globe, MapPin, PoundSterling, Repeat, Wallet } from "lucide-react";
import Link from "next/link";

import { Separator } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { GetPublicEventsQuery, Locale } from "~/types";

import { InfoLine } from "../../../Venues/VenueCard/Components/InfoLine";
import { formatEventPrice } from "../../utils";

interface CardMetadataProps {
  event: GetPublicEventsQuery["events"][number];
  expanded?: boolean;
  formatDate: (date: Date) => string;
  formatRecurrenceRule: (rule: string) => string;
  formatTime: (date: Date) => string;
  locale: Locale;
}

export const CardMetadata = ({
  event,
  expanded = true,
  formatDate,
  formatRecurrenceRule,
  formatTime,
  locale,
}: CardMetadataProps) => {
  const i18n = useI18n();

  const startDate = event.start_date ? new Date(String(event.start_date)) : null;
  const endDate = event.end_date ? new Date(String(event.end_date)) : null;
  const isOnline = event.is_online;

  const priceInfo = formatEventPrice(event, locale);

  // Format date/time display
  const dateDisplay = startDate ? formatDate(startDate) : null;
  const timeDisplay = startDate ? `${formatTime(startDate)}${endDate ? ` - ${formatTime(endDate)}` : ""}` : null;

  // Helper to render a section with optional separator
  const Section = ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div>
      {expanded && title && <Separator align="left" text={title} />}
      {children}
    </div>
  );

  const currencyIcon =
    event.price_currency === "GBP" ? (
      <PoundSterling className="min-h-4 min-w-4" size={16} />
    ) : event.price_currency === "USD" ? (
      <DollarSign className="min-h-4 min-w-4" size={16} />
    ) : event.price_currency === "EUR" ? (
      <Euro className="min-h-4 min-w-4" size={16} />
    ) : (
      <Wallet className="min-h-4 min-w-4" size={16} />
    );

  return (
    <div className="-mx-4 mt-4 mb-2 flex flex-col text-sm text-on-surface">
      {/* Date & Time */}
      {startDate && (
        <Section title={i18n("Date & Time")}>
          <InfoLine
            icon={<Calendar className="min-h-4 min-w-4" size={16} />}
            info={dateDisplay || ""}
            tooltipText={i18n("Copy date")}
            withCopy
          />
          {timeDisplay && (
            <InfoLine
              icon={<Clock className="min-h-4 min-w-4" size={16} />}
              info={timeDisplay}
              tooltipText={i18n("Copy time")}
              withCopy
            />
          )}
        </Section>
      )}{" "}
      {event.is_recurring && event.recurrence_rule && (
        <Section>
          <div className="my-2 border-primary/20 bg-primary/10 px-4 py-2">
            <div className="flex items-start gap-2 text-primary">
              <Repeat className="mt-0.5 min-h-4 min-w-4 shrink-0 text-neutral" size={16} />
              <p className="text-sm font-medium">{formatRecurrenceRule(event.recurrence_rule)}</p>
            </div>
          </div>
        </Section>
      )}
      <Section title={i18n("Price")}>
        <InfoLine icon={currencyIcon} info={priceInfo} />
      </Section>
      {!isOnline && (
        <Section title={i18n("Location")}>
          {event.venue_id && event.venue ? (
            <div className={`
              group/info flex w-full items-center justify-between text-left
              hover:bg-on-surface/5
            `}>
              <div className={`
                flex min-w-0 flex-1 items-center gap-2 px-4 py-2 text-neutral
              `}>
                <MapPin className="min-h-4 min-w-4 text-primary" size={16} />
                <Link
                  className={`
                    min-w-0 truncate font-medium text-primary
                    hover:underline
                  `}
                  href={`/venues/${event.venue.slug}`}
                >
                  {event.venue.name}
                </Link>
              </div>
            </div>
          ) : (
            <>
              {event.custom_location_name && (
                <InfoLine
                  icon={<MapPin className="min-h-4 min-w-4" size={16} />}
                  info={event.custom_location_name}
                  tooltipText={i18n("Copy location name")}
                  withCopy
                />
              )}
              {event.custom_location_address && (
                <InfoLine info={event.custom_location_address} isAddress tooltipText={i18n("Copy address")} withCopy />
              )}
            </>
          )}
        </Section>
      )}
      {isOnline && event.external_url && (
        <Section title={i18n("Online event")}>
          <InfoLine
            icon={<Globe className="min-h-4 min-w-4" size={16} />}
            info={event.external_url}
            isLink
            tooltipText={i18n("Copy link")}
          />
        </Section>
      )}
      {event.registration_url && (
        <Section title={i18n("Registration")}>
          <InfoLine
            icon={<Globe className="min-h-4 min-w-4" size={16} />}
            info={event.registration_url}
            isLink
            tooltipText={i18n("Copy registration link")}
          />
        </Section>
      )}
    </div>
  );
};
