import { describe, expect, it } from "vitest";

import {
  buildArticleStructuredData,
  buildEventStructuredData,
  buildPublicPageMetadata,
  buildVenueStructuredData,
  noIndexRobots,
} from "./seo";

describe("public structured data", () => {
  it("preserves localized canonical, hreflang, and Open Graph metadata on public pages", () => {
    const metadata = buildPublicPageMetadata({
      description: "A venue in London.",
      locale: "uk",
      pathname: "/venues/example-venue",
      title: "Example venue",
    });

    expect(metadata).toMatchObject({
      alternates: {
        canonical: "http://localhost:3000/uk/venues/example-venue",
        languages: {
          en: "http://localhost:3000/en/venues/example-venue",
          uk: "http://localhost:3000/uk/venues/example-venue",
        },
      },
      openGraph: {
        locale: "uk_UA",
        siteName: "Мандрій",
        url: "http://localhost:3000/uk/venues/example-venue",
      },
    });
    expect(metadata).not.toHaveProperty("robots");
  });

  it("exposes a reusable noindex policy for non-public pages", () => {
    expect(noIndexRobots).toEqual({ follow: false, index: false });
  });

  it("builds a venue schema with its useful location details", () => {
    expect(
      buildVenueStructuredData({
        address: "123 Example Street",
        city: "London",
        country: "United Kingdom",
        description: "A Ukrainian community venue.",
        image: "https://example.com/venue.jpg",
        name: "Example venue",
        url: "https://mandrii.com/en/venues/example-venue",
        website: "https://example.org",
      }),
    ).toMatchObject({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      address: {
        "@type": "PostalAddress",
        addressCountry: "United Kingdom",
        addressLocality: "London",
        streetAddress: "123 Example Street",
      },
      name: "Example venue",
      sameAs: ["https://example.org"],
    });
  });

  it("uses a virtual location only for online events", () => {
    expect(
      buildEventStructuredData({
        description: "An online gathering.",
        isOnline: true,
        onlineUrl: "https://events.example.org/online-event",
        startDate: "2026-10-01T18:00:00.000Z",
        title: "Online event",
        url: "https://mandrii.com/en/events/online-event",
      }),
    ).toMatchObject({
      "@type": "Event",
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      location: {
        "@type": "VirtualLocation",
        url: "https://events.example.org/online-event",
      },
    });
  });

  it("builds an article schema for file-based editorial content", () => {
    expect(
      buildArticleStructuredData({
        description: "A practical guide.",
        locale: "uk",
        publishedAt: "2026-09-08T12:00:00.000Z",
        title: "Helpful article",
        url: "https://mandrii.com/uk/posts/guides/helpful-article",
      }),
    ).toMatchObject({
      "@type": "Article",
      author: { "@type": "Organization", name: "Mandrii" },
      inLanguage: "uk",
      publisher: { "@type": "Organization", name: "Mandrii" },
    });
  });
});
