"use client";

import clsx from "clsx";
import { Clock, MapPin } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { useI18n } from "~/i18n/useI18n";
import { GetPublicVenuesQuery, Locale } from "~/types";

interface VenueMasonryCardProps {
  hasImage?: boolean;
  layoutSize: "full" | "half" | "small" | "third";
  venue: GetPublicVenuesQuery["venues"][number];
}

export const VenueMasonryCard = ({ hasImage = true, layoutSize, venue }: VenueMasonryCardProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  const description = (locale === "uk" ? venue.description_uk : venue.description_en) || "";
  const firstImage = venue.images?.[0];

  // Determine if this should be a vertical card (image on top)
  const isVertical = layoutSize === "small" || layoutSize === "third" || !hasImage;

  return (
    <Link
      className={clsx(
        "group border-primary/10 relative flex overflow-hidden rounded-xl border",
        "bg-surface-tint transition-all duration-300",
        "hover:border-primary/30 hover:shadow-lg",
        {
          "min-h-[220px]": layoutSize === "small",
          "min-h-[260px]": layoutSize === "third",
          "min-h-[300px]": layoutSize === "half" || layoutSize === "full",
        },
        // Responsive column spanning based on layout size
        {
          // Full width cards
          "col-span-1 sm:col-span-2 lg:col-span-4": layoutSize === "full",
          // Half width cards
          "col-span-1 sm:col-span-2 lg:col-span-2": layoutSize === "half",
          // Small and third width cards
          "col-span-1": layoutSize === "small" || layoutSize === "third",
        },
      )}
      href={`/venues/${venue.slug}`}
    >
      <div
        className={clsx("flex h-full", {
          "flex-col": isVertical,
          "flex-row": !isVertical && hasImage,
          "min-h-[220px]": layoutSize === "small",
          "min-h-[260px]": layoutSize === "third",
          "min-h-[300px]": layoutSize === "half" || layoutSize === "full",
        })}
      >
        {/* Image Section */}
        {hasImage && (
          <div
            className={clsx("relative flex-shrink-0 overflow-hidden", {
              "h-40 w-full sm:h-48": isVertical && layoutSize === "small",
              "h-44 w-full sm:h-52": isVertical && (layoutSize === "third" || layoutSize === "half"),
              "h-48 w-full sm:h-56": isVertical && layoutSize === "full",
              "h-full min-h-[300px] w-full sm:w-1/2": layoutSize === "half" && !isVertical,
              "h-full min-h-[300px] w-full sm:w-2/5": layoutSize === "full" && !isVertical,
            })}
          >
            {firstImage ? (
              <Image
                alt={venue.name}
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                fill
                sizes={
                  layoutSize === "full"
                    ? "(max-width: 768px) 100vw, 40vw"
                    : layoutSize === "half"
                      ? "(max-width: 768px) 100vw, 50vw"
                      : "(max-width: 768px) 100vw, 33vw"
                }
                src={firstImage}
              />
            ) : (
              <div className="from-primary/10 to-secondary/10 flex h-full items-center justify-center bg-gradient-to-br">
                <MapPin className="text-neutral opacity-30" size={48} />
              </div>
            )}

            {/* Overlay gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100`}
            />
          </div>
        )}

        {/* Content Section */}
        <div
          className={clsx("flex flex-1 flex-col p-4", {
            "gap-2": isVertical,
            "justify-between p-5": !isVertical,
          })}
        >
          {/* Title & Address */}
          <div className="flex-1">
            <h3
              className={clsx(`group-hover:text-primary mb-2 font-bold transition-colors`, {
                "line-clamp-2 text-base sm:text-lg": layoutSize === "small" || layoutSize === "third",
                "line-clamp-2 text-lg sm:text-xl": layoutSize === "half",
                "line-clamp-2 text-xl sm:text-2xl": layoutSize === "full",
              })}
            >
              {venue.name}
            </h3>

            {venue.address && (
              <div className="text-neutral mb-2 flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 flex-shrink-0" size={16} />
                <span className="line-clamp-2">{venue.address}</span>
              </div>
            )}

            {/* Description - only for larger cards */}
            {(layoutSize === "half" || layoutSize === "full") && description && (
              <p
                className={clsx("text-neutral text-sm", {
                  "line-clamp-2": layoutSize === "half",
                  "line-clamp-3": layoutSize === "full",
                })}
              >
                {description}
              </p>
            )}
          </div>

          {/* Footer Info */}
          <div className={`border-primary/5 mt-3 flex items-center justify-between border-t pt-3`}>
            <div className="text-neutral flex items-center gap-2 text-xs">
              <Clock size={14} />
              <span className="capitalize">{venue.status?.toLowerCase()}</span>
            </div>

            {/* Read More Arrow */}
            <div
              className={`text-primary flex items-center gap-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100`}
            >
              {i18n("Read more")}
              <span className={`transition-transform group-hover:translate-x-1`}>→</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
