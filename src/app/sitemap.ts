import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://mandrii.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
      alternates: {
        languages: {
          uk: "https://mandrii.com/uk",
          en: "https://mandrii.com/en",
        },
      },
    },
    {
      url: "https://mandrii.com/map",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          uk: "https://mandrii.com/uk/map",
          en: "https://mandrii.com/en/map",
        },
      },
    },
  ];
}
