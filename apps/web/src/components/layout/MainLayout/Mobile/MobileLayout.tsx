"use client";

import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ActionButton, Separator } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { envName } from "~/lib/config/env";

import { MobileAuth } from "../../Auth/MobileAuth";
import { CartButton } from "../../CartButton/CartButton";
import { LanguageToggle } from "../../LanguageToggle/LanguageToggle";
import { LoveButton } from "../../LoveButton/LoveButton";
import { ThemeToggle } from "../../ThemeToggle/ThemeToggle";
import { Logo } from "../Logo";

const AnimatedIconSwap = ({ isOpen }: { isOpen: boolean }) => (
  <span className={`
    relative inline-block h-6 w-6 transition-transform duration-300
  `}>
    <Menu
      className={clsx(
        "absolute inset-0 transition-transform duration-300",
        isOpen ? "scale-0 rotate-90" : "scale-100 rotate-0",
      )}
    />
    <X
      className={clsx(
        "absolute inset-0 transition-transform duration-300",
        isOpen ? "scale-100 rotate-0" : "scale-0 -rotate-90",
      )}
    />
  </span>
);

type MobileLayoutProps = {
  navLinks: React.ReactNode;
};

export function MobileLayout({ navLinks }: Readonly<MobileLayoutProps>) {
  const [openPath, setOpenPath] = useState<null | string>(null);
  const navigationRef = useRef<HTMLDivElement>(null);
  const i18n = useI18n();
  const pathname = usePathname();
  const [previousPath, setPreviousPath] = useState(pathname);
  if (previousPath !== pathname) {
    setPreviousPath(pathname);
    setOpenPath(null);
  }

  const isOpen = openPath === pathname;

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      // A sign-in or other modal opened from the menu owns its keyboard events.
      if (document.querySelector("dialog[open]")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setOpenPath(null);
        navigationRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
      if (event.key === "Tab") {
        const controls = Array.from(navigationRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), [tabindex="0"]',
        ) ?? []).filter((element) => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || !navigationRef.current?.contains(document.activeElement))) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !navigationRef.current?.contains(document.activeElement))) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={navigationRef}>
      <header className={`
        relative z-50 flex h-16 items-center justify-between px-4 shadow-md
      `}>
        <span className="absolute left-1/2 -translate-x-1/2 transform">
          <Logo />
        </span>

        <>
          <ActionButton
            aria-controls="mobile-menu"
            aria-expanded={isOpen}
            aria-label={isOpen ? i18n("Close menu") : i18n("Open menu")}
            className="min-h-11 min-w-11"
            data-testid="mobile-menu-toggle"
            icon={<AnimatedIconSwap isOpen={isOpen} />}
            onClick={() => setOpenPath(isOpen ? null : pathname)}
            tooltipPosition="bottom-start"
            variant="ghost"
          />
          {envName !== "production" && <div className={`
            [&_button]:min-h-11 [&_button]:min-w-11
          `}><CartButton /></div>}
        </>
      </header>

      <div
        aria-hidden={!isOpen}
        className={clsx(
          `
            fixed top-0 left-0 z-40 h-full w-full transform overflow-hidden py-4
            transition-transform duration-300
          `,
          "bg-surface",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        id="mobile-menu"
        inert={!isOpen}
        style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        <nav aria-label={i18n("Navigation menu")} className={`
          mt-16 flex max-h-[calc(100dvh-5rem)] flex-col space-y-1
          overflow-y-auto p-6 pb-12 text-xl
          sm:space-y-2
          md:space-y-3
        `} onClickCapture={(event) => {
          if ((event.target as Element).closest("a[href]")) {
            // A dialog opened by this link should restore focus to a visible control.
            navigationRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
            setOpenPath(null);
          }
        }}>
          <MobileAuth>{navLinks}</MobileAuth>
          <Separator variant="margin" />

          <div className={`
            mt-4 flex justify-end space-x-2
            [&_button]:min-h-11 [&_button]:min-w-11
          `}>
            <LoveButton onClick={() => setOpenPath(null)} />
            <ThemeToggle data-testid="theme-toggle-mobile" />
            <LanguageToggle data-testid="language-toggle-mobile" />
          </div>
        </nav>
      </div>

    </div>
  );
}
