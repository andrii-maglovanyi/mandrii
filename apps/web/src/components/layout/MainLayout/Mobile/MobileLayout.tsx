"use client";

import clsx from "clsx";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ActionButton, Separator } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";

import { MobileAuth } from "../../Auth/MobileAuth";
import { LanguageToggle } from "../../LanguageToggle/LanguageToggle";
import { LoveButton } from "../../LoveButton/LoveButton";
import { ThemeToggle } from "../../ThemeToggle/ThemeToggle";
import { Container } from "../Container";
import { Logo } from "../Logo";

const AnimatedIconSwap = ({ isOpen }: { isOpen: boolean }) => (
  <span className={`relative inline-block h-6 w-6 transition-transform duration-300`}>
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
  children: React.ReactNode;
  navLinks: React.ReactNode;
};

export function MobileLayout({ children, navLinks }: Readonly<MobileLayoutProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const i18n = useI18n();
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <header className={`relative z-50 flex h-16 items-center justify-end px-4 shadow-md`}>
        <span className="absolute left-1/2 -translate-x-1/2 transform">
          <Logo />
        </span>

        <ActionButton
          aria-controls="mobile-menu"
          aria-expanded={isOpen}
          aria-label={isOpen ? i18n("Close menu") : i18n("Open menu")}
          data-testid="mobile-menu-toggle"
          icon={<AnimatedIconSwap isOpen={isOpen} />}
          onClick={() => setIsOpen((prev) => !prev)}
          variant="ghost"
        />
      </header>

      <div
        aria-hidden={!isOpen}
        className={clsx(
          `fixed top-0 left-0 z-40 h-full w-full transform overflow-hidden py-4 transition-transform duration-300`,
          "bg-surface",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        id="mobile-menu"
        style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        <nav className="mt-16 flex flex-col space-y-3 p-6 text-xl">
          <MobileAuth>{navLinks}</MobileAuth>
          <Separator variant="margin" />

          <div className="mt-4 flex justify-end space-x-2">
            <LoveButton onClick={() => setIsOpen((prev) => !prev)} />
            <ThemeToggle data-testid="theme-toggle-mobile" />
            <LanguageToggle data-testid="language-toggle-mobile" />
          </div>
        </nav>
      </div>

      <Container>{children}</Container>
    </>
  );
}
