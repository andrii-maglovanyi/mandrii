import * as Sentry from "@sentry/nextjs";

import "../globals.css";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

import { MainLayout } from "~/components/layout";
import { NotificationsTicker } from "~/components/layout/NotificationsTicker/NotificationsTicker";
import AuthProvider from "~/contexts/AuthContext";
import { DialogProvider } from "~/contexts/DialogContext";
import { NotificationsProvider } from "~/contexts/NotificationsContext";
import { ThemeProvider } from "~/contexts/ThemeContext";
import { routing } from "~/i18n/routing";
import ApolloWrapper from "~/lib/apollo/provider";
import { UrlHelper } from "~/lib/url-helper";

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata({ params }: RootLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const isUkrainian = locale === "uk";

  Sentry.logger.info("User triggered test log", { log_source: "sentry_test" });

  return {
    alternates: {
      canonical: UrlHelper.buildUrl(`/${locale}`),
      languages: {
        en: UrlHelper.buildUrl("/en"),
        uk: UrlHelper.buildUrl("/uk"),
      },
    },
    description: isUkrainian
      ? "мандруй / мрій / дій - простір для мандрівників та мрійників"
      : "travel / dream / act - a space for travelers and dreamers",
    metadataBase: new URL(UrlHelper.getBaseUrl()),
    openGraph: {
      description: isUkrainian ? "мандруй / мрій / дій" : "travel / dream / act",
      images: ["/assets/logo/mandrii.png"],
      locale: isUkrainian ? "uk_UA" : "en_US",
      siteName: isUkrainian ? "Мандрій" : "Mandrii",
      title: isUkrainian ? "Мандрій" : "Mandrii",
      type: "website",
    },
    title: isUkrainian ? "Мандрій" : "Mandrii",
  };
}

const setInitialTheme = `
  (function() {
    try {
      const theme = localStorage.getItem('mndr.theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (theme === 'dark' || (!theme && prefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (_) {}
  })();
`;

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
      </head>
      <body>
        <AuthProvider>
          <ApolloWrapper>
            <ThemeProvider>
              <NextIntlClientProvider>
                <DialogProvider>
                  <NotificationsProvider>
                    <MainLayout>{children}</MainLayout>
                    <NotificationsTicker />
                  </NotificationsProvider>
                </DialogProvider>
              </NextIntlClientProvider>
            </ThemeProvider>
          </ApolloWrapper>
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
