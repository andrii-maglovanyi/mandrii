module.exports = {
  ci: {
    assert: {
      preset: "lighthouse:recommended",
    },
    collect: {
      url: ["http://localhost:3000/en"],
      startServerReadyPattern: "ready on",
      startServerCommand: "pnpm start",
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
