"use client";

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

export function MobileLayout({ navLinks }: Readonly<{ navLinks: React.ReactNode }>) {
  const [openPath, setOpenPath] = useState<null | string>(null);
  const i18n = useI18n();
  const pathname = usePathname();
  const isOpen = openPath === pathname;
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (isOpen && !element?.open) element?.showModal();
    else if (!isOpen && element?.open) element.close();
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  return (
    <>
      <header className={`
        relative z-40 flex min-h-16 shrink-0 items-center justify-between px-4
        pt-[env(safe-area-inset-top)] shadow-md
      `}>
        <ActionButton
          aria-controls="mobile-menu"
          aria-expanded={isOpen}
          aria-label={i18n("Open menu")}
          data-testid="mobile-menu-toggle"
          icon={<Menu />}
          onClick={() => setOpenPath(pathname)}
          variant="ghost"
        />
        <Logo />
        {envName !== "production" ? <CartButton /> : <span className="w-11" />}
      </header>
      <dialog
        aria-label={i18n("Navigation menu")}
        className={`
          fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto
          overscroll-contain bg-surface p-4
          pt-[max(1rem,env(safe-area-inset-top))]
          pb-[max(1rem,env(safe-area-inset-bottom))] text-on-surface
        `}
        id="mobile-menu"
        onCancel={(event) => {
          event.preventDefault();
          setOpenPath(null);
        }}
        ref={dialog}
      >
        <div className="flex justify-end">
          <ActionButton
            aria-label={i18n("Close menu")}
            icon={<X />}
            onClick={() => setOpenPath(null)}
            variant="ghost"
          />
        </div>
        <nav
          className="flex flex-col gap-3 px-2 py-4 text-xl"
          onClick={(event) => {
            if ((event.target as Element).closest("a[href]")) setOpenPath(null);
          }}
        >
          <MobileAuth>{navLinks}</MobileAuth>
          <Separator variant="margin" />
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            {envName !== "production" && <CartButton onClick={() => setOpenPath(null)} />}
            <LoveButton onClick={() => setOpenPath(null)} />
            <ThemeToggle data-testid="theme-toggle-mobile" />
            <LanguageToggle data-testid="language-toggle-mobile" />
          </div>
        </nav>
      </dialog>
    </>
  );
}
