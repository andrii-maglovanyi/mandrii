import { useLocale, useTranslations } from "next-intl";

import { getTemplate } from "./getTemplate";
import { routing } from "./routing";

// Custom i18n hook that supports plain text translation keys with dots
// (e.g. "Loading your session...")
export const useI18n = () => {
  const locale = useLocale();
  const t = useTranslations();

  // For the default locale, skip translation and just return the key as-is
  if (locale === routing.defaultLocale) {
    return getTemplate;
  }

  return (key: string, options?: Record<string, Date | number | string>) => {
    // Normalize dotted keys to work around `next-intl` nesting limitations
    const normalizedKey = key.replace(/\./g, "_");

    try {
      return t(normalizedKey, options);
    } catch {
      return getTemplate(key, options);
    }
  };
};
