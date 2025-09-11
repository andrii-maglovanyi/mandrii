import { expect, test } from "@playwright/test";

test.describe("Theme toggle (desktop)", () => {
  test.use({ viewport: { height: 800, width: 1280 } });

  test("should switch between light and dark mode and persist", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByTestId("theme-toggle-desktop");
    const html = page.locator("html");

    await expect(html).not.toHaveClass(/dark/);
    await toggle.click();
    await expect(html).toHaveClass(/dark/);

    await page.reload();
    await expect(html).toHaveClass(/dark/);

    await toggle.click();
    await expect(html).not.toHaveClass(/dark/);
  });
});

test.describe("Theme toggle (mobile)", () => {
  test.use({ viewport: { height: 812, width: 375 } }); // iPhone X

  test("should switch between light and dark mode and persist", async ({ page }) => {
    await page.goto("/");

    const html = page.locator("html");

    // Open mobile menu
    const menuButton = page.getByTestId("mobile-menu-toggle");
    await menuButton.click();

    // Now theme toggle is visible
    const toggle = page.getByTestId("theme-toggle-mobile");

    await expect(html).not.toHaveClass(/dark/);
    await toggle.click();
    await expect(html).toHaveClass(/dark/);

    await page.reload();
    await expect(html).toHaveClass(/dark/);

    // Open menu again after reload
    await menuButton.click();
    await toggle.click();
    await expect(html).not.toHaveClass(/dark/);
  });
});
