"use client";

import clsx from "clsx";
import { MapPin } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { useI18n } from "~/i18n/useI18n";
import { GetPublicVenuesQuery, Locale } from "~/types";

interface VenuesTileCardProps {
  venue: GetPublicVenuesQuery["venues"][number];
  viewMode: "grid" | "list";
}

export const VenuesTileCard = ({ venue, viewMode }: VenuesTileCardProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  const description = (locale === "uk" ? venue.description_uk : venue.description_en) || "";
  const truncatedDescription = description.length > 120 ? `${description.substring(0, 120)}...` : description;

  const firstImage = venue.images?.[0];

  return (
    <Link href={`/venues/${venue.slug}`}>
      <article
        className={clsx(
          `
            group overflow-hidden rounded-xl border border-primary/10
            bg-surface-tint transition-all duration-300
            hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5
          `,
          viewMode === "list" && "flex flex-row",
        )}
      >
        {/* Image */}
        <div
          className={clsx(
            "relative overflow-hidden bg-neutral/5",
            viewMode === "grid" ? "aspect-video w-full" : `
              h-48 w-48 flex-shrink-0
              md:h-40 md:w-64
            `,
          )}
        >
          {firstImage ? (
            <Image
              alt={venue.name}
              className={`
                object-cover transition-transform duration-300
                group-hover:scale-105
              `}
              fill
              sizes={viewMode === "grid" ? "(max-width: 768px) 100vw, 300px" : "256px"}
              src={firstImage}
            />
          ) : (
            <div
              className={`
                flex h-full items-center justify-center bg-gradient-to-br
                from-primary/10 to-secondary/10
              `}
            >
              <MapPin className="text-neutral opacity-30" size={48} />
            </div>
          )}

          {/* Status Badge - removed category since it's not in GET_PUBLIC_VENUES query */}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex-1">
            {/* Name */}
            <h3
              className={`
                mb-1 line-clamp-1 font-semibold transition-colors
                group-hover:text-primary
                ${viewMode === "grid" ? `text-lg` : `text-xl`}
              `}
            >
              {venue.name}
            </h3>

            {/* Address */}
            {venue.address && (
              <div className="mb-2 flex items-start gap-1 text-sm text-neutral">
                <MapPin className="mt-0.5 flex-shrink-0" size={14} />
                <span className="line-clamp-1">{venue.address}</span>
              </div>
            )}

            {/* Description */}
            {description && (
              <p className={clsx("text-sm text-neutral", viewMode === "grid" ? `
                line-clamp-2
              ` : `line-clamp-3`)}>
                {truncatedDescription}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className={`
            flex items-center justify-between border-t border-primary/5 pt-3
            text-xs text-neutral
          `}>
            <span className="font-medium text-primary">{i18n("View Details")}</span>
          </div>
        </div>
      </article>
    </Link>
  );
};
