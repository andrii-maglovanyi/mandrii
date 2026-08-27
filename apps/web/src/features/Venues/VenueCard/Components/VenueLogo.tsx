"use client";

import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";

import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { getPublicMediaUrl } from "~/lib/media";
import { GetPublicVenuesQuery } from "~/types";

type VenueLogoProps = {
  className?: string;
  expandable?: boolean;
  size?: "lg" | "md" | "xl";
  venue: GetPublicVenuesQuery["venues"][number];
  variant?: "default" | "hero";
};

/** A compact venue identity image, with the venue category as its dependable fallback. */
export const VenueLogo = ({
  className,
  expandable = false,
  size = "md",
  venue,
  variant = "default",
}: VenueLogoProps) => {
  const { iconName } = constants.categories[venue.category as keyof typeof constants.categories];
  const logoUrl = getPublicMediaUrl(venue.logo || venue.chain?.logo || venue.chain?.chain?.logo);
  const sizeClassName = size === "xl" ? "h-24 w-24 md:h-32 md:w-32" : size === "lg" ? "h-14 w-14" : "h-12 w-12";
  const logoClassName =
    variant === "hero"
      ? "border-surface bg-surface rounded-3xl border-4 shadow-2xl"
      : "border-primary/20 bg-primary/10 text-primary rounded-xl border shadow-sm";
  const [isExpanded, setIsExpanded] = useState(false);

  const logo = (
    <span
      className={clsx(
        "relative flex items-center justify-center overflow-hidden transition-transform duration-200 ease-out motion-reduce:transition-none",
        logoClassName,
        sizeClassName,
        size === "xl" && "origin-bottom-left",
        expandable && size !== "xl" && "origin-left",
        isExpanded && "scale-200 shadow-xl",
        className,
      )}
    >
      {logoUrl ? (
        <Image
          alt={`${venue.name} logo`}
          className="object-cover"
          fill
          priority={variant === "hero"}
          sizes={size === "xl" ? "(min-width: 768px) 128px, 96px" : size === "lg" ? "56px" : "48px"}
          src={logoUrl}
        />
      ) : (
        getIcon(iconName, { size: size === "xl" ? 40 : size === "lg" ? 24 : 22 })
      )}
    </span>
  );

  if (!expandable || !logoUrl) return logo;

  return (
    <button
      aria-expanded={isExpanded}
      aria-label={isExpanded ? `Collapse ${venue.name} logo` : `Expand ${venue.name} logo`}
      className="focus-visible:outline-primary relative z-10 shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2"
      onBlur={() => setIsExpanded(false)}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsExpanded((expanded) => !expanded);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          setIsExpanded(false);
          event.currentTarget.blur();
        }
      }}
      type="button"
    >
      {logo}
    </button>
  );
};
