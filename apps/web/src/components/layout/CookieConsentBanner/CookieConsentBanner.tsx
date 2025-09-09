"use client";

import { Cookie } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { storage } from "~/lib/utils/storage";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const i18n = useI18n();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const accepted = storage.get("cookie_consent");
      setVisible(!accepted);
    }
  }, []);

  const handleAccept = () => {
    storage.set("cookie_consent", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={`
        fixed bottom-4 left-1/2 z-50 flex min-w-max -translate-x-1/2 flex-col
        items-center justify-between rounded-lg bg-surface px-6 py-3 text-sm
        text-on-surface shadow-lg
        lg:flex-row
      `}
    >
      <div className={`
        mb-2 flex items-center text-pretty
        lg:mr-8 lg:mb-0
      `}>
        <Cookie className="mr-2" />
        <span className="flex-1 break-words">{i18n("I use cookies to make your visit smoother")}</span>
      </div>
      <div className="flex w-fit items-center text-right">
        <Link className="mr-4 text-nowrap" href="/about-cookies">
          {i18n("What does it mean?")}
        </Link>
        <Button onClick={handleAccept} size="sm">
          {i18n("Accept")}
        </Button>
      </div>
    </div>
  );
}
