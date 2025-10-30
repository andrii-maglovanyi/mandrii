import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      alternates: {
        languages: {
          en: "https://mandrii.com/en",
          uk: "https://mandrii.com/uk",
        },
      },
      changeFrequency: "daily",
      lastModified: new Date(),
      priority: 1,
      url: "https://mandrii.com",
    },
    {
      alternates: {
        languages: {
          en: "https://mandrii.com/en/map",
          uk: "https://mandrii.com/uk/map",
        },
      },
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 0.8,
      url: "https://mandrii.com/map",
    },
    {
      alternates: {
        languages: {
          en: "https://mandrii.com/en/the-idea",
          uk: "https://mandrii.com/uk/the-idea",
        },
      },
      changeFrequency: "yearly",
      lastModified: new Date(),
      priority: 0.2,
      url: "https://mandrii.com/the-idea",
    },
    {
      alternates: {
        languages: {
          en: "https://mandrii.com/en/venues",
          uk: "https://mandrii.com/uk/venues",
        },
      },
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 0.7,
      url: "https://mandrii.com/venues",
    },
    {
      alternates: {
        languages: {
          en: "https://mandrii.com/en/events",
          uk: "https://mandrii.com/uk/events",
        },
      },
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 0.7,
      url: "https://mandrii.com/events",
    },
  ];
}
