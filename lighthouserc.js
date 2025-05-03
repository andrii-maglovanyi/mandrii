module.exports = {
  ci: {
    assert: {
      preset: "lighthouse:recommended",
    },
    collect: {
      url: [`${process.env.VERCEL_URL}/en`],
      startServerReadyPattern: "ready on",
      startServerCommand: "pnpm start",
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
