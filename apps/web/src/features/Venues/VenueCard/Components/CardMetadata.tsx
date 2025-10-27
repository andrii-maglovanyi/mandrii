"use client";

import { AtSign, Globe, MapPin, Phone } from "lucide-react";

import { GetPublicVenuesQuery } from "~/types";

import { InfoLine } from "./InfoLine";

interface CardMetadataProps {
  hideUntilHover?: boolean;
  variant?: CardMetadataVariant;
  venue: GetPublicVenuesQuery["venues"][number];
}

type CardMetadataVariant = "grid" | "list" | "map";

/**
 * Context-aware venue information display component.
 * Shows different contact details based on the display variant:
 * - 'map': Shows address and phone (for mobile map view)
 * - 'list': Shows all available information (for desktop list view)
 * - 'grid': Shows website and email (for grid/masonry cards)
 *
 * @param {CardMetadataProps} props - Component props.
 * @returns {JSX.Element | null} The venue quick info display.
 */
export const CardMetadata = ({ hideUntilHover, variant = "list", venue }: CardMetadataProps) => {
  // Determine which fields to show based on variant
  const showWebsite = variant === "list" || variant === "grid";
  const showEmail = variant === "list" || variant === "grid";
  const showPhone = variant === "list" || variant === "map";
  const showAddress = variant === "list" || variant === "map";

  const { address, emails, phone_numbers: phoneNumbers, website } = venue;

  const hasAnyInfo =
    (showWebsite && website) ||
    (showEmail && emails?.length) ||
    (showPhone && phoneNumbers?.length) ||
    (showAddress && address);

  if (!hasAnyInfo) {
    return null;
  }

  return (
    <div className="-mx-4 mt-4 mb-2 flex flex-col text-sm text-on-surface">
      {showWebsite && (
        <InfoLine
          hideUntilHover={hideUntilHover}
          icon={<Globe size={16} />}
          info={website}
          isLink
          tooltipText="Copy website"
        />
      )}
      {showEmail && (
        <InfoLine
          hideUntilHover={hideUntilHover}
          icon={<AtSign size={16} />}
          info={emails?.join(", ")}
          tooltipText="Copy email"
        />
      )}
      {showPhone && (
        <InfoLine
          hideUntilHover={hideUntilHover}
          icon={<Phone size={16} />}
          info={phoneNumbers?.join(", ")}
          tooltipText="Copy phone number"
        />
      )}
      {showAddress && (
        <InfoLine
          hideUntilHover={hideUntilHover}
          icon={<MapPin size={16} />}
          info={address}
          tooltipText="Copy address"
        />
      )}
    </div>
  );
};
