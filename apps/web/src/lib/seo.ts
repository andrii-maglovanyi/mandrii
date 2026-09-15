import type { Metadata } from "next";

import { Locale } from "~/types";

import { UrlHelper } from "./url-helper";

type PublicPageMetadata = {
  description: string;
  image?: string | null;
  locale: string;
  pathname: string;
  robots?: Metadata["robots"];
  title: string;
};

type EventStructuredData = {
  country?: string | null;
  description: string;
  endDate?: string | null;
  image?: string | null;
  isOnline: boolean;
  locationAddress?: string | null;
  locationName?: string | null;
  organizerName?: string | null;
  onlineUrl?: string | null;
  startDate: string;
  title: string;
  url: string;
};

type VenueStructuredData = {
  address?: string | null;
  city?: string | null;
  country?: string | null;
  description: string;
  image?: string | null;
  name: string;
  url: string;
  website?: string | null;
};

type ArticleStructuredData = {
  description: string;
  image?: string | null;
  locale: string;
  publishedAt: string;
  title: string;
  url: string;
};

/** Reuse the same crawler boundary for account, preview, and transient states. */
export const noIndexRobots: Metadata["robots"] = { follow: false, index: false };

const getOpenGraphLocale = (locale: string) => (locale === Locale.UK ? "uk_UA" : "en_GB");
const getSiteName = (locale: string) => (locale === Locale.UK ? "Мандрій" : "Mandrii");

export function buildPublicPageUrl(locale: string, pathname: string) {
  return UrlHelper.buildUrl(`/${locale}${pathname}`);
}

/** Builds the shared canonical and Open Graph metadata used by public pages. */
export function buildPublicPageMetadata({
  description,
  image,
  locale,
  pathname,
  robots,
  title,
}: PublicPageMetadata): Metadata {
  const url = buildPublicPageUrl(locale, pathname);

  return {
    alternates: {
      canonical: url,
      languages: {
        [Locale.EN]: buildPublicPageUrl(Locale.EN, pathname),
        [Locale.UK]: buildPublicPageUrl(Locale.UK, pathname),
      },
    },
    description,
    openGraph: {
      description,
      images: image ? [{ url: image }] : undefined,
      locale: getOpenGraphLocale(locale),
      siteName: getSiteName(locale),
      title,
      type: "website",
      url,
    },
    ...(robots ? { robots } : {}),
    title,
  };
}

export function buildVenueStructuredData({
  address,
  city,
  country,
  description,
  image,
  name,
  url,
  website,
}: VenueStructuredData): Record<string, unknown> {
  const postalAddress = address || city || country
    ? {
        "@type": "PostalAddress",
        addressCountry: country ?? undefined,
        addressLocality: city ?? undefined,
        streetAddress: address ?? undefined,
      }
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    address: postalAddress,
    description,
    image: image ?? undefined,
    name,
    sameAs: website ? [website] : undefined,
    url,
  };
}

export function buildEventStructuredData({
  country,
  description,
  endDate,
  image,
  isOnline,
  locationAddress,
  locationName,
  onlineUrl,
  organizerName,
  startDate,
  title,
  url,
}: EventStructuredData): Record<string, unknown> {
  const location = isOnline
    ? { "@type": "VirtualLocation", url: onlineUrl || url }
    : locationAddress || locationName || country
      ? {
          "@type": "Place",
          address: locationAddress || country
            ? {
                "@type": "PostalAddress",
                addressCountry: country ?? undefined,
                streetAddress: locationAddress ?? undefined,
              }
            : undefined,
          name: locationName ?? undefined,
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    description,
    endDate: endDate ?? undefined,
    eventAttendanceMode: isOnline ? "https://schema.org/OnlineEventAttendanceMode" : undefined,
    image: image ?? undefined,
    location,
    name: title,
    organizer: organizerName ? { "@type": "Organization", name: organizerName } : undefined,
    startDate,
    url,
  };
}

export function buildArticleStructuredData({
  description,
  image,
  locale,
  publishedAt,
  title,
  url,
}: ArticleStructuredData): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    author: { "@type": "Organization", name: "Mandrii" },
    datePublished: publishedAt,
    description,
    headline: title,
    image: image ?? undefined,
    inLanguage: locale,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    publisher: { "@type": "Organization", name: "Mandrii" },
  };
}
