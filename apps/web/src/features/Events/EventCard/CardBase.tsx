"use client";

import clsx from "clsx";
import { Calendar } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useMediaQuery } from "react-responsive";

import { Card, RichText } from "~/components/ui";
import { constants } from "~/lib/constants";
import { GetPublicEventsQuery, Locale } from "~/types";

import { getLayoutConfig, LayoutVariant } from "../../shared/Card/layoutConfig";
import { CardFooter } from "./Components/CardFooter";
import { CardHeader } from "./Components/CardHeader";
import { CardMetadata } from "./Components/CardMetadata";

interface CardBaseProps {
  event: GetPublicEventsQuery["events"][number];
  hasImage?: boolean;
  variant: LayoutVariant;
}

export const CardBase = ({ event, hasImage = false, variant }: CardBaseProps) => {
  const locale = useLocale() as Locale;

  const title = locale === "uk" ? event.title_uk : event.title_en;
  const description = (locale === "uk" ? event.description_uk : event.description_en) || "";

  const truncatedDescription =
    typeof description === "string" && description.length > 120 ? `${description.substring(0, 120)}...` : description;

  const mainImage = event.images?.[0];

  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  const config = getLayoutConfig(variant, hasImage);

  const CardWrapper = variant.startsWith("list") ? "article" : "div";

  return (
    <Card className={config.containerClasses} href={`/events/${event.slug}`}>
      <CardWrapper className={config.innerContainerClasses}>
        {hasImage && mainImage && (
          <div className={config.imageContainerClasses}>
            <Image
              alt={title}
              className={`object-cover transition-transform duration-300 group-hover/card:scale-110`}
              fill
              sizes={config.imageSizes}
              src={`${constants.vercelBlobStorageUrl}/${mainImage}`}
            />
            <div
              className={`absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent opacity-0 transition-opacity group-hover/card:opacity-100`}
            />
          </div>
        )}

        {hasImage && !mainImage && variant.startsWith("masonry") && (
          <div className={config.imageContainerClasses}>
            <div className={`from-primary/10 to-secondary/10 flex h-full items-center justify-center bg-linear-to-br`}>
              <Calendar className="text-neutral opacity-30" size={48} />
            </div>
            <div
              className={`absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent opacity-0 transition-opacity group-hover/card:opacity-100`}
            />
          </div>
        )}

        <div className={config.contentClasses}>
          <div className="flex-1">
            <CardHeader event={event} hideUntilHover={!isMobile} />

            <h3 className={config.titleClasses}>{title}</h3>

            {config.showDescription && description && (
              <RichText className={clsx(`prose dark:prose-invert max-w-none`, config.descriptionClasses)}>
                {variant.startsWith("list") ? truncatedDescription : description}
              </RichText>
            )}
          </div>

          {(variant === "masonry-full" || (variant === "masonry-half" && !hasImage)) && (
            <CardMetadata event={event} hideUntilHover variant={variant.startsWith("list") ? "list" : "grid"} />
          )}
          <CardFooter event={event} hideUntilHover={!isMobile} isInsideLink />
        </div>
      </CardWrapper>
    </Card>
  );
};
