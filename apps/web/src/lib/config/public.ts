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
  mixpanel: {
    ignoredEmails: string[];
  };
  recaptcha: {
    siteKey: string;
  };
  stripe: {
    publishableKey: string;
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
  mixpanel: {
    ignoredEmails: (process.env.NEXT_PUBLIC_MIXPANEL_IGNORED_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase()),
  },
  recaptcha: {
    siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "__UNSET__",
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "__UNSET__",
  },
};
