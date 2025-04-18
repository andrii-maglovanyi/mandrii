"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/Button/Button";
import { useLanguage } from "@/hooks/useLanguage";

export const CookieConsentBar = () => {
  const { dict } = useLanguage();

  const [isPanelClosed, setIsPanelClosed] = useState(true);

  useEffect(() => {
    setIsPanelClosed(Boolean(localStorage.getItem("mndr.gdpr-panel-closed")));
  }, []);

  const consentCookie = () => {
    setIsPanelClosed(true);
    localStorage.setItem("mndr.gdpr-panel-closed", "true");
  };

  return isPanelClosed ? null : (
    <div
      className={`
        bg-primary-900 animate-slide-in fixed right-0 bottom-0 left-0 w-full p-3
        text-center text-white
      `}
      style={{ zIndex: 10 }}
    >
      <div className="container mx-auto flex items-center justify-center gap-2">
        <span>{dict["Cookies are used."]}</span>
        <Link href="/how-i-use-cookies" className="!text-ukraine-yellow">
          {dict["What does it mean?"]}
        </Link>
        <Button
          className={`
            fill-primary-0 absolute right-2
            hover:bg-primary-700
            dark:hover:bg-primary-700
          `}
          icon="close-small-solid"
          onClick={consentCookie}
          aria-label="Close cookie consent bar"
        />
      </div>
    </div>
  );
};
