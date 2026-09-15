import type { MetadataRoute } from "next";

import { UrlHelper } from "~/lib/url-helper";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: "/",
      disallow: ["/api/", "/admin/", "/private/"],
      userAgent: "*",
    },
    sitemap: UrlHelper.buildUrl("/sitemap.xml"),
  };
}
