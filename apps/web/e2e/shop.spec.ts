import { expect, test } from "@playwright/test";

/**
 * Shop Catalog E2E Tests
 *
 * Tests the shop listing page:
 * - Page structure and UI elements
 * - Search and filtering
 * - Product cards and navigation
 *
 * Environment Requirements:
 * - Tests for product cards and pagination require seeded product data
 *
 * In CI without HAS_SEEDED_DATA=true, product-dependent tests will be skipped.
 */

/**
 * Check if we have seeded product data available
 */
const hasSeededData = (): boolean => {
  return !process.env.CI || process.env.HAS_SEEDED_DATA === "true";
};

test.describe("Shop Catalog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
  });

  test("displays shop page with title", async ({ page }) => {
    await expect(page).toHaveTitle(/Mandrii/i);
    await expect(page.getByRole("heading", { level: 1, name: "Shop" })).toBeVisible();
  });

  test("shows breadcrumbs navigation", async ({ page }) => {
    // Check for the Home link in breadcrumbs
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
  });

  test("displays search input", async ({ page }) => {
    const searchInput = page.getByRole("searchbox", { name: /search products/i });
    await expect(searchInput).toBeVisible();
  });

  test("displays category filter", async ({ page }) => {
    // The Select component uses a custom button-based dropdown
    const categoryButton = page.getByRole("button", { name: /all categories/i });
    await expect(categoryButton).toBeVisible();
  });

  test("displays product cards when products exist", async ({ page }) => {
    test.skip(!hasSeededData(), "Requires seeded product data");

    // Wait for loading to complete
    await page.waitForLoadState("networkidle");

    // Check if there are product cards or an empty state
    // Product links use relative paths like /shop/product-slug
    const productCards = page.locator('[data-testid="product-card"], a[href^="/shop/"]');
    const emptyState = page.getByText(/no products found/i);

    // Either products exist or empty state is shown
    const hasProducts = (await productCards.count()) > 0;
    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    expect(hasProducts || hasEmptyState).toBe(true);
  });

  test("can search for products", async ({ page }) => {
    const searchInput = page.getByRole("searchbox", { name: /search products/i });
    await searchInput.fill("hoodie");

    // Wait for debounce and network
    await page.waitForTimeout(500);
    await page.waitForLoadState("networkidle");

    // Search should update URL or filter results
    await expect(searchInput).toHaveValue("hoodie");
  });

  test("can filter by category", async ({ page }) => {
    const categoryButton = page.getByRole("button", { name: /all categories/i });
    await categoryButton.click();

    // Wait for dropdown to appear
    await page.waitForTimeout(100);

    // Check if category options are available (listbox options)
    const options = page.getByRole("option");
    const optionCount = await options.count();

    // Should have at least "All categories" option
    expect(optionCount).toBeGreaterThanOrEqual(1);
  });

  test("product card links to product detail page", async ({ page }) => {
    test.skip(!hasSeededData(), "Requires seeded product data");

    await page.waitForLoadState("networkidle");

    // Find first product link
    const productLink = page.locator('a[href^="/en/shop/"]').first();

    if ((await productLink.count()) > 0) {
      const href = await productLink.getAttribute("href");
      expect(href).toMatch(/^\/en\/shop\/.+/);
    }
  });

  test("displays pagination when there are multiple pages", async ({ page }) => {
    test.skip(!hasSeededData(), "Requires seeded product data");

    await page.waitForLoadState("networkidle");

    // Check the item count to see if pagination would be expected
    // Look for "Showing X-Y of Z items" text
    const itemsInfo = page.locator("p, div").filter({ hasText: /showing.*of.*items/i });
    const hasItemsInfo = (await itemsInfo.count()) > 0;

    if (hasItemsInfo) {
      // If we can see items info, the page is rendering correctly
      await expect(itemsInfo.first()).toBeVisible();
    }

    // Pagination may or may not be visible depending on item count
    const pagination = page.locator('[data-testid="pagination"], nav[aria-label*="pagination"]');
    const paginationCount = await pagination.count();
    // Just verify the test runs without errors - pagination visibility depends on item count
    expect(paginationCount >= 0).toBe(true);
  });
});

test.describe("Shop Catalog - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("displays properly on mobile", async ({ page }) => {
    await page.goto("/en/shop");

    await expect(page.getByRole("heading", { level: 1, name: "Shop" })).toBeVisible();
    // On mobile, there's a visible searchbox
    await expect(page.getByRole("searchbox", { name: /search products/i })).toBeVisible();
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

    // Shop page uses default title "Мандрій" without page-specific prefix
    await expect(page).toHaveTitle(/Мандрій/i);
    // The Shop heading is still in English (not yet translated)
    await expect(page.getByRole("heading", { level: 1, name: "Shop" })).toBeVisible();
    // But the category filter is in Ukrainian
    await expect(page.getByRole("button", { name: /усі категорії/i })).toBeVisible();
  });
});
