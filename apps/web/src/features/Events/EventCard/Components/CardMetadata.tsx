"use client";

import { format } from "date-fns";
import { Building, Calendar, MapPin, PoundSterling, Users } from "lucide-react";
import { useLocale } from "next-intl";

import { useI18n } from "~/i18n/useI18n";
import { GetPublicEventsQuery, Locale } from "~/types";

import { formatEventPrice } from "../../utils";

interface CardMetadataProps {
  event: GetPublicEventsQuery["events"][number];
  hideUntilHover?: boolean;
  variant?: "grid" | "list" | "map";
}

/**
 * Event metadata component showing date, time, location, capacity, and price.
 * Different variants show different levels of detail:
 * - 'map': Shows minimal info (date/time and location) for mobile map view
 * - 'list': Shows full details for desktop list view
 * - 'grid': Shows compact info for grid/masonry cards
 *
 * @param {CardMetadataProps} props - Component props.
 * @returns {JSX.Element | null} The card metadata or null.
 */
export const CardMetadata = ({ event, variant = "list" }: CardMetadataProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  const startDate = event.start_date ? new Date(String(event.start_date)) : null;
  const endDate = event.end_date ? new Date(String(event.end_date)) : null;
  const capacity = event.capacity as null | number;
  const isOnline = event.is_online as boolean;
  const venueName = event.venue ? String((event.venue as Record<string, unknown>)?.name || "") : null;
  const city = event.city as null | string;
  const customLocationName = event.custom_location_name as null | string;

  const priceInfo = formatEventPrice(event, locale);

  // Determine which fields to show based on variant
  const showLocation = variant === "list" || variant === "map";
  const showCapacity = variant === "list";
  const showPrice = variant === "list" || variant === "map";

  return (
    <div className="-mx-4 mt-4 mb-2 flex flex-col gap-2 text-sm text-on-surface">
      {/* Date and time */}
      {startDate && (
        <div className="flex items-start gap-2 px-4">
          <Calendar className="mt-0.5 min-h-4 min-w-4 shrink-0" size={16} />
          <div className="flex-1">
            <div className="font-medium">
              {format(startDate, "MMM d, yyyy")}
              {endDate && endDate.getTime() !== startDate.getTime() && <span> - {format(endDate, "MMM d, yyyy")}</span>}
            </div>
            <div className="text-xs text-neutral">
              {format(startDate, "h:mm a")}
              {endDate && <span> - {format(endDate, "h:mm a")}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Location */}
      {showLocation && (
        <>
          {isOnline ? (
            <div className="flex items-start gap-2 px-4">
              <Calendar className="mt-0.5 min-h-4 min-w-4 shrink-0" size={16} />
              <span>{i18n("Online event")}</span>
            </div>
          ) : venueName ? (
            <div className="flex items-start gap-2 px-4">
              <Building className="mt-0.5 min-h-4 min-w-4 shrink-0" size={16} />
              <span className="line-clamp-2">{venueName}</span>
            </div>
          ) : customLocationName || city ? (
            <div className="flex items-start gap-2 px-4">
              <MapPin className="mt-0.5 min-h-4 min-w-4 shrink-0" size={16} />
              <span className="line-clamp-2">{customLocationName || city}</span>
            </div>
          ) : null}
        </>
      )}

      {/* Capacity */}
      {showCapacity && capacity && (
        <div className="flex items-start gap-2 px-4">
          <Users className="mt-0.5 min-h-4 min-w-4 shrink-0" size={16} />
          <span>
            {i18n("Capacity")}: {capacity}
          </span>
        </div>
      )}

      {/* Price */}
      {showPrice && (
        <div className="flex items-start gap-2 px-4">
          <PoundSterling className="mt-0.5 min-h-4 min-w-4 shrink-0" size={16} />
          <span className="font-medium text-primary">{priceInfo}</span>
        </div>
      )}
    </div>
  );
};
