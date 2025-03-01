import type { BaseComponentProps, Connotations } from "../../types";

export const svgImportKeys = [
  "arrow-left-line",
  "buymeacoffee",
  "chevron-down-line",
  "email-line",
  "call-line",
  "close-line",
  "close-small-solid",
  "file-search-line",
  "fullscreen-line",
  "fullscreen-off-line",
  "google-color",
  "globe-line",
  "heart-line",
  "heart-solid",
  "chart",
  "info-line",
  "instagram",
  "life-vest",
  "patreon",
  "pin",
  "pin-line",
  "pin-solid",
  "rocket-solid",
  "share-solid",
  "sort-line",
  "sort-asc-line",
  "sort-desc-line",
  "telegram",
  "youtube",
] as const;

export type IconType = (typeof svgImportKeys)[number];

enum IconSizes {
  large = "32px",
  medium = "24px",
  small = "16px",
}

export interface IconProps extends BaseComponentProps {
  connotation?: Connotations;
  customSize?: number;
  size?: keyof typeof IconSizes;
  style?: object;
  type: IconType;
}

const connotationColors = {
  alert: "fill-alert-600",
  announcement: "fill-announcement-600",
  cta: "fill-cta-600",
  info: "fill-info-400",
  primary: "fill-primary-950 dark:fill-primary-0",
  success: "fill-success-600",
  warning: "fill-warning-300",
};

export const Icon = ({
  className,
  connotation = "primary",
  customSize,
  "data-testid": testId,
  size = "medium",
  style = {},
  type,
}: IconProps) => {
  const iconSize = customSize ? `${customSize}px` : IconSizes[size];

  return (
    <svg
      className={[
        "bg-transparent inline-block",
        className?.includes("fill-") ? "" : connotationColors[connotation],
        className ?? "",
      ]
        .join(" ")
        .trim()}
      data-testid={testId ?? `icon-${type}`}
      height={iconSize}
      style={style}
      width={iconSize}
    >
      <use xlinkHref={`/assets/sprite.svg#${type}`}></use>
    </svg>
  );
};
