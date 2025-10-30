"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <div className="flex min-h-screen flex-col">
      <div className={`
        block
        md:hidden
      `}>
        <MobileLayout navLinks={navLinks}>{children}</MobileLayout>
      </div>
      <div className={`
        hidden
        md:block
      `}>
        <DesktopLayout navLinks={navLinks}>{children}</DesktopLayout>
      </div>
      <CookieConsentBanner />
      {!pathname.includes("/map") && <Footer />}
    </div>
  );
}
