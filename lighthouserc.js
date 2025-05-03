module.exports = {
  ci: {
    assert: {
      preset: "lighthouse:recommended",
    },
    collect: {
      url: ["http://localhost:3000/en"],
      startServerCommand: "pnpm build & pnpm start",
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
