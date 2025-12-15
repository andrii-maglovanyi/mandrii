import {
  BedDouble,
  Book,
  Briefcase,
  Building,
  CalendarHeart,
  ChefHat,
  Church,
  Clapperboard,
  Coffee,
  Crown,
  GalleryHorizontal,
  Gift,
  Globe,
  GraduationCap,
  Heart,
  Hospital,
  LifeBuoy,
  Lightbulb,
  Megaphone,
  Music,
  Package,
  Palette,
  PartyPopper,
  Scale,
  ShoppingBag,
  ShoppingCart,
  Star,
  Trophy,
  Users,
  Utensils,
  Wand2,
} from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

const ICONS = {
  BedDouble,
  Book,
  Briefcase,
  Building,
  CalendarHeart,
  ChefHat,
  Church,
  Clapperboard,
  Coffee,
  Crown,
  GalleryHorizontal,
  Gift,
  Globe,
  GraduationCap,
  Heart,
  Hospital,
  LifeBuoy,
  Lightbulb,
  Megaphone,
  Music,
  Package,
  Palette,
  PartyPopper,
  Scale,
  ShoppingBag,
  ShoppingCart,
  Star,
  Trophy,
  Users,
  Utensils,
  Wand2,
} as const;

export type IconName = keyof typeof ICONS;

export function getIcon(
  iconName: IconName,
  props: { asString: true; size?: number } & React.SVGProps<SVGSVGElement>,
): string;
export function getIcon(
  iconName: IconName,
  props?: { asString?: false; size?: number } & React.SVGProps<SVGSVGElement>,
): null | React.ReactElement;

export function getIcon(
  iconName: IconName,
  props?: { asString?: boolean; size?: number } & React.SVGProps<SVGSVGElement>,
): null | React.ReactElement | string {
  const IconComponent = ICONS[iconName];

  if (!IconComponent) return null;

  const { asString, size = 16, ...restProps } = props || {};
  const element = <IconComponent size={size} {...restProps} />;

  if (asString) {
    return renderToStaticMarkup(element);
  }

  return element;
}
