interface PublicConfig {
  analytics: {
    sentryDsn: string;
  };
  deploymentInfo: {
    buildTime: string;
    commitSha?: string;
    environment: string;
  };
  hasura: {
    endpoint: string;
  };
  maps: {
    apiKey: string;
    mapId: string;
  };
  recaptcha: {
    siteKey: string;
  };
}

export const publicConfig: PublicConfig = {
  analytics: {
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "__UNSET__",
  },
  deploymentInfo: {
    buildTime: process.env.BUILD_TIME || "~",
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || "~",
    environment: process.env.VERCEL_ENV || "~",
  },
  hasura: {
    endpoint: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_ENDPOINT || "__UNSET__",
  },
  maps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "__UNSET__",
    mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || "__UNSET__",
  },
  recaptcha: {
    siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "__UNSET__",
  },
};
