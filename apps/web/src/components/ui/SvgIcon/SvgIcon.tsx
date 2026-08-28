import { siBuymeacoffee, siFacebook, siGoogle, siInstagram, siPatreon, siTelegram, siYoutube } from "simple-icons";

export const svgImportKeys = [
  "google",
  "buymeacoffee",
  "facebook",
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
  className?: string;
  "data-testid"?: string;
  id: IconType;
  size?: keyof typeof IconSize;
}

const icons = {
  buymeacoffee: siBuymeacoffee,
  facebook: siFacebook,
  google: siGoogle,
  instagram: siInstagram,
  patreon: siPatreon,
  telegram: siTelegram,
  youtube: siYoutube,
} satisfies Record<IconType, { path: string }>;

export function SvgIcon({
  className,
  "data-testid": testId = "svg-icon",
  id,
  size = "medium",
}: Readonly<SvgIconProps>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      data-testid={testId}
      fill="currentColor"
      role="img"
      style={{ height: IconSize[size], width: IconSize[size] }}
      viewBox="0 0 24 24"
    >
      <path d={icons[id].path} data-testid={`${testId}-presentation`} />
    </svg>
  );
}
