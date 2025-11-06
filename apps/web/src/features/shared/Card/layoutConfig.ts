import clsx from "clsx";

export interface LayoutConfig {
  containerClasses: string;
  contentClasses: string;
  descriptionClasses: string;
  imageContainerClasses: string;
  imageSizes: string;
  innerContainerClasses: string;
  showDescription: boolean;
  titleClasses: string;
}

export type LayoutVariant = "list" | "masonry-full" | "masonry-half" | "masonry-small" | "masonry-third";

/**
 * Base card styles shared across all variants.
 */
export const baseCardClasses = clsx(
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
export const getLayoutConfig = (variant: LayoutVariant, hasImage: boolean): LayoutConfig => {
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
      "text-lg sm:text-xl text-primary mb-2 line-clamp-1 font-bold transition-colors group-hover/card:underline",
  };
};
