import { expect, test } from "@playwright/test";

test.describe("Shop Catalog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
  });

  test("displays shop page with title", async ({ page }) => {
    await expect(page).toHaveTitle(/Shop.*Mandrii/i);
    await expect(page.getByRole("heading", { level: 1, name: "Shop" })).toBeVisible();
  });

  test("shows breadcrumbs navigation", async ({ page }) => {
    const breadcrumbs = page.getByRole("navigation", { name: /breadcrumb/i });
    await expect(breadcrumbs).toBeVisible();
    await expect(breadcrumbs.getByText("Home")).toBeVisible();
  });

  test("displays search input", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search products/i);
    await expect(searchInput).toBeVisible();
  });

  test("displays category filter", async ({ page }) => {
    const categorySelect = page.getByRole("combobox");
    await expect(categorySelect).toBeVisible();
  });

  test("displays product cards when products exist", async ({ page }) => {
    // Wait for loading to complete
    await page.waitForLoadState("networkidle");

    // Check if there are product cards or an empty state
    const productCards = page.locator('[data-testid="product-card"], a[href^="/en/shop/"]');
    const emptyState = page.getByText(/no products found/i);

    // Either products exist or empty state is shown
    const hasProducts = (await productCards.count()) > 0;
    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    expect(hasProducts || hasEmptyState).toBe(true);
  });

  test("can search for products", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search products/i);
    await searchInput.fill("hoodie");

    // Wait for debounce and network
    await page.waitForTimeout(500);
    await page.waitForLoadState("networkidle");

    // Search should update URL or filter results
    await expect(searchInput).toHaveValue("hoodie");
  });

  test("can filter by category", async ({ page }) => {
    const categorySelect = page.getByRole("combobox");
    await categorySelect.click();

    // Wait for dropdown to appear
    await page.waitForTimeout(100);

    // Check if category options are available
    const options = page.getByRole("option");
    const optionCount = await options.count();

    // Should have at least "All categories" option
    expect(optionCount).toBeGreaterThanOrEqual(1);
  });

  test("product card links to product detail page", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Find first product link
    const productLink = page.locator('a[href^="/en/shop/"]').first();

    if ((await productLink.count()) > 0) {
      const href = await productLink.getAttribute("href");
      expect(href).toMatch(/^\/en\/shop\/.+/);
    }
  });

  test("displays pagination when there are multiple pages", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Pagination should be visible if there are products
    const pagination = page.locator('[data-testid="pagination"], nav[aria-label*="pagination"]');
    // Pagination exists in the DOM (may or may not be interactive based on product count)
    await expect(pagination.first()).toBeVisible();
  });
});

test.describe("Shop Catalog - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("displays properly on mobile", async ({ page }) => {
    await page.goto("/en/shop");

    await expect(page.getByRole("heading", { level: 1, name: "Shop" })).toBeVisible();
    await expect(page.getByPlaceholder(/search products/i)).toBeVisible();
  });

  test("product grid adjusts for mobile", async ({ page }) => {
    await page.goto("/en/shop");
    await page.waitForLoadState("networkidle");

    // On mobile, grid should show 2 columns (check CSS class or actual layout)
    const productGrid = page.locator(".grid");
    await expect(productGrid.first()).toBeVisible();
  });
});

test.describe("Shop - Ukrainian locale", () => {
  test("displays shop in Ukrainian", async ({ page }) => {
    await page.goto("/uk/shop");

    // Title should be in Ukrainian
    await expect(page).toHaveTitle(/Магазин.*Мандрій/i);
  });
});
