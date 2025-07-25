import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  reporter: [["html", { open: process.env.CI ? "never" : "on-failure" }]],
  retries: process.env.CI ? 2 : 0,
  testDir: "./test-suite",

  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    headless: true,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: process.env.CI ? "retain-on-failure" : "off",
  },

  webServer: process.env.CI
    ? undefined
    : {
        command: "pnpm dev",
        reuseExistingServer: true,
        url: "http://localhost:3000",
      },

  workers: process.env.CI ? 1 : undefined,
});
