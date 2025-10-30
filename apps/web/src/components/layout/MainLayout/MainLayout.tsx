"use client";

import { Link } from "~/i18n/navigation";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "react-responsive";

import { useI18n } from "~/i18n/useI18n";

import CookieConsentBanner from "../CookieConsentBanner/CookieConsentBanner";
import { Footer } from "../Footer/Footer";
import { DesktopLayout } from "./Desktop/DesktopLayout";
import { MobileLayout } from "./Mobile/MobileLayout";

export function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const i18n = useI18n();
  const pathname = usePathname();

  const navLinks = (
    <>
      <Link href="/map">{i18n("Map")}</Link>
      <Link href="/venues">{i18n("Venues")}</Link>
      <Link href="/events">{i18n("Events")}</Link>
      <Link href="/posts">{i18n("Posts")}</Link>
    </>
  );

  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
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
      {!pathname.includes("/map") && <Footer />}
    </div>
  );
}
