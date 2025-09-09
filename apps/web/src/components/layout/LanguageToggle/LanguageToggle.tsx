"use client";

import { useLocale } from "next-intl";

import { ActionButton } from "~/components/ui";
import { usePathname, useRouter } from "~/i18n/navigation";
import { sendToMixpanel } from "~/lib/mixpanel";

export function LanguageToggle({ "data-testid": testId = "language-toggle" }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const nextLocale = locale === "en" ? "uk" : "en";
  const label = locale === "en" ? "Переключити на українську" : "Switch to English";

  const handleClick = () => {
    sendToMixpanel("Toggled Language", { language: nextLocale });
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <ActionButton
      aria-label={label}
      data-testid={testId}
      icon={<span className="text-base font-semibold uppercase">{nextLocale}</span>}
      onClick={handleClick}
      variant="ghost"
    />
  );
}
