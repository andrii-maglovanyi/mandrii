/** Map of color names to their hex values */
export const COLOR_MAP: Record<string, string> = {
  beige: "#F5F5DC",
  black: "#1a1a1a",
  blue: "#3B82F6",
  brown: "#8B4513",
  burgundy: "#800020",
  charcoal: "#36454F",
  coral: "#FF7F50",
  cream: "#FFFDD0",
  forest: "#228B22",
  gold: "#FFD700",
  gray: "#6B7280",
  green: "#22C55E",
  grey: "#6B7280",
  heather: "#9CA3AF",
  indigo: "#4F46E5",
  ivory: "#FFFFF0",
  khaki: "#C3B091",
  lavender: "#E6E6FA",
  maroon: "#800000",
  mint: "#98FB98",
  mustard: "#FFDB58",
  navy: "#1E3A5F",
  olive: "#808000",
  orange: "#F97316",
  peach: "#FFCBA4",
  pink: "#EC4899",
  plum: "#8E4585",
  purple: "#A855F7",
  red: "#EF4444",
  rose: "#FF007F",
  rust: "#B7410E",
  sage: "#9CAF88",
  sand: "#C2B280",
  silver: "#C0C0C0",
  sky: "#87CEEB",
  slate: "#708090",
  tan: "#D2B48C",
  teal: "#14B8A6",
  terracotta: "#E2725B",
  turquoise: "#40E0D0",
  violet: "#8B5CF6",
  white: "#FFFFFF",
  wine: "#722F37",
  yellow: "#EAB308",
};

/** Light colors that need a border to be visible */
export const LIGHT_COLORS = ["#FFFFFF", "#FFFFF0", "#FFFDD0", "#F5F5DC", "#E6E6FA"];

/**
 * Get the hex color for a color name, supporting compound names like "dark navy".
 *
 * @param colorName - The color name to look up
 * @returns The hex color value, or a neutral gray as fallback
 */
export const getColorHex = (colorName: string): string => {
  const normalized = colorName.toLowerCase().trim();

  // Direct match
  if (COLOR_MAP[normalized]) return COLOR_MAP[normalized];

  // Try to find a matching base color (e.g., "dark navy" -> "navy")
  const words = normalized.split(/\s+/);
  for (let i = words.length - 1; i >= 0; i--) {
    if (COLOR_MAP[words[i]]) return COLOR_MAP[words[i]];
  }

  // Fallback to a neutral gray
  return "#9CA3AF";
};

/**
 * Check if a color hex value is considered "light" and needs a border.
 *
 * @param colorHex - The hex color value to check
 * @returns True if the color is light
 */
export const isLightColor = (colorHex: string): boolean => {
  return LIGHT_COLORS.includes(colorHex);
};
