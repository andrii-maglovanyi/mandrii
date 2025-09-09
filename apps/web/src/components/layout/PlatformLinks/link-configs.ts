import { IconSize, IconType } from "~/components/ui/SvgIcon/SvgIcon";

export interface PlatformLinkProps {
  href: string;
  label: string;
  size?: keyof typeof IconSize;
  type: IconType;
}

export const SOCIAL_LINKS: Array<PlatformLinkProps> = [
  {
    href: "https://www.youtube.com/@m.andrii",
    label: "YouTube",
    type: "youtube",
  },
  {
    href: "https://t.me/m_andrii_ua",
    label: "Telegram",
    type: "telegram",
  },
  {
    href: "https://www.instagram.com/m.andrii.ua",
    label: "Instagram",
    type: "instagram",
  },
];

export const SUPPORT_LINKS: Array<PlatformLinkProps> = [
  {
    href: "https://patreon.com/Mandrii",
    label: "Patreon",
    type: "patreon",
  },
  {
    href: "https://buymeacoffee.com/mandrii",
    label: "Buy Me a Coffee",
    type: "buymeacoffee",
  },
];
