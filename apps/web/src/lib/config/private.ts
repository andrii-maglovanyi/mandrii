interface PrivateConfig {
  analytics: {
    mixpanelToken: string;
    sentryAuthToken: string;
  };
  auth: {
    nextAuthSecret: string;
  };
  email: {
    authorEmail: string;
    resendApiKey: string;
  };
  hasura: {
    adminSecret: string;
  };
  recaptcha: {
    secretKey: string;
  };
  slack: {
    botToken: string;
    signingSecret: string;
  };
}

export function getEnvVar(name: string, required: boolean = process.env.UNSET_CONFIG !== "true"): string {
  const value = process.env[name];

  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value || "__UNSET__";
}

export const privateConfig: PrivateConfig = {
  analytics: {
    mixpanelToken: getEnvVar("MIXPANEL_TOKEN", false),
    sentryAuthToken: getEnvVar("SENTRY_AUTH_TOKEN"),
  },
  auth: {
    nextAuthSecret: getEnvVar("NEXTAUTH_SECRET"),
  },
  email: {
    authorEmail: getEnvVar("AUTHOR_EMAIL"),
    resendApiKey: getEnvVar("RESEND_API_KEY"),
  },
  hasura: {
    adminSecret: getEnvVar("HASURA_ADMIN_SECRET"),
  },
  recaptcha: {
    secretKey: getEnvVar("RECAPTCHA_SECRET_KEY"),
  },
  slack: {
    botToken: getEnvVar("NEXT_PRIVATE_SLACK_BOT_TOKEN"),
    signingSecret: getEnvVar("NEXT_PRIVATE_SLACK_SIGNING_SECRET"),
  },
};
