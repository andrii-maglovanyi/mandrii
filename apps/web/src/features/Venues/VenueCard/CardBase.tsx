"use client";

import clsx from "clsx";
import { MapPin } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useMediaQuery } from "react-responsive";

import { Card } from "~/components/ui";
import { constants } from "~/lib/constants";
import { GetPublicVenuesQuery, Locale } from "~/types";

import { CardFooter } from "./Components/CardFooter";
import { CardHeader } from "./Components/CardHeader";
import { CardMetadata } from "./Components/CardMetadata";

interface CardBaseProps {
  hasImage?: boolean;
  variant: LayoutVariant;
  venue: GetPublicVenuesQuery["venues"][number];
}

interface LayoutConfig {
  containerClasses: string;
  contentClasses: string;
  descriptionClasses: string;
  imageContainerClasses: string;
  imageSizes: string;
  innerContainerClasses: string;
  showDescription: boolean;
  titleClasses: string;
}

type LayoutVariant = "list" | "masonry-full" | "masonry-half" | "masonry-small" | "masonry-third";

/**
 * Base card styles shared across all variants.
 */
const baseCardClasses = clsx(
  "relative flex overflow-hidden rounded-xl border border-primary/0",
  "group/card bg-surface-tint/50 transition-all duration-300",
  `
    no-underline
    hover:border-primary/20 hover:shadow-lg
  `,
);

/**
 * Masonry variant configurations.
 */
const masonryVariants = {
  "masonry-full": {
    containerClasses: clsx(
      baseCardClasses,
      `
        col-span-1 min-h-[300px]
        sm:col-span-2
        lg:col-span-4
      `,
    ),
    descriptionClasses: "text-neutral text-sm line-clamp-3",
    imageClasses: { horizontal: "h-full min-h-[300px] w-full sm:w-2/5", vertical: "h-48 w-full sm:h-56" },
    imageSizes: "(max-width: 768px) 100vw, 40vw",
    minHeight: "min-h-[300px]",
    showDescription: true,
    titleClasses: "text-xl sm:text-2xl",
  },
  "masonry-half": {
    containerClasses: clsx(
      baseCardClasses,
      `
        col-span-1 min-h-[300px]
        sm:col-span-2
        lg:col-span-2
      `,
    ),
    descriptionClasses: "text-neutral text-sm line-clamp-2",
    imageClasses: { horizontal: "h-full min-h-[300px] w-full sm:w-1/2", vertical: "h-44 w-full sm:h-52" },
    imageSizes: "(max-width: 768px) 100vw, 50vw",
    minHeight: "min-h-[300px]",
    showDescription: true,
    titleClasses: "text-lg sm:text-xl",
  },
  "masonry-small": {
    containerClasses: clsx(baseCardClasses, "col-span-1 min-h-[220px]"),
    descriptionClasses: "text-neutral text-sm line-clamp-2",
    imageClasses: { horizontal: "", vertical: "h-40 w-full sm:h-48" },
    imageSizes: "(max-width: 768px) 100vw, 33vw",
    minHeight: "min-h-[220px]",
    showDescription: false,
    titleClasses: "text-base sm:text-lg",
  },
  "masonry-third": {
    containerClasses: clsx(baseCardClasses, "col-span-1 min-h-[260px]"),
    descriptionClasses: "text-neutral text-sm line-clamp-2",
    imageClasses: { horizontal: "", vertical: "h-44 w-full sm:h-52" },
    imageSizes: "(max-width: 768px) 100vw, 33vw",
    minHeight: "min-h-[260px]",
    showDescription: false,
    titleClasses: "text-base sm:text-lg",
  },
} as const;

/**
 * Get layout configuration based on variant.
 *
 * @param {LayoutVariant} variant - The layout variant to use.
 * @param {boolean} hasImage - Whether the card has an image.
 * @returns {LayoutConfig} The layout configuration.
 */
const getLayoutConfig = (variant: LayoutVariant, hasImage: boolean): LayoutConfig => {
  if (variant.startsWith("masonry")) {
    const config = masonryVariants[variant as keyof typeof masonryVariants];
    const isMasonryVertical =
      variant === "masonry-small" || variant === "masonry-third" || (variant.startsWith("masonry") && !hasImage);

    return {
      containerClasses: config.containerClasses,
      contentClasses: clsx("flex flex-1 flex-col p-4", {
        "gap-2": isMasonryVertical,
        "justify-between p-4": !isMasonryVertical,
      }),
      descriptionClasses: config.descriptionClasses,
      imageContainerClasses: clsx("relative flex-shrink-0 overflow-hidden", {
        [config.imageClasses.horizontal]: !isMasonryVertical,
        [config.imageClasses.vertical]: isMasonryVertical,
      }),
      imageSizes: config.imageSizes,
      innerContainerClasses: clsx("flex h-full w-full", config.minHeight, {
        "flex-col": isMasonryVertical,
        "flex-row": !isMasonryVertical && hasImage,
      }),
      showDescription: config.showDescription,
      titleClasses: clsx(
        `
          mb-2 line-clamp-2 font-bold text-primary transition-colors
          group-hover/card:underline
        `,
        config.titleClasses,
      ),
    };
  }

  return {
    containerClasses: clsx(baseCardClasses, "flex flex-row"),
    contentClasses: "flex flex-1 flex-col gap-2 p-4",
    descriptionClasses: "text-neutral text-sm line-clamp-3",
    imageContainerClasses: "bg-neutral/5 relative overflow-hidden max-h-64 min-h-48 max-w-64 min-w-48 flex-shrink-0",
    imageSizes: "256px",
    innerContainerClasses: "w-full flex",
    showDescription: true,
    titleClasses:
      "text-lg sm:text-xl group-hover/card:text-primary mb-2 line-clamp-1 font-bold transition-colors group-hover/card:underline",
  };
};

/**
 * Base venue card component with configurable layouts.
 *
 * @param {CardBaseProps} props - Component props.
 * @returns {JSX.Element} The venue card.
 */
export const CardBase = ({ hasImage = false, variant, venue }: CardBaseProps) => {
  const locale = useLocale() as Locale;

  const description = (locale === "uk" ? venue.description_uk : venue.description_en) || "";
  const truncatedDescription = description.length > 120 ? `${description.substring(0, 120)}...` : description;
  const mainImage = venue.logo ?? venue.images?.[0];
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
            <div
              className={`
                flex h-full items-center justify-center bg-gradient-to-br
                from-primary/10 to-secondary/10
              `}
            >
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
          <div className="flex-1">
            <CardHeader hideUntilHover={!isMobile} venue={venue} />

            <h3 className={config.titleClasses}>{venue.name}</h3>

            {venue.address && (
              <div className="mb-2 flex items-start gap-1 text-sm text-neutral">
                <MapPin className="mt-0.5 shrink-0" size={16} />
                <span className={variant.startsWith("list") ? "line-clamp-1" : `
                  line-clamp-2
                `}>{venue.address}</span>
              </div>
            )}

            {config.showDescription && description && (
              <p className={config.descriptionClasses}>
                {variant.startsWith("list") ? truncatedDescription : description}
              </p>
            )}
          </div>

          {variant === "masonry-full" ||
            (variant === "masonry-half" && !hasImage && (
              <CardMetadata hideUntilHover variant={variant.startsWith("list") ? "list" : "grid"} venue={venue} />
            ))}
          <CardFooter hideUntilHover={!isMobile} isInsideLink venue={venue} />
        </div>
      </CardWrapper>
    </Card>
  );
};
