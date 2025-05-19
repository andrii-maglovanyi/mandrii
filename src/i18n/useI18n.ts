import { useLocale, useTranslations } from "next-intl";

import { routing } from "./routing";

export const useI18n = () => {
  const locale = useLocale();

  const t = useTranslations();

  if (locale === routing.defaultLocale) {
    return (key: string) => key;
  }

  return t;
};
