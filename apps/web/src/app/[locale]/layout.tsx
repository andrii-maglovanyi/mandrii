import "../globals.css";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { cookies } from "next/headers";
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

  return {
    alternates: {
      canonical: UrlHelper.buildUrl(`/${locale}`),
      languages: {
        en: UrlHelper.buildUrl("/en"),
        uk: UrlHelper.buildUrl("/uk"),
      },
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: isUkrainian ? "Мандрій" : "Mandrii",
    },
    description: isUkrainian
      ? "мандруй / мрій / дій - простір для діячів, мандрівників та мрійників"
      : "travel / dream / act - a space for creators, travelers and dreamers",
    icons: {
      apple: [{ sizes: "180x180", url: "/static/apple-touch-icon.png" }],
      icon: [
        { sizes: "192x192", url: "/static/icon-192.png" },
        { sizes: "512x512", url: "/static/icon-512.png" },
      ],
    },
    manifest: "/manifest.json",
    metadataBase: new URL(UrlHelper.getBaseUrl()),
    openGraph: {
      description: isUkrainian ? "мандруй / мрій / дій" : "travel / dream / act",
      images: ["/assets/logo/mandrii.png"],
      locale: isUkrainian ? "uk_UA" : "en_GB",
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
      const storageTheme = localStorage.getItem('mndr.theme');
      const cookieMatch = document.cookie.split('; ').find(function (row) {
        return row.startsWith('mndr.theme=');
      });
      const cookieTheme = cookieMatch ? cookieMatch.split('=')[1] : null;
      const resolvedTheme = storageTheme || cookieTheme;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldUseDark = resolvedTheme === 'dark' || (!resolvedTheme && prefersDark);

      document.documentElement.classList.toggle('dark', shouldUseDark);

      const nextTheme = shouldUseDark ? 'dark' : 'light';
      localStorage.setItem('mndr.theme', nextTheme);
      document.cookie = 'mndr.theme=' + nextTheme + '; path=/; max-age=31536000; SameSite=Lax';
    } catch (_) {}
  })();
`;

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("mndr.theme");
  const themeCookieValue = themeCookie?.value;
  const hasThemeCookie = themeCookieValue === "dark" || themeCookieValue === "light";
  const isDarkFromCookie = hasThemeCookie ? themeCookieValue === "dark" : undefined;

  return (
    <html className={isDarkFromCookie === true ? "dark" : undefined} lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
      </head>
      <body suppressHydrationWarning>
        <ApolloWrapper>
          <AuthProvider>
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
          </AuthProvider>
        </ApolloWrapper>
        <SpeedInsights />
      </body>
    </html>
  );
}
