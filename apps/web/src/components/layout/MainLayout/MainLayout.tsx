"use client";

import { usePathname } from "next/navigation";

import { useMediaQuery } from "~/hooks/useMediaQuery";
import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";
import { envName } from "~/lib/config/env";

import CookieConsentBanner from "../CookieConsentBanner/CookieConsentBanner";
import { Footer } from "../Footer/Footer";
import { MessageToast } from "../MessageToast/MessageToast";
import { PwaProvider } from "../Pwa/PwaProvider";
import { Container } from "./Container";
import { DesktopLayout } from "./Desktop/DesktopLayout";
import { MobileLayout } from "./Mobile/MobileLayout";

const isCurrentRoute = (pathname: string, href: string) => {
  const pathWithoutLocale = pathname.replace(/^\/(en|uk)(?=\/|$)/, "") || "/";
  return pathWithoutLocale === href || pathWithoutLocale.startsWith(`${href}/`);
};

export function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const i18n = useI18n();
  const pathname = usePathname();
  const isMobile = useMediaQuery({
    defaultMatches: true,
    query: "(max-width: 1279px)",
  });

  const navItems = [
    { href: "/map", label: "Map" },
    { href: "/venues", label: "Venues" },
    { href: "/events", label: "Events" },
    { href: "/community", label: "Community" },
    { href: "/posts", label: "Posts" },
    { href: "/guides", label: "Guides" },
    ...(envName !== "production" ? [{ href: "/shop", label: "Shop" }] : []),
  ];
  const navLinks = navItems.map(({ href, label }) => {
    const active = isCurrentRoute(pathname, href);
    return (
      <Link
        aria-current={active ? "page" : undefined}
        className={active ? "!font-semibold text-primary" : undefined}
        href={href}
        key={href}
      >
        {i18n(label)}
      </Link>
    );
  });

  return (
    <PwaProvider>
      <div className="flex min-h-screen flex-col">
        {isMobile ? <MobileLayout navLinks={navLinks} /> : <DesktopLayout navLinks={navLinks} />}
        <Container>{children}</Container>
        <CookieConsentBanner />
        <MessageToast />
        {!pathname.includes("/map") && <Footer />}
      </div>
    </PwaProvider>
  );
}
