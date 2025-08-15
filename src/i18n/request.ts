import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // If using the default locale, no need to load translations
  if (locale === routing.defaultLocale) {
    return { locale, messages: {} };
  }

  // Only load messages for non-default locales
  const messages = (await import(`../../translations/${locale}.json`)).default;

  return { locale, messages };
});
