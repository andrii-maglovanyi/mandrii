"use client";

import { Building, Calendar, MapPin } from "lucide-react";

import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";

interface CardFooterProps {
  event: Record<string, unknown>;
  hideUntilHover?: boolean;
  isInsideLink?: boolean;
}

export const CardFooter = ({ event, hideUntilHover, isInsideLink }: CardFooterProps) => {
  const i18n = useI18n();

  const linkContent = (
    <>
      {i18n("More")}
      <span className={`transition-transform group-hover/card:translate-x-1`}>→</span>
    </>
  );

  const linkClassName = `
    flex items-center gap-1 text-xs font-medium text-primary no-underline
    ${hideUntilHover ? "opacity-0 transition-opacity group-hover/card:opacity-100" : "opacity-100"}
  `;

  const isOnline = event.is_online;
  const hasVenue = !!event.venue;
  const city = event.city as null | string;

  return (
    <div className={`border-primary/5 flex items-center justify-between border-t pt-3`}>
      <div className="text-neutral flex items-center gap-2 text-xs">
        {isOnline ? (
          <>
            <Calendar size={14} />
            <span>{i18n("Online event")}</span>
          </>
        ) : hasVenue ? (
          <>
            <Building size={14} />
            <span className="line-clamp-1">{String((event.venue as Record<string, unknown>)?.name || "")}</span>
          </>
        ) : city ? (
          <>
            <MapPin size={14} />
            <span className="line-clamp-1">{String(city || "")}</span>
          </>
        ) : null}
      </div>

      {isInsideLink ? (
        <span className={` ${linkClassName} pointer-events-none`}>{linkContent}</span>
      ) : (
        <Link className={linkClassName} href={`/events/${String(event.slug)}`}>
          {linkContent}
        </Link>
      )}
    </div>
  );
};
