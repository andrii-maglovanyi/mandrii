"use client";

import clsx from "clsx";
import { MapPin } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useMediaQuery } from "react-responsive";

import { Card, RichText } from "~/components/ui";
import { constants } from "~/lib/constants";
import { GetPublicVenuesQuery, Locale } from "~/types";

import { getLayoutConfig, LayoutVariant } from "../../shared/Card/layoutConfig";
import { CardFooter } from "./Components/CardFooter";
import { CardHeader } from "./Components/CardHeader";
import { CardMetadata } from "./Components/CardMetadata";

interface CardBaseProps {
  hasImage?: boolean;
  showFlag?: boolean;
  variant: LayoutVariant;
  venue: GetPublicVenuesQuery["venues"][number];
}

export const CardBase = ({ hasImage = false, showFlag, variant, venue }: CardBaseProps) => {
  const locale = useLocale() as Locale;

  const description = (locale === "uk" ? venue.description_uk : venue.description_en) || "";
  const truncatedDescription = description.length > 120 ? `${description.substring(0, 120)}...` : description;
  const mainImage = venue.logo ?? venue.chain?.logo ?? venue.chain?.chain?.logo ?? venue.images?.[0];
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  const config = getLayoutConfig(variant, hasImage);

  const CardWrapper = variant.startsWith("list") ? "article" : "div";

  return (
    <Card className={config.containerClasses} href={`/venues/${venue.slug}`}>
      <CardWrapper className={config.innerContainerClasses}>
        {hasImage && mainImage && (
          <div className={config.imageContainerClasses}>
            <Image
              alt={venue.name}
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
              <MapPin className="text-neutral opacity-30" size={48} />
            </div>
            <div
              className={`absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent opacity-0 transition-opacity group-hover/card:opacity-100`}
            />
          </div>
        )}

        <div className={config.contentClasses}>
          <div className="flex-1">
            <CardHeader hideUntilHover={!isMobile} venue={venue} />

            <h3 className={config.titleClasses}>{venue.name}</h3>

            {venue.address && (
              <div className="text-neutral mb-2 flex items-start gap-1 text-sm">
                <MapPin className="mt-0.5 shrink-0" size={16} />
                <span className={variant.startsWith("list") ? "line-clamp-1" : `line-clamp-2`}>{venue.address}</span>
              </div>
            )}

            {config.showDescription && description && (
              <RichText className={clsx(`prose dark:prose-invert max-w-none`, config.descriptionClasses)}>
                {variant.startsWith("list") ? truncatedDescription : description}
              </RichText>
            )}
          </div>

          {variant === "masonry-full" ||
            (variant === "masonry-half" && !hasImage && (
              <CardMetadata hideUntilHover variant={variant.startsWith("list") ? "list" : "grid"} venue={venue} />
            ))}
          <CardFooter hideUntilHover={!isMobile} isInsideLink showFlag={showFlag} venue={venue} />
        </div>
      </CardWrapper>
    </Card>
  );
};
