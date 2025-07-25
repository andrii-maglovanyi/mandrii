import { expect, test } from "@playwright/test";

test("has english title", async ({ page }) => {
  await page.goto("/en");
  await expect(page).toHaveTitle(/Mandrii/);
});

test("has title", async ({ page }) => {
  await page.goto("/uk");
  await expect(page).toHaveTitle(/Мандрій/);
});
