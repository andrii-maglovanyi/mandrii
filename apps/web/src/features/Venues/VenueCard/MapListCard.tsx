"use client";

import clsx from "clsx";
import { useLocale } from "next-intl";

import { RichText } from "~/components/ui";
import { Link } from "~/i18n/navigation";
import { GetPublicVenuesQuery, Locale } from "~/types";
import { UUID } from "~/types/uuid";

import { CardFooter } from "./Components/CardFooter";
import { CardHeader } from "./Components/CardHeader";
import { CardMetadata } from "./Components/CardMetadata";

interface MapListCardProps {
  onClick: () => void;
  selectedId: null | UUID;
  venue: GetPublicVenuesQuery["venues"][number];
}

export const MapListCard = ({ onClick, selectedId, venue }: MapListCardProps) => {
  const locale = useLocale() as Locale;

  const description = (locale === "uk" ? venue.description_uk : venue.description_en) || "";

  return (
    <div className="flex flex-col pt-0.5 pb-2" id={String(venue.id)} key={String(venue.id)}>
      <section
        aria-label={`Venue: ${venue.name}`}
        className={clsx(
          `
            group/card flex w-full overflow-x-hidden rounded-xl border
            bg-surface-tint/50 transition-all duration-300
            hover:border-primary/20 hover:shadow-lg
            lg:text-base
          `,
          selectedId === venue.id
            ? "border-primary/20 shadow-xl ring-2 ring-primary ring-offset-1"
            : `border-primary/0`,
        )}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="flex w-full flex-col p-4">
          <CardHeader hideUntilHover venue={venue} />

          <h3
            className={`
              mb-2 line-clamp-2 text-lg font-bold text-primary transition-colors
              group-hover/card:underline
              sm:text-xl
            `}
          >
            <Link href={`/venues/${venue.slug}`}>{venue.name}</Link>
          </h3>

          {description && (
            <RichText as="div" className="line-clamp-3 text-sm text-neutral">
              {description.replaceAll("\n", "<br />")}
            </RichText>
          )}

          <CardMetadata hideUntilHover variant="list" venue={venue} />
          <CardFooter hideUntilHover venue={venue} />
        </div>
      </section>
    </div>
  );
};
