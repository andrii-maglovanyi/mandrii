interface PrivateConfig {
  analytics: {
    mixpanelToken: string;
    sentryAuthToken: string;
  };
  auth: {
    nextAuthSecret: string;
  };
  db: {
    connectionString: string;
  };
  email: {
    authorEmail: string;
    resendApiKey: string;
  };
  hasura: {
    adminSecret: string;
  };
  maps: {
    apiKey: string;
  };
  recaptcha: {
    secretKey: string;
  };
  rewards: {
    pointsPerEventCreation: number;
    pointsPerVenueCreation: number;
  };
  slack: {
    botToken: string;
    signingSecret: string;
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
  };
  telegram: {
    botUsername: string;
    token: string;
    webhookSecret: string;
  };
  webPush: {
    privateKey: string;
    subject: string;
  };
}

export function getEnvVar(name: string, required: boolean = process.env.UNSET_CONFIG !== "true") {
  const value = process.env[name];

  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value || "__UNSET__";
}

const authorEmail = getEnvVar("AUTHOR_EMAIL");

export const privateConfig: PrivateConfig = {
  analytics: {
    mixpanelToken: getEnvVar("MIXPANEL_TOKEN", false),
    sentryAuthToken: getEnvVar("SENTRY_AUTH_TOKEN"),
  },
  auth: {
    nextAuthSecret: getEnvVar("NEXTAUTH_SECRET"),
  },
  db: {
    connectionString: getEnvVar("NEON_CONNECTION_STRING"),
  },
  email: {
    authorEmail,
    resendApiKey: getEnvVar("RESEND_API_KEY"),
  },
  hasura: {
    adminSecret: getEnvVar("HASURA_ADMIN_SECRET"),
  },
  maps: {
    apiKey: getEnvVar("NEXT_PRIVATE_GOOGLE_MAPS_API_KEY"),
  },
  recaptcha: {
    secretKey: getEnvVar("RECAPTCHA_SECRET_KEY"),
  },
  rewards: {
    pointsPerEventCreation: 15,
    pointsPerVenueCreation: 20,
  },
  slack: {
    botToken: getEnvVar("NEXT_PRIVATE_SLACK_BOT_TOKEN"),
    signingSecret: getEnvVar("NEXT_PRIVATE_SLACK_SIGNING_SECRET"),
  },
  stripe: {
    secretKey: getEnvVar("NEXT_PRIVATE_STRIPE_SECRET_KEY"),
    webhookSecret: getEnvVar("NEXT_PRIVATE_STRIPE_WEBHOOK_SECRET", false),
  },
  telegram: {
    botUsername: getEnvVar("TELEGRAM_BOT_USERNAME", false),
    token: getEnvVar("TELEGRAM_BOT_TOKEN"),
    webhookSecret: getEnvVar("TELEGRAM_WEBHOOK_SECRET", false),
  },
  webPush: {
    privateKey: getEnvVar("WEB_PUSH_VAPID_PRIVATE_KEY", false),
    subject: authorEmail === "__UNSET__" ? "__UNSET__" : `mailto:${authorEmail}`,
  },
};
