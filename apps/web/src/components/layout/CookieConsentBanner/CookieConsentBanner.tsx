"use client";

import { Cookie } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import { Button } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { localStore } from "~/lib/utils";

export default function CookieConsentBanner() {
  const [dismissed, setDismissed] = useState(false);
  const visible = useSyncExternalStore(subscribeConsent, needsConsent, () => false) && !dismissed;
  const i18n = useI18n();

  const handleAccept = () => {
    try { localStore.set("cookie_consent", "true"); } catch { /* Still dismiss for this visit if storage is blocked. */ }
    setDismissed(true);
  };

  if (!visible) return null;

  return (
    <div
      className={`
        fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 flex
        w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 flex-col items-center
        justify-between rounded-lg bg-surface px-6 py-3 text-sm text-on-surface
        shadow-lg
        lg:flex-row
      `}
    >
      <div className={`
        mb-2 flex items-center text-pretty
        lg:mr-8 lg:mb-0
      `}>
        <Cookie className="mr-2 shrink-0" />
        <span className="flex-1 wrap-break-word">{i18n("I use cookies to make your visit smoother")}</span>
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
function needsConsent() {
  try { return !localStore.get("cookie_consent"); } catch { return true; }
}

function subscribeConsent(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
