import {
  Book,
  Building,
  ChefHat,
  Church,
  Coffee,
  GalleryHorizontal,
  GraduationCap,
  Hospital,
  Music,
  ShoppingCart,
  Utensils,
  Wand2,
} from "lucide-react";

const ICONS = {
  Book,
  Building,
  ChefHat,
  Church,
  Coffee,
  GalleryHorizontal,
  GraduationCap,
  Hospital,
  Music,
  ShoppingCart,
  Utensils,
  Wand2,
} as const;

export type IconName = keyof typeof ICONS;

export function getIcon(iconName: IconName, props?: { size?: number } & React.SVGProps<SVGSVGElement>) {
  const IconComponent = ICONS[iconName];
  return IconComponent ? <IconComponent {...props} /> : null;
}
