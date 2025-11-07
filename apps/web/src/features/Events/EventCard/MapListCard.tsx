"use client";

import clsx from "clsx";
import { useLocale } from "next-intl";

import { RichText } from "~/components/ui";
import { Link } from "~/i18n/navigation";
import { GetPublicEventsQuery, Locale } from "~/types";
import { UUID } from "~/types/uuid";

import { CardFooter } from "./Components/CardFooter";
import { CardHeader } from "./Components/CardHeader";
import { CardMetadata } from "./Components/CardMetadata";

interface MapListCardProps {
  event: GetPublicEventsQuery["events"][number];
  onClick: () => void;
  selectedId: null | UUID;
}

export const MapListCard = ({ event, onClick, selectedId }: MapListCardProps) => {
  const locale = useLocale() as Locale;

  const title = locale === "uk" ? event.title_uk : event.title_en;
  const description = (locale === "uk" ? event.description_uk : event.description_en) || "";

  return (
    <div className="flex flex-col pt-0.5 pb-2" id={event.id} key={event.id}>
      <section
        aria-label={`Event: ${title}`}
        className={clsx(
          `
            group/card flex w-full overflow-x-hidden rounded-xl border
            bg-surface-tint/50 transition-all duration-300
            hover:border-primary/20 hover:shadow-lg
            lg:text-base
          `,
          selectedId === event.id
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
          <CardHeader event={event} hideUntilHover />

          <h3
            className={`
              mb-2 line-clamp-2 text-lg font-bold text-primary transition-colors
              group-hover/card:underline
              sm:text-xl
            `}
          >
            <Link href={`/events/${event.slug}`}>{title}</Link>
          </h3>

          {description && (
            <RichText as="div" className="line-clamp-3 text-sm text-neutral">
              {description.replaceAll("\n", "<br />")}
            </RichText>
          )}

          <CardMetadata event={event} hideUntilHover variant="list" />
          <CardFooter event={event} hideUntilHover />
        </div>
      </section>
    </div>
  );
};
