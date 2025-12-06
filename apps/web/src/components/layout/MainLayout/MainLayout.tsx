"use client";

import { usePathname } from "next/navigation";
import { useMediaQuery } from "react-responsive";

import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";

import CookieConsentBanner from "../CookieConsentBanner/CookieConsentBanner";
import { Footer } from "../Footer/Footer";
import { DesktopLayout } from "./Desktop/DesktopLayout";
import { MobileLayout } from "./Mobile/MobileLayout";

export function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const i18n = useI18n();
  const pathname = usePathname();
  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });

  const navLinks = (
    <>
      <Link href="/map">{i18n("Map")}</Link>
      <Link href="/venues">{i18n("Venues")}</Link>
      <Link href="/events">{i18n("Events")}</Link>
      <Link href="/posts">{i18n("Posts")}</Link>
      <Link href="/guides">{i18n("Guides")}</Link>
      <Link href="/shop">{i18n("Shop")}</Link>
    </>
  );

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
      {!pathname.includes("/map") && <Footer />}
    </div>
  );
}
