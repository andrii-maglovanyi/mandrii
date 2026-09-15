"use client";

import clsx from "clsx";
import { MapPin } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useMediaQuery } from "react-responsive";

import { Card, RichText } from "~/components/ui";
import { constants } from "~/lib/constants";
import { sendToMixpanel } from "~/lib/mixpanel";
import { GetPublicVenuesQuery, Locale } from "~/types";

import { getLayoutConfig, LayoutVariant } from "../../shared/Card/layoutConfig";
import { CardFooter } from "./Components/CardFooter";
import { CardHeader } from "./Components/CardHeader";

interface CardBaseProps {
  analyticsSource?: string;
  hasImage?: boolean;
  showFlag?: boolean;
  variant: LayoutVariant;
  venue: GetPublicVenuesQuery["venues"][number];
}

export const CardBase = ({ analyticsSource = "card", hasImage = false, showFlag, variant, venue }: CardBaseProps) => {
  const locale = useLocale() as Locale;

  const description = (locale === "uk" ? venue.description_uk : venue.description_en) || "";
  const location = [venue.city, venue.country].filter(Boolean).join(", ") || venue.address;
  const mainImage = venue.logo || venue.chain?.logo || venue.chain?.chain?.logo || venue.images?.[0];
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  const config = getLayoutConfig(variant, hasImage);

  const CardWrapper = variant.startsWith("list") ? "article" : "div";

  return (
    <Card
      className={config.containerClasses}
      href={`/venues/${venue.slug}`}
      linkLabel={venue.name}
      onLinkClick={() => sendToMixpanel("Opened Venue", { slug: venue.slug, source: analyticsSource, variant })}
    >
      <CardWrapper className={config.innerContainerClasses}>
        {hasImage && mainImage && (
          <div className={config.imageContainerClasses}>
            <Image
              alt={venue.name}
              className={`
                object-cover transition-transform duration-300
                group-hover/card:scale-110
              `}
              fill
              sizes={config.imageSizes}
              src={`${constants.vercelBlobStorageUrl}/${mainImage}`}
            />
            <div
              className={`
                absolute inset-0 bg-linear-to-t from-black/40 via-black/10
                to-transparent opacity-0 transition-opacity
                group-hover/card:opacity-100
              `}
            />
          </div>
        )}

        {hasImage && !mainImage && variant.startsWith("masonry") && (
          <div className={config.imageContainerClasses}>
            <div className={`
              flex h-full items-center justify-center bg-linear-to-br
              from-primary/10 to-secondary/10
            `}>
              <MapPin className="text-neutral opacity-30" size={48} />
            </div>
            <div
              className={`
                absolute inset-0 bg-linear-to-t from-black/40 via-black/10
                to-transparent opacity-0 transition-opacity
                group-hover/card:opacity-100
              `}
            />
          </div>
        )}

        <div className={config.contentClasses}>
          <div className="min-w-0 flex-1">
            <CardHeader hideUntilHover={!isMobile} venue={venue} />

            <h3 className={config.titleClasses}>{venue.name}</h3>

            {location && (
              <div className="mb-2 flex items-start gap-1 text-sm text-neutral">
                <MapPin className="mt-0.5 shrink-0" size={16} />
                <span className={`
                  min-w-0
                  [overflow-wrap:anywhere]
                `}>{location}</span>
              </div>
            )}

            {variant === "masonry-full" && config.showDescription && description && (
              <RichText className={clsx(`
                prose max-w-none
                dark:prose-invert
              `, config.descriptionClasses)}>
                {description}
              </RichText>
            )}
          </div>

          <CardFooter hideUntilHover={!isMobile} isInsideLink showFlag={showFlag} venue={venue} />
        </div>
      </CardWrapper>
    </Card>
  );
};
