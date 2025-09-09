import { getTranslations } from "next-intl/server";

import { getTemplate } from "./getTemplate";
import { routing } from "./routing";

interface GetI18nParams {
  locale: string;
}
export const getI18n = async ({ locale }: GetI18nParams) => {
  // For the default locale, skip translation and just return the key as-is
  if (locale === routing.defaultLocale) {
    return getTemplate;
  }

  const t = await getTranslations({ locale });

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
