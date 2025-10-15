import { useLocale, useTranslations } from "next-intl";
import { useCallback } from "react";

import { getTemplate } from "./getTemplate";
import { routing } from "./routing";

export const useI18n = () => {
  const locale = useLocale();
  const t = useTranslations();

  return useCallback(
    (key: string, options?: Record<string, Date | number | string>) => {
      // Skip translation for default locale
      if (locale === routing.defaultLocale) {
        return getTemplate(key, options);
      }

      // Try normal key first
      const translated = t(key, { ...options, fallback: key });

      // If translation returns key itself, try normalized version (replace dots)
      if (translated === key && key.includes(".")) {
        const normalizedKey = key.replace(/\./g, "_");
        const normalized = t(normalizedKey, { ...options, fallback: key });

        return normalized === normalizedKey ? getTemplate(key, options) : normalized;
      }

      return translated;
    },
    [locale, t],
  );
};
