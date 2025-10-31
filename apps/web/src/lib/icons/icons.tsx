import {
  BedDouble,
  Book,
  Building,
  ChefHat,
  Church,
  Coffee,
  GalleryHorizontal,
  Globe,
  GraduationCap,
  Hospital,
  Music,
  ShoppingCart,
  Utensils,
  Wand2,
} from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

const ICONS = {
  BedDouble,
  Book,
  Building,
  ChefHat,
  Church,
  Coffee,
  GalleryHorizontal,
  Globe,
  GraduationCap,
  Hospital,
  Music,
  ShoppingCart,
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

  const element = <IconComponent {...props} />;

  if (props?.asString) {
    return renderToStaticMarkup(element);
  }

  return element;
}
