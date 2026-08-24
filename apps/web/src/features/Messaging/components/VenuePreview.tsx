"use client";

import { ArrowUpRight, MapPin, Store } from "lucide-react";
import { useLocale } from "next-intl";

import { useDialog } from "~/contexts/DialogContext";
import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { Locale } from "~/types";

import { ParticipantAvatar } from "./ParticipantAvatar";

type VenuePreviewProps = {
  category?: null | string;
  city?: null | string;
  country?: null | string;
  image?: null | string;
  name: string;
  slug: string;
};

export const VenuePreview = ({ category, city, country, image, name, slug }: VenuePreviewProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const { closeDialog } = useDialog();
  const location = [city, country].filter(Boolean).join(", ");
  const categoryLabel = category
    ? constants.categories[category as keyof typeof constants.categories]?.label[locale]
    : null;

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <ParticipantAvatar image={image} name={name} size="lg" />
      <div className="flex max-w-md flex-col items-center">
        <p className="text-xl font-semibold">{name}</p>
        {(category || location) && (
          <div className="text-neutral mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
            {categoryLabel && (
              <p className="inline-flex items-center gap-1">
                <Store aria-hidden size={14} />
                {categoryLabel}
              </p>
            )}
            {categoryLabel && location && <span aria-hidden="true">&bull;</span>}
            {location && (
              <p className="inline-flex items-center gap-1">
                <MapPin aria-hidden size={14} />
                {location}
              </p>
            )}
          </div>
        )}
      </div>
      <Link
        className="bg-primary hover:bg-primary-hover inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white no-underline transition-colors hover:no-underline"
        href={`/venues/${slug}`}
        onClick={closeDialog}
      >
        {i18n("View venue")}
        <ArrowUpRight size={16} />
      </Link>
    </div>
  );
};
