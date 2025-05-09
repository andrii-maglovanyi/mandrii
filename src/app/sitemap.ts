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
  ];
}
