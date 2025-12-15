"use client";

import { format } from "date-fns";
import {
  Calendar,
  Clock,
  DollarSign,
  Euro,
  Gift,
  Globe,
  HandHelping,
  MapPin,
  PoundSterling,
  Repeat,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { Separator } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { toDateLocale } from "~/lib/utils";
import { GetPublicEventsQuery, Locale, Price_Type_Enum } from "~/types";

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

// Currency icon mapping for better maintainability
const CURRENCY_ICONS = {
  EUR: Euro,
  GBP: PoundSterling,
  USD: DollarSign,
} as const;

const ICON_SIZE = 16;
const ICON_CLASSES = "min-h-4 min-w-4";

// Extracted Section component for reusability
const Section = ({ children, expanded, title }: { children: React.ReactNode; expanded?: boolean; title?: string }) => (
  <div>
    {expanded && title && <Separator align="left" text={title} />}
    {children}
  </div>
);

export const CardMetadata = ({
  event,
  expanded = true,
  formatDate,
  formatRecurrenceRule,
  formatTime,
  locale,
}: CardMetadataProps) => {
  const i18n = useI18n();

  const { currencyIcon, dateDisplay, priceInfo, startDate, timeDisplay } = useMemo(() => {
    const start = event.start_date ? new Date(String(event.start_date)) : null;
    const end = event.end_date ? new Date(String(event.end_date)) : null;

    const date = start ? formatDate(start) : null;
    const time = start ? `${formatTime(start)}${end ? ` - ${formatTime(end)}` : ""}` : null;

    const price = formatEventPrice(event, locale);

    let icon: React.ReactNode;
    if (event.price_type === Price_Type_Enum.Free) {
      icon = <Gift className={ICON_CLASSES} size={ICON_SIZE} />;
    } else if (event.price_type === Price_Type_Enum.Donation) {
      icon = <HandHelping className={ICON_CLASSES} size={ICON_SIZE} />;
    } else {
      const CurrencyIcon =
        event.price_currency && event.price_currency in CURRENCY_ICONS
          ? CURRENCY_ICONS[event.price_currency as keyof typeof CURRENCY_ICONS]
          : Wallet;
      icon = <CurrencyIcon className={ICON_CLASSES} size={ICON_SIZE} />;
    }

    return {
      currencyIcon: icon,
      dateDisplay: date,
      endDate: end,
      priceInfo: price,
      startDate: start,
      timeDisplay: time,
    };
  }, [event, formatDate, formatTime, locale]);

  const {
    custom_location_address,
    custom_location_name,
    external_url,
    is_online: isOnline,
    is_recurring,
    recurrence_rule,
    registration_url,
    venue,
    venue_id,
  } = event;

  return (
    <div className="-mx-4 mt-4 mb-2 flex flex-col text-sm text-on-surface">
      {/* Date & Time */}
      {startDate && (
        <Section expanded={expanded} title={i18n("Date & Time")}>
          <InfoLine
            icon={<Calendar className={ICON_CLASSES} size={ICON_SIZE} />}
            info={
              dateDisplay ? format(new Date(dateDisplay), "EEEE, dd MMMM yyyy", { locale: toDateLocale(locale) }) : ""
            }
            tooltipText={i18n("Copy date")}
            withCopy
          />
          {timeDisplay && (
            <InfoLine
              icon={<Clock className={ICON_CLASSES} size={ICON_SIZE} />}
              info={timeDisplay}
              tooltipText={i18n("Copy time")}
              withCopy
            />
          )}
        </Section>
      )}

      {/* Recurrence Info */}
      {is_recurring && recurrence_rule && (
        <Section expanded={expanded}>
          <div className="my-2 border-primary/20 bg-primary/10 px-4 py-2">
            <div className="flex items-start gap-2 text-primary">
              <Repeat className="mt-0.5 min-h-4 min-w-4 shrink-0 text-neutral" size={ICON_SIZE} />
              <p className="text-sm font-medium">{formatRecurrenceRule(recurrence_rule)}</p>
            </div>
          </div>
        </Section>
      )}

      <Section expanded={expanded} title={i18n("Price")}>
        <InfoLine icon={currencyIcon} info={priceInfo} />
      </Section>

      {/* Location */}
      {!isOnline && (
        <Section expanded={expanded} title={i18n("Location")}>
          {venue_id && venue ? (
            <div className={`
              group/info flex w-full items-center justify-between text-left
              hover:bg-on-surface/5
            `}>
              <div className={`
                flex min-w-0 flex-1 items-center gap-2 px-4 py-2 text-neutral
              `}>
                <MapPin className="min-h-4 min-w-4 text-primary" size={ICON_SIZE} />
                <Link
                  className={`
                    min-w-0 truncate font-medium text-primary
                    hover:underline
                  `}
                  href={`/venues/${venue.slug}`}
                >
                  {venue.name}
                </Link>
              </div>
            </div>
          ) : (
            <>
              {custom_location_name && (
                <InfoLine
                  icon={<MapPin className={ICON_CLASSES} size={ICON_SIZE} />}
                  info={custom_location_name}
                  tooltipText={i18n("Copy location name")}
                  withCopy
                />
              )}
              {custom_location_address && (
                <InfoLine info={custom_location_address} isAddress tooltipText={i18n("Copy address")} withCopy />
              )}
            </>
          )}
        </Section>
      )}

      {isOnline && external_url && (
        <Section expanded={expanded} title={i18n("Online event")}>
          <InfoLine
            icon={<Globe className={ICON_CLASSES} size={ICON_SIZE} />}
            info={external_url}
            isLink
            tooltipText={i18n("Copy link")}
          />
        </Section>
      )}

      {registration_url && (
        <Section expanded={expanded} title={i18n("Registration")}>
          <InfoLine
            icon={<Globe className={ICON_CLASSES} size={ICON_SIZE} />}
            info={registration_url}
            isLink
            tooltipText={i18n("Copy registration link")}
          />
        </Section>
      )}
    </div>
  );
};
