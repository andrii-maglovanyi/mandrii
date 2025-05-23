module.exports = {
  ci: {
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        // Preview Deployment includes the HTTP header x-robots-tag: noindex
        // This header instructs search engines not to index the page - which is
        // expected in preview deployments to avoid SEO penalties for duplicate
        // or temporary content. However, this impacts the Lighthouse SEO audit.
        // Ignore the noindex SEO audit in CI
        "is-crawlable": "off",

        // Vercel Preview Deployments often serve pages with the HTTP header
        // Cache-Control: no-store to avoid caching temporary content.
        // This prevents pages from being stored in the back/forward cache (bfcache),
        // triggering a warning in Lighthouse. This is expected behavior for
        // previews and does not indicate a problem with production performance.
        // Ignore the bfcache audit in CI
        bfcache: "off",
      },
    },
    collect: {
      url: [`${process.env.VERCEL_PREVIEW_URL}/en`],
      startServerReadyPattern: "ready on",
      settings: {
        extraHeaders: {
          "x-vercel-protection-bypass": process.env.VERCEL_PROTECTION_BYPASS,
        },
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
