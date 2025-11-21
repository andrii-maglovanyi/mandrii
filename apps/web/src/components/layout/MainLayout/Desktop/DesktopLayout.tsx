import { DesktopAuth } from "../../Auth/DesktopAuth";
import { LanguageToggle } from "../../LanguageToggle/LanguageToggle";
import { LoveButton } from "../../LoveButton/LoveButton";
import { ThemeToggle } from "../../ThemeToggle/ThemeToggle";
import { Container } from "../Container";
import { Logo } from "../Logo";

type DesktopLayoutProps = {
  children: React.ReactNode;
  navLinks: React.ReactNode;
};

export function DesktopLayout({ children, navLinks }: Readonly<DesktopLayoutProps>) {
  return (
    <div className={`
      hidden
      lg:block
    `}>
      <header
        className={`
          relative z-50 flex h-16 items-center justify-between px-4 shadow-md
          dark:shadow-neutral-500/10
        `}
      >
        <Logo />

        <nav className={`
          hidden space-x-12
          md:flex
        `}>
          {navLinks}

          <div className="flex space-x-2">
            <LoveButton />
            <ThemeToggle data-testid="theme-toggle-desktop" />
            <LanguageToggle data-testid="language-toggle-desktop" />
            <DesktopAuth />
          </div>
        </nav>
      </header>
      <Container>{children}</Container>
    </div>
  );
}
