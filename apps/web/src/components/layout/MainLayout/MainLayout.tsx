"use client";

import { usePathname } from "next/navigation";
import { useMediaQuery } from "react-responsive";

import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";
import { envName } from "~/lib/config/env";

import CookieConsentBanner from "../CookieConsentBanner/CookieConsentBanner";
import { Footer } from "../Footer/Footer";
import { MessageToast } from "../MessageToast/MessageToast";
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
    query: "(max-width: 768px)",
  });

  const navItems = [
    { href: "/map", label: "Map" },
    { href: "/venues", label: "Venues" },
    { href: "/events", label: "Events" },
    { href: "/posts", label: "Posts" },
    { href: "/guides", label: "Guides" },
    ...(envName !== "production" ? [{ href: "/shop", label: "Shop" }] : []),
  ];
  const navLinks = navItems.map(({ href, label }) => {
    const active = isCurrentRoute(pathname, href);
    return (
      <Link
        aria-current={active ? "page" : undefined}
        className={active ? "text-primary !font-semibold" : undefined}
        href={href}
        key={href}
      >
        {i18n(label)}
      </Link>
    );
  });

  return (
    <div className="flex min-h-screen flex-col">
      {isMobile ? (
        <MobileLayout key="mobile" navLinks={navLinks}>
          {children}
        </MobileLayout>
      ) : (
        <DesktopLayout key="desktop" navLinks={navLinks}>
          {children}
        </DesktopLayout>
      )}
      <CookieConsentBanner />
      <MessageToast />
      {!pathname.includes("/map") && <Footer />}
    </div>
  );
}
