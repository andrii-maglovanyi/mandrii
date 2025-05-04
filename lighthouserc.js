console.log(":::::::::::", JSON.stringify(process.env, null, 2));
module.exports = {
  ci: {
    assert: {
      preset: "lighthouse:recommended",
    },
    collect: {
      url: [`${process.env.BASE_URL}/en`],
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
