import { Clock } from "lucide-react";
import Link from "next/link";
import { useI18n } from "~/i18n/useI18n";
import { GetPublicVenuesQuery, Venue_Status_Enum } from "~/types";

interface CardFooterProps {
  hideUntilHover?: boolean;
  venue: GetPublicVenuesQuery["venues"][number];
}

export const CardFooter = ({ hideUntilHover, venue }: CardFooterProps) => {
  const i18n = useI18n();

  return (
    <div className={`border-primary/5 flex items-center justify-between border-t pt-3`}>
      <div className="text-neutral flex items-center gap-2 text-xs">
        {venue.status === Venue_Status_Enum.Pending && (
          <>
            <Clock size={14} />
            <span className="capitalize">{venue.status?.toLowerCase()}</span>
          </>
        )}
      </div>

      <Link
        href={`/venues/${venue.slug}`}
        className={`text-primary flex items-center gap-1 text-xs font-medium no-underline ${
          hideUntilHover ? `opacity-0 transition-opacity group-hover/card:opacity-100` : `opacity-100`
        } `}
      >
        {i18n("Discover")}
        <span className="transition-transform group-hover/card:translate-x-1">→</span>
      </Link>
    </div>
  );
};
