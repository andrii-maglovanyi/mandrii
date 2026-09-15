import type { MetadataRoute } from "next";

import { unstable_cache } from "next/cache";

import { publicConfig } from "~/lib/config/public";
import { isEventScheduleFinished } from "~/lib/events/recurrence";
import { contentManager } from "~/lib/mdx/reader";
import { UrlHelper } from "~/lib/url-helper";
import { Locale } from "~/types";

const LOCALES = ["en", "uk"] as const;
const SITEMAP_REVALIDATE_SECONDS = 60 * 60;

type SitemapContent = {
  events: Array<{
    end_date: null | string;
    is_recurring: boolean;
    recurrence_rule: null | string;
    slug: string;
    start_date: string;
    updated_at: string;
  }>;
  venues: Array<{ slug: string; updated_at: string }>;
};

const SITEMAP_CONTENT_QUERY = `
  query SitemapContent($now: timestamptz!) {
    venues(where: { status: { _eq: ACTIVE } }) {
      slug
      updated_at
    }
    events(
      where: {
        status: { _eq: ACTIVE }
        _or: [
          { is_recurring: { _eq: true } }
          { end_date: { _gte: $now } }
          { end_date: { _is_null: true }, start_date: { _gte: $now } }
        ]
      }
    ) {
      end_date
      is_recurring
      recurrence_rule
      slug
      start_date
      updated_at
    }
  }
`;

const getSitemapContent = unstable_cache(
  async (): Promise<SitemapContent> => {
    if (publicConfig.hasura.endpoint === "__UNSET__") {
      throw new Error("Hasura endpoint is not configured");
    }

    const response = await fetch(publicConfig.hasura.endpoint, {
      body: JSON.stringify({ query: SITEMAP_CONTENT_QUERY, variables: { now: new Date().toISOString() } }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!response.ok) throw new Error(`Sitemap query failed with status ${response.status}`);

    const result = (await response.json()) as { data?: SitemapContent; errors?: Array<{ message: string }> };
    if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join("; "));
    if (!result.data) throw new Error("Sitemap query returned no data");

    return result.data;
  },
  ["public-sitemap-content"],
  { revalidate: SITEMAP_REVALIDATE_SECONDS },
);

const getPostSitemapEntries = unstable_cache(
  async (): Promise<MetadataRoute.Sitemap> => {
    const posts = await contentManager.getContent("posts", Locale.EN);

    return posts.flatMap(({ id, meta }) => {
      if (!meta.categorySlug) return [];

      const pathname = `/posts/${meta.categorySlug}/${id}`;
      const availableLocales = contentManager.getAvailableLocales("posts", id);
      const languages = Object.fromEntries(availableLocales.map((locale) => [locale, publicUrl(locale, pathname)]));

      return {
        alternates: { languages },
        changeFrequency: "monthly" as const,
        lastModified: lastModified(meta.date),
        priority: 0.5,
        url: publicUrl(Locale.EN, pathname),
      };
    });
  },
  ["post-sitemap-entries"],
  { revalidate: SITEMAP_REVALIDATE_SECONDS },
);

const publicUrl = (locale: (typeof LOCALES)[number], pathname = "") => UrlHelper.buildUrl(`/${locale}${pathname}`);
const lastModified = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const localizedEntry = (
  pathname: string,
  priority: number,
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>,
): MetadataRoute.Sitemap[number] => ({
  alternates: { languages: Object.fromEntries(LOCALES.map((locale) => [locale, publicUrl(locale, pathname)])) },
  changeFrequency,
  priority,
  url: publicUrl("en", pathname),
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = [
    localizedEntry("", 1, "daily"),
    localizedEntry("/map", 0.8, "weekly"),
    localizedEntry("/venues", 0.8, "weekly"),
    localizedEntry("/events", 0.8, "daily"),
    localizedEntry("/guides", 0.7, "weekly"),
    localizedEntry("/posts", 0.6, "weekly"),
    localizedEntry("/the-idea", 0.2, "yearly"),
  ];

  let postEntries: MetadataRoute.Sitemap = [];
  try {
    postEntries = await getPostSitemapEntries();
  } catch (error) {
    console.error("Unable to load post sitemap entries:", error);
  }

  try {
    const { events, venues } = await getSitemapContent();
    const venueEntries = venues.map(({ slug, updated_at }) => ({
      alternates: {
        languages: Object.fromEntries(LOCALES.map((locale) => [locale, publicUrl(locale, `/venues/${slug}`)])),
      },
      changeFrequency: "weekly" as const,
      lastModified: lastModified(updated_at),
      priority: 0.7,
      url: publicUrl("en", `/venues/${slug}`),
    }));
    const eventEntries = events
      .filter((event) => !isEventScheduleFinished(event))
      .map(({ slug, updated_at }) => ({
        alternates: {
          languages: Object.fromEntries(LOCALES.map((locale) => [locale, publicUrl(locale, `/events/${slug}`)])),
        },
        changeFrequency: "weekly" as const,
        lastModified: lastModified(updated_at),
        priority: 0.7,
        url: publicUrl("en", `/events/${slug}`),
      }));

    return [...staticEntries, ...postEntries, ...venueEntries, ...eventEntries];
  } catch (error) {
    console.error("Unable to load dynamic sitemap entries:", error);
    return [...staticEntries, ...postEntries];
  }
}
