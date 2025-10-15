import { Locale as DateLocale } from "date-fns";
import { enGB, uk } from "date-fns/locale";
import { Locale } from "next-intl";

const localeMap: Record<Locale, DateLocale> = {
  en: enGB,
  uk: uk,
};

export const toDateLocale = (locale: Locale): DateLocale => {
  return localeMap[locale] ?? enGB;
};
