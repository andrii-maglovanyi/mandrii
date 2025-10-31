"use client";

import { Clock } from "lucide-react";

import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getFlagComponent } from "~/lib/icons/flags";
import { GetPublicVenuesQuery, Venue_Status_Enum } from "~/types";

interface CardFooterProps {
  hideUntilHover?: boolean;
  isInsideLink?: boolean;
  showFlag?: boolean;
  venue: GetPublicVenuesQuery["venues"][number];
}

export const CardFooter = ({ hideUntilHover, isInsideLink, showFlag, venue }: CardFooterProps) => {
  const i18n = useI18n();

  const linkContent = (
    <>
      {i18n("Discover")}
      <span className={`
        transition-transform
        group-hover/card:translate-x-1
      `}>→</span>
    </>
  );

  const linkClassName = `
    flex items-center gap-1 text-xs font-medium text-primary no-underline
    ${
      hideUntilHover
        ? `
        opacity-0 transition-opacity
        group-hover/card:opacity-100
      `
        : `opacity-100`
    }
  `;

  const countryCode = showFlag
    ? Object.entries(constants.whitelisted_countries).find(([, { label }]) => {
        return venue.country === label.en;
      })?.[0]
    : null;

  const CountryFlag = countryCode ? getFlagComponent(countryCode) : null;

  return (
    <div className={`
      flex items-center justify-between border-t border-primary/5 pt-3
    `}>
      <div className="flex items-center gap-2 text-xs text-neutral">
        {venue.status === Venue_Status_Enum.Pending ? (
          <>
            <Clock size={14} />
            <span className="capitalize">{venue.status?.toLowerCase()}</span>
          </>
        ) : CountryFlag ? (
          <CountryFlag className={`
            h-4 w-6 rounded-sm opacity-60
            group-hover/card:opacity-100
          `} />
        ) : null}
      </div>

      {isInsideLink ? (
        <span className={`
          ${linkClassName}
          pointer-events-none
        `}>{linkContent}</span>
      ) : (
        <Link className={linkClassName} href={`/venues/${venue.slug}`}>
          {linkContent}
        </Link>
      )}
    </div>
  );
};
