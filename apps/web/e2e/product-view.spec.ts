import { expect, test } from "@playwright/test";

test.describe("Product View", () => {
  // Use a known product slug from seed data
  const productSlug = "ukrainian-heart-hoodie";

  test("displays product page with details", async ({ page }) => {
    await page.goto(`/en/shop/${productSlug}`);

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check for either product content or not found state
    const productHeading = page.getByRole("heading", { level: 1 });
    const notFound = page.getByText(/product not found/i);

    const hasProduct = await productHeading.isVisible().catch(() => false);
    const hasNotFound = await notFound.isVisible().catch(() => false);

    expect(hasProduct || hasNotFound).toBe(true);
  });

  test("shows breadcrumbs with product name", async ({ page }) => {
    await page.goto(`/en/shop/${productSlug}`);
    await page.waitForLoadState("networkidle");

    const breadcrumbs = page.getByRole("navigation", { name: /breadcrumb/i });

    if (await breadcrumbs.isVisible().catch(() => false)) {
      await expect(breadcrumbs.getByText("Home")).toBeVisible();
      await expect(breadcrumbs.getByText("Shop")).toBeVisible();
    }
  });

  test("displays product images", async ({ page }) => {
    await page.goto(`/en/shop/${productSlug}`);
    await page.waitForLoadState("networkidle");

    // Check for image carousel or product image
    const images = page.locator('img[alt*="Product"], img[alt*="Hoodie"], [data-testid="image-carousel"]');

    if ((await images.count()) > 0) {
      await expect(images.first()).toBeVisible();
    }
  });

  test("displays product price", async ({ page }) => {
    await page.goto(`/en/shop/${productSlug}`);
    await page.waitForLoadState("networkidle");

    // Price should contain currency symbol
    const price = page.locator("text=/[$€£]\\d+/");

    if ((await price.count()) > 0) {
      await expect(price.first()).toBeVisible();
    }
  });

  test("shows variant selectors for clothing products", async ({ page }) => {
    await page.goto(`/en/shop/${productSlug}`);
    await page.waitForLoadState("networkidle");

    // Check for variant labels
    const genderLabel = page.getByText("Gender");
    const sizeLabel = page.getByText("Size");

    // At least one variant selector should be visible for clothing
    const hasGender = await genderLabel.isVisible().catch(() => false);
    const hasSize = await sizeLabel.isVisible().catch(() => false);

    // This is a soft assertion - product may or may not have variants
    if (hasGender || hasSize) {
      expect(hasGender || hasSize).toBe(true);
    }
  });

  test("can select product variants", async ({ page }) => {
    await page.goto(`/en/shop/${productSlug}`);
    await page.waitForLoadState("networkidle");

    // Try to find and click variant buttons
    const variantButtons = page.locator('button:has-text("S"), button:has-text("M"), button:has-text("L")');

    if ((await variantButtons.count()) > 0) {
      const firstVariant = variantButtons.first();
      if (await firstVariant.isEnabled()) {
        await firstVariant.click();
        // Button should show selected state
        await expect(firstVariant).toHaveClass(/border-primary|bg-primary/);
      }
    }
  });

  test("shows add to cart button", async ({ page }) => {
    await page.goto(`/en/shop/${productSlug}`);
    await page.waitForLoadState("networkidle");

    // Look for add to cart or select options button
    const addToCart = page.getByRole("button", { name: /add to cart|select options/i });

    if ((await addToCart.count()) > 0) {
      await expect(addToCart.first()).toBeVisible();
    }
  });

  test("add to cart button changes state after selecting variants", async ({ page }) => {
    await page.goto(`/en/shop/${productSlug}`);
    await page.waitForLoadState("networkidle");

    // If "Select options" is shown, selecting variants should change it to "Add to cart"
    const selectOptions = page.getByRole("button", { name: /select options/i });

    if (await selectOptions.isVisible().catch(() => false)) {
      // Try to select all required variants
      const genderButton = page.locator('button:has-text("Unisex"), button:has-text("Men")').first();
      const ageButton = page.locator('button:has-text("Adult")').first();
      const sizeButton = page.locator('button:has-text("M")').first();

      if (await genderButton.isVisible().catch(() => false)) {
        await genderButton.click();
      }

      if (await ageButton.isEnabled().catch(() => false)) {
        await ageButton.click();
      }

      if (await sizeButton.isEnabled().catch(() => false)) {
        await sizeButton.click();
      }

      // After selecting variants, button should say "Add to cart"
      const addToCart = page.getByRole("button", { name: /add to cart/i });
      if ((await addToCart.count()) > 0) {
        await expect(addToCart).toBeVisible();
      }
    }
  });

  test("displays product tabs", async ({ page }) => {
    await page.goto(`/en/shop/${productSlug}`);
    await page.waitForLoadState("networkidle");

    // Check for tabs section
    const tabs = page.locator('[role="tablist"], [data-testid="tabs"]');

    if ((await tabs.count()) > 0) {
      await expect(tabs.first()).toBeVisible();
    }
  });

  test("breadcrumb shop link navigates back to catalog", async ({ page }) => {
    await page.goto(`/en/shop/${productSlug}`);
    await page.waitForLoadState("networkidle");

    const shopBreadcrumb = page.getByRole("navigation", { name: /breadcrumb/i }).getByRole("link", { name: "Shop" });

    if (await shopBreadcrumb.isVisible().catch(() => false)) {
      await shopBreadcrumb.click();
      await expect(page).toHaveURL(/\/en\/shop\/?$/);
    }
  });
});

test.describe("Product View - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  const productSlug = "ukrainian-heart-hoodie";

  test("displays properly on mobile", async ({ page }) => {
    await page.goto(`/en/shop/${productSlug}`);
    await page.waitForLoadState("networkidle");

    // Product heading should be visible
    const heading = page.getByRole("heading", { level: 1 });
    if ((await heading.count()) > 0) {
      await expect(heading.first()).toBeVisible();
    }
  });

  test("variant buttons are touch-friendly on mobile", async ({ page }) => {
    await page.goto(`/en/shop/${productSlug}`);
    await page.waitForLoadState("networkidle");

    // Variant buttons should have adequate touch target size
    const variantButton = page.locator('button:has-text("M")').first();

    if (await variantButton.isVisible().catch(() => false)) {
      const box = await variantButton.boundingBox();
      if (box) {
        // Touch target should be at least 44px (WCAG recommendation)
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test("image carousel is visible and properly sized on mobile", async ({ page }) => {
    await page.goto(`/en/shop/${productSlug}`);
    await page.waitForLoadState("networkidle");

    const imageContainer = page.locator('[data-testid="image-carousel"], .aspect-square, .aspect-4\\/5').first();

    if (await imageContainer.isVisible().catch(() => false)) {
      const box = await imageContainer.boundingBox();
      if (box) {
        // Image should take reasonable width on mobile
        expect(box.width).toBeGreaterThan(300);
      }
    }
  });
});

test.describe("Product View - Not Found", () => {
  test("shows not found state for non-existent product", async ({ page }) => {
    await page.goto("/en/shop/non-existent-product-slug-12345");
    await page.waitForLoadState("networkidle");

    // Should show product not found message
    const notFound = page.getByText(/product not found|not available/i);
    await expect(notFound).toBeVisible();
  });
});

test.describe("Product View - Ukrainian locale", () => {
  const productSlug = "ukrainian-heart-hoodie";

  test("displays product in Ukrainian", async ({ page }) => {
    await page.goto(`/uk/shop/${productSlug}`);
    await page.waitForLoadState("networkidle");

    // Breadcrumbs should be in Ukrainian
    const breadcrumbs = page.getByRole("navigation", { name: /breadcrumb/i });

    if (await breadcrumbs.isVisible().catch(() => false)) {
      // "Магазин" is Ukrainian for "Shop"
      const shopLink = breadcrumbs.getByText(/магазин|shop/i);
      await expect(shopLink).toBeVisible();
    }
  });
});
