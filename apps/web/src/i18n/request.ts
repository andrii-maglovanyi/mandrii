import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { normalizeTranslationMessages } from "./normalizeTranslationMessages";
import { routing } from "./routing";

const messagesByLocale = new Map<string, Record<string, unknown>>();

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // If using the default locale, no need to load translations
  if (locale === routing.defaultLocale) {
    return { locale, messages: {} };
  }

  // Only load messages for non-default locales
  let messages = messagesByLocale.get(locale);

  if (!messages) {
    messages = normalizeTranslationMessages((await import(`../../translations/${locale}.json`)).default);
    messagesByLocale.set(locale, messages);
  }

  return { locale, messages };
});
