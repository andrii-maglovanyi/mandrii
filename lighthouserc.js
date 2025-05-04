console.log("VERCEL_PREVIEW_URL", process.env.VERCEL_PREVIEW_URL);
console.log("::: ALL :::", JSON.stringify(process.env, null, 2));

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
