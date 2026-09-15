import { envName } from "~/lib/config/env";

import { DesktopAuth } from "../../Auth/DesktopAuth";
import { CartButton } from "../../CartButton/CartButton";
import { LanguageToggle } from "../../LanguageToggle/LanguageToggle";
import { LoveButton } from "../../LoveButton/LoveButton";
import { ThemeToggle } from "../../ThemeToggle/ThemeToggle";
import { Logo } from "../Logo";

type DesktopLayoutProps = {
  navLinks: React.ReactNode;
};

export function DesktopLayout({ navLinks }: Readonly<DesktopLayoutProps>) {
  return (
    <>
      <header
        className={`
          relative z-40 flex min-h-16 shrink-0 items-center justify-between px-4
          pt-[env(safe-area-inset-top)] shadow-md
          dark:shadow-neutral-500/10
        `}
      >
        <Logo />

        <nav className={`
          hidden space-x-6
          md:flex
          lg:space-x-12
        `}>
          {navLinks}

          <div className="flex space-x-2">
            {envName !== "production" && <CartButton />}
            <LoveButton />
            <ThemeToggle data-testid="theme-toggle-desktop" />
            <LanguageToggle data-testid="language-toggle-desktop" />
            <DesktopAuth />
          </div>
        </nav>
      </header>
    </>
  );
}
