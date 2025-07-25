import { expect, test } from "@playwright/test";

test("can submit contact form successfully", async ({ page }) => {
  await page.goto("/contact");

  await page.fill('input[name="name"]', "Tester User");
  await page.fill('input[name="email"]', "tester@example.com");
  await page.fill('textarea[name="message"]', "This is a test message.");

  const submitButton = page.getByRole("button", { name: /send message/i });

  await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes("/api/contact") && res.status() === 200,
    ),
    submitButton.click(),
  ]);

  await expect(page.getByText(/thanks for your message!/i)).toBeVisible();
});
