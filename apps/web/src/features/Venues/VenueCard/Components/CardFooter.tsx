import { Clock } from "lucide-react";

import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";
import { GetPublicVenuesQuery, Venue_Status_Enum } from "~/types";

interface CardFooterProps {
  hideUntilHover?: boolean;
  venue: GetPublicVenuesQuery["venues"][number];
}

export const CardFooter = ({ hideUntilHover, venue }: CardFooterProps) => {
  const i18n = useI18n();

  return (
    <div className={`
      flex items-center justify-between border-t border-primary/5 pt-3
    `}>
      <div className="flex items-center gap-2 text-xs text-neutral">
        {venue.status === Venue_Status_Enum.Pending && (
          <>
            <Clock size={14} />
            <span className="capitalize">{venue.status?.toLowerCase()}</span>
          </>
        )}
      </div>

      <Link
        className={`
          flex items-center gap-1 text-xs font-medium text-primary no-underline
          ${
          hideUntilHover ? `
            opacity-0 transition-opacity
            group-hover/card:opacity-100
          ` : `opacity-100`
        }
        `}
        href={`/venues/${venue.slug}`}
      >
        {i18n("Discover")}
        <span className={`
          transition-transform
          group-hover/card:translate-x-1
        `}>→</span>
      </Link>
    </div>
  );
};
