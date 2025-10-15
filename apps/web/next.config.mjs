import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";
import { execSync } from "node:child_process";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/**/*": ["./content/**/*", "./.next/static/css/**/*"],
    "/app/\[locale\]/**/*": ["./content/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "yiiprxif648vopwe.public.blob.vercel-storage.com",
        port: "",
      },
    ],
  },
  async headers() {
    return [
      {
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
        source: "/(.*)",
      },
    ];
  },
  env: {
    VERCEL_ENV: process.env.VERCEL_ENV || process.env.NODE_ENV,
    VERCEL_GIT_COMMIT_SHA:
      process.env.VERCEL_GIT_COMMIT_SHA || execSync("git rev-parse HEAD", { encoding: "utf8" }).trim(),
    BUILD_TIME: new Date().toISOString(),
  },
  async rewrites() {
    return [
      {
        source: "/services/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/:path*"
            : (process.env.SERVICES_URL ?? "https://services.mandrii.com") + "/:path*",
      },
    ];
  },
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
};

export default withSentryConfig(withNextIntl(nextConfig), {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  automaticVercelMonitors: true,
  disableLogger: true,
  org: "mandrii",
  project: "mandrii",
  reactComponentAnnotation: {
    enabled: true,
  },
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
