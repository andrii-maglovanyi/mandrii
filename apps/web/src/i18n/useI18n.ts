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

      // Normalize dotted keys to work around `next-intl` nesting limitations
      const normalizedKey = key.replaceAll(".", "_");

      try {
        return t(normalizedKey, options);
      } catch {
        return getTemplate(key, options);
      }
    },
    [locale, t],
  );
};
