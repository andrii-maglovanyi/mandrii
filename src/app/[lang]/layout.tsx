import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nunito } from "next/font/google";
import "../globals.css";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { NotificationsTicker } from "@/features/NotificationsTicker/NotificationsTicker";
import { LanguageProvider } from "@/context/LanguageContext";
import { Language } from "@/types";
import { getDictionary } from "@/dictionaries";
import { Heading } from "@/features/Heading/Heading";
import { Column } from "@/components";
import { CookieConsentBar } from "@/features/CookieConsentBar/CookieConsentBar";
import Providers from "@/components/Providers";

const leOsler = localFont({
  display: "swap",
  preload: true,
  src: [
    {
      path: "../../../public/assets/fonts/LeOsler_Sharp-Light.ttf",
      weight: "400",
    },
    {
      path: "../../../public/assets/fonts/LeOsler_Sharp-Regular.ttf",
      weight: "700",
    },
  ],
  variable: "--font-leOsler",
});

const nunito = Nunito({
  display: "swap",
  preload: true,
  subsets: ["latin", "cyrillic"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mandrii.com"),
  title: "Мандрій",
  description: "мандруй / мрій / дій",
  openGraph: {
    images: ["/assets/logo/mandrii.png"],
    type: "website",
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<Language>;
}>) {
  const lang = (await params).lang;
  const dict = await getDictionary(lang);

  return (
    <html>
      <body
        lang={lang}
        className={`${nunito.variable}  font-nunito ${leOsler.variable} font-leOsler min-h-screen flex flex-col`}
      >
        <Providers>
          <LanguageProvider lang={lang} dict={dict}>
            <NotificationsProvider>
              <Heading />
              <Column className="relative flex-1">{children}</Column>
              <NotificationsTicker />
            </NotificationsProvider>
            <CookieConsentBar />
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
