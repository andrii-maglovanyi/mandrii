import { expect, test } from "@playwright/test";

const signInModalTitle = /you can do so much more if you have a profile/i;

test.describe("Authentication Providers", () => {
  test("email sign in form submits successfully", async ({ page }) => {
    const body = JSON.stringify({
      data: {
        id: "621f3ecf-f4d2-453a-9f82-21332409b4d2",
      },
    });

    await page.route("*/**/api/send", async (route) => {
      await route.fulfill({
        body,
        contentType: "application/json",
        status: 200,
      });
    });

    await page.goto("/", { waitUntil: "networkidle" });

    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText(signInModalTitle)).toBeVisible();

    await page.getByLabel(/email address/i).fill("tester@mandrii.com");

    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/auth/signin/resend")),
      page.getByRole("button", { name: /sign in with email/i }).click(),
    ]);

    await expect(page.getByText(signInModalTitle)).not.toBeVisible();
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });

  test("Google sign-in triggers redirect safely", async ({ page }) => {
    await page.route("/api/auth/signin/google*", async (route) => {
      await route.fulfill({
        headers: {
          Location: "/api/auth/callback/google?code=mock_code&state=mock_state",
        },
        status: 302,
      });
    });

    await page.goto("/", { waitUntil: "networkidle" });

    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText(signInModalTitle)).toBeVisible();

    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/auth/signin/google")),
      page.getByRole("button", { name: /sign in with google/i }).click(),
    ]);
  });
});

test.describe("Authenticated user profile menu", () => {
  test("shows user profile menu when authenticated", async ({ page }) => {
    await page.route("**/api/auth/session", async (route) => {
      const responseData = {
        expires: new Date(Date.now() + 86400000).toISOString(),
        user: {
          email: "tester@mandrii.com",
          id: "tester555",
          name: "Tester User",
        },
      };

      await route.fulfill({
        body: JSON.stringify(responseData),
        contentType: "application/json",
        status: 200,
      });
    });

    await page.goto("/", { waitUntil: "networkidle" });

    await expect(page.getByRole("button", { name: /sign in/i })).not.toBeVisible();

    const profileButton = page.getByRole("button", { name: /profile/i });
    await expect(profileButton).toBeVisible();

    await expect(page.getByText("Tester User")).not.toBeVisible();
    await expect(page.getByText("tester@mandrii.com")).not.toBeVisible();
    await expect(page.getByText(/my profile/i)).not.toBeVisible();
    await expect(page.getByText(/sign out/i)).not.toBeVisible();

    await test.step("should show profile menu after click", async () => {
      await profileButton.click();
      await expect(page.getByText("Tester User")).toBeVisible();
      await expect(page.getByText("tester@mandrii.com")).toBeVisible();
      await expect(page.getByText(/my profile/i)).toBeVisible();
      await expect(page.getByText(/sign out/i)).toBeVisible();
    });
  });

  test("sign out clears session and shows sign in", async ({ page }) => {
    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          expires: new Date(Date.now() + 86400000).toISOString(),
          user: {
            email: "tester@mandrii.com",
            id: "tester555",
            name: "Tester User",
          },
        }),
        contentType: "application/json",
        status: 200,
      });
    });

    await page.goto("/", { waitUntil: "networkidle" });

    const profileButton = page.getByRole("button", { name: /profile/i });
    await profileButton.click();

    await page.getByText(/sign out/i).click();

    await page.route("**/api/auth/session", async (route) => {
      await route.fulfill({
        body: JSON.stringify(null),
        contentType: "application/json",
        status: 200,
      });
    });

    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    await expect(profileButton).not.toBeVisible();
  });
});
