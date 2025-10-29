"use client";

import { AtSign, Facebook, Globe, Instagram, MapPin } from "lucide-react";

import { Separator } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { GetPublicVenuesQuery, Venue_Status_Enum } from "~/types";

import { InfoLine } from "./InfoLine";

interface CardMetadataProps {
  expanded?: boolean;
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
 */
export const CardMetadata = ({ expanded, hideUntilHover, variant = "list", venue }: CardMetadataProps) => {
  const i18n = useI18n();

  // Determine which fields to show based on variant
  const showWebsite = variant === "list" || variant === "grid";
  const showEmail = variant === "list" || variant === "grid";
  const showPhone = variant === "list" || variant === "map";
  const showAddress = variant === "list" || variant === "map";

  const { address, social_links: socialLinks, website } = venue;

  // Limit items when not expanded
  const emails = expanded ? venue.emails : venue.emails?.slice(0, 1);
  const phoneNumbers = expanded ? venue.phone_numbers : venue.phone_numbers?.slice(0, 1);

  // Check if we have any info to display
  const hasAnyInfo =
    (showWebsite && website) ||
    (showEmail && emails?.length) ||
    (showPhone && phoneNumbers?.length) ||
    (showAddress && address);

  if (!hasAnyInfo) {
    return null;
  }

  const isArchived = venue.status === Venue_Status_Enum.Archived;

  // Helper to render a section with optional separator
  const Section = ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div>
      {expanded && title && <Separator align="left" text={title} />}
      {children}
    </div>
  );

  return (
    <div className="-mx-4 mt-4 mb-2 flex flex-col text-sm text-on-surface">
      {/* Website */}
      {showWebsite && website && (
        <Section title={i18n("Website")}>
          <InfoLine
            hideUntilHover={hideUntilHover}
            icon={<Globe size={16} />}
            info={website}
            isLink
            tooltipText="Copy website"
          />
        </Section>
      )}

      {/* Social Media */}
      {expanded && (socialLinks.facebook || socialLinks.instagram) && (
        <Section title={i18n("Social media")}>
          {socialLinks.facebook && (
            <InfoLine
              hideUntilHover={hideUntilHover}
              icon={<Facebook size={16} />}
              info={socialLinks.facebook.toString()}
              isLink
              tooltipText="Copy Facebook link"
            />
          )}
          {socialLinks.instagram && (
            <InfoLine
              hideUntilHover={hideUntilHover}
              icon={<Instagram size={16} />}
              info={socialLinks.instagram.toString()}
              isLink
              tooltipText="Copy Instagram link"
            />
          )}
        </Section>
      )}

      {/* Email */}
      {showEmail && emails?.length ? (
        <Section title={i18n("Email")}>
          {emails.map((email) => (
            <InfoLine
              hideUntilHover={hideUntilHover}
              icon={<AtSign size={16} />}
              info={email}
              isEmail
              key={email}
              strikethrough={isArchived}
              tooltipText="Copy email"
            />
          ))}
        </Section>
      ) : null}

      {/* Phone Numbers */}
      {showPhone && phoneNumbers?.length ? (
        <Section title={i18n("Phone number")}>
          {phoneNumbers.map((number) => (
            <InfoLine
              hideUntilHover={hideUntilHover}
              info={number}
              isPhoneNumber
              key={number}
              strikethrough={isArchived}
              tooltipText="Copy phone number"
            />
          ))}
        </Section>
      ) : null}

      {/* Address */}
      {showAddress && address ? (
        <Section title={i18n("Address")}>
          <InfoLine
            hideUntilHover={hideUntilHover}
            icon={<MapPin size={16} />}
            info={address}
            isAddress
            tooltipText="Copy address"
          />
        </Section>
      ) : null}
    </div>
  );
};
