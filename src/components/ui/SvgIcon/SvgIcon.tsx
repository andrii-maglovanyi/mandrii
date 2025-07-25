export const svgImportKeys = [
  "google",
  "buymeacoffee",
  "instagram",
  "patreon",
  "telegram",
  "youtube",
] as const;

export type IconType = (typeof svgImportKeys)[number];

export const IconSize = {
  large: "32px",
  medium: "24px",
  small: "16px",
} as const;

interface SvgIconProps {
  "data-testid"?: string;
  id: IconType;
  size?: keyof typeof IconSize;
}

export function SvgIcon({
  "data-testid": testId = "svg-icon",
  id,
  size = "medium",
}: Readonly<SvgIconProps>) {
  return (
    <svg
      aria-hidden="true"
      data-testid={testId}
      style={{ height: IconSize[size], width: IconSize[size] }}
    >
      <use
        data-testid={`${testId}-presentation`}
        href={`/static/sprite.svg#${id}`}
      />
    </svg>
  );
}
