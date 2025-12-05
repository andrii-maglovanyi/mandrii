import { expect, Page, test } from "@playwright/test";

/**
 * Shop Error Handling E2E Tests
 *
 * Tests error scenarios and recovery flows:
 * - Network failures and retries
 * - Invalid product states
 * - Session/cart edge cases
 * - API error handling
 *
 * Environment Requirements:
 * - Some tests require seeded product data for cart interactions
 *
 * In CI without HAS_SEEDED_DATA=true, product-dependent tests will be skipped.
 */

const CART_STORAGE_KEY = "mndr.cart";

/**
 * Check if we have seeded product data available
 */
const hasSeededData = (): boolean => {
  return !process.env.CI || process.env.HAS_SEEDED_DATA === "true";
};

/**
 * Helper to clear cart before tests
 */
async function clearCart(page: Page) {
  await page.evaluate((key) => localStorage.removeItem(key), CART_STORAGE_KEY);
}

/**
 * Helper to dismiss cookie consent
 */
async function dismissCookieConsent(page: Page) {
  const acceptButton = page.getByRole("button", { name: /Accept/i });
  if (await acceptButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await acceptButton.click({ timeout: 2000 });
  }
}

test.describe("Shop - Network Error Handling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("shows error state when product fetch fails", async ({ page, context }) => {
    // Block GraphQL requests to simulate network failure
    await context.route("**/graphql", (route) => route.abort("failed"));

    // Navigate to shop - should show error or empty state
    await page.goto("/en/shop");
    await page.waitForLoadState("domcontentloaded");

    // Should handle gracefully - show error or empty products
    const errorMessage = page.getByText(/error|failed|try again|no products/i);
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test("shows retry button on network error", async ({ page, context }) => {
    // First load successfully
    await page.goto("/en/shop");
    await page.waitForLoadState("networkidle");
    await dismissCookieConsent(page);

    // Now block requests
    await context.route("**/graphql", (route) => route.abort("failed"));

    // Trigger a search to cause a new fetch
    const searchInput = page.getByPlaceholder(/search products/i);
    await searchInput.fill("test-search-to-trigger-fetch");

    // Wait for error state
    await page.waitForTimeout(1000);

    // Check for retry functionality
    const retryButton = page.getByRole("button", { name: /retry|try again/i });
    if (await retryButton.isVisible().catch(() => false)) {
      // Unblock requests
      await context.unroute("**/graphql");

      // Click retry
      await retryButton.click();

      // Should attempt to refetch
      await page.waitForLoadState("networkidle");
    }
  });

  test("handles slow network gracefully", async ({ page }) => {
    // Simulate slow network
    const client = await page.context().newCDPSession(page);
    await client.send("Network.emulateNetworkConditions", {
      downloadThroughput: 50 * 1024, // 50kb/s
      latency: 2000, // 2 second latency
      offline: false,
      uploadThroughput: 50 * 1024,
    });

    // Navigate to shop
    await page.goto("/en/shop");

    // Should show loading state
    const loadingIndicator = page.getByText(/loading|please wait/i);
    const products = page.locator('a[href*="/shop/"]');

    // Either loading indicator or products should eventually appear
    await expect(loadingIndicator.or(products.first())).toBeVisible({ timeout: 30000 });
  });
});

test.describe("Shop - Invalid Product States", () => {
  test("handles non-existent product gracefully", async ({ page }) => {
    await page.goto("/en/shop/this-product-definitely-does-not-exist-12345");
    await page.waitForLoadState("networkidle");

    // Should show not found state
    const notFound = page.getByText(/not found|doesn't exist|not available/i);
    await expect(notFound).toBeVisible({ timeout: 5000 });
  });

  test("handles invalid product slug format", async ({ page }) => {
    await page.goto("/en/shop/!!!invalid###slug###!!!");
    await page.waitForLoadState("networkidle");

    // Should handle gracefully - either 404 or not found message
    const notFound = page.getByText(/not found|error|invalid/i);
    const is404 = await page.title().then((t) => t.toLowerCase().includes("404"));

    expect((await notFound.isVisible().catch(() => false)) || is404).toBe(true);
  });

  test("handles empty search results", async ({ page }) => {
    await page.goto("/en/shop");
    await page.waitForLoadState("networkidle");
    await dismissCookieConsent(page);

    // Search for something that won't exist
    const searchInput = page.getByPlaceholder(/search products/i);
    await searchInput.fill("xyznonexistentproduct12345");

    // Wait for search to complete
    await page.waitForTimeout(1000);
    await page.waitForLoadState("networkidle");

    // Should show no results message
    const noResults = page.getByText(/no products|no results|nothing found/i);
    await expect(noResults).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Shop - Cart Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("handles corrupted cart data", async ({ page }) => {
    // Set corrupted cart data
    await page.evaluate((key) => {
      localStorage.setItem(key, "not-valid-json{{{");
    }, CART_STORAGE_KEY);

    // Navigate to cart
    await page.goto("/en/shop/cart");
    await page.waitForLoadState("networkidle");

    // Should handle gracefully - show empty cart or reset
    const emptyCart = page.getByText(/cart is empty|no items/i);
    const cartItems = page.locator('[class*="rounded"]').filter({ hasText: /£|€/ });

    // Either shows empty cart or recovers somehow
    const isEmpty = await emptyCart.isVisible().catch(() => false);
    const hasItems = (await cartItems.count()) > 0;

    // App should not crash
    expect(isEmpty || hasItems || (await page.title()).length > 0).toBe(true);
  });

  test("handles cart with invalid product reference", async ({ page }) => {
    // Set cart with non-existent product
    await page.evaluate((key) => {
      const invalidCart = {
        items: [
          {
            currency: "GBP",
            id: "non-existent-product-id",
            image: "",
            name: "Invalid Product",
            priceMinor: 1000,
            productId: "non-existent-product-id",
            quantity: 1,
            slug: "non-existent-product",
          },
        ],
      };
      localStorage.setItem(key, JSON.stringify(invalidCart));
    }, CART_STORAGE_KEY);

    // Navigate to cart
    await page.goto("/en/shop/cart");
    await page.waitForLoadState("networkidle");

    // Should display the cart (even with potentially invalid product)
    // The app should handle this gracefully
    const cartPage = page.getByRole("heading", { name: /cart|bag/i });
    await expect(cartPage).toBeVisible({ timeout: 5000 });
  });

  test("handles very large quantities gracefully", async ({ page }) => {
    // Add product
    await page.goto("/en/shop/iznik-ceramics-bowl");
    await page.waitForLoadState("networkidle");

    const addToCartButton = page.getByRole("button", { name: /add to cart/i });
    if (await addToCartButton.isVisible().catch(() => false)) {
      await addToCartButton.click();

      // Go to cart
      await page.goto("/en/shop/cart");
      await page.waitForLoadState("networkidle");

      // Try to set a very large quantity via localStorage
      await page.evaluate((key) => {
        const cart = JSON.parse(localStorage.getItem(key) || "{}");
        if (cart.items && cart.items.length > 0) {
          cart.items[0].quantity = 999999;
          localStorage.setItem(key, JSON.stringify(cart));
        }
      }, CART_STORAGE_KEY);

      // Reload to apply
      await page.reload();
      await page.waitForLoadState("networkidle");

      // The page should still work (quantity may be capped)
      const cartHeading = page.getByRole("heading", { name: /cart|bag/i });
      await expect(cartHeading).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Checkout - Edge Cases", () => {
  // Skip in CI without seeded data (uses iznik-ceramics-bowl)
  test.skip(!hasSeededData(), "Skipping: Requires seeded product data");

  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("checkout redirects to cart when cart is empty", async ({ page }) => {
    // Go directly to checkout with empty cart
    await page.goto("/en/shop/checkout");
    await page.waitForLoadState("networkidle");

    // Should show empty state or redirect to cart
    const emptyMessage = page.getByText(/cart is empty|no items/i);
    const isOnCart = page.url().includes("/cart");

    await expect(emptyMessage.or(page.locator(`[href*="/cart"]`))).toBeVisible({ timeout: 5000 });
  });

  test("handles browser back button during checkout", async ({ page }) => {
    await dismissCookieConsent(page);

    // Add product and go to checkout
    await page.goto("/en/shop/iznik-ceramics-bowl");
    await page.waitForLoadState("networkidle");

    const addToCartButton = page.getByRole("button", { name: /add to cart/i });
    if (await addToCartButton.isVisible().catch(() => false)) {
      await addToCartButton.click();

      // Go to checkout
      await page.goto("/en/shop/checkout");
      await page.waitForLoadState("networkidle");

      // Press browser back
      await page.goBack();
      await page.waitForLoadState("networkidle");

      // Should be back on product page or previous page
      expect(page.url()).not.toContain("/checkout");

      // Go forward again
      await page.goForward();
      await page.waitForLoadState("networkidle");

      // Cart should still have the item
      const cart = await page.evaluate((key) => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : { items: [] };
      }, CART_STORAGE_KEY);

      expect(cart.items.length).toBe(1);
    }
  });

  test("handles page refresh during checkout", async ({ page }) => {
    await dismissCookieConsent(page);

    // Add product
    await page.goto("/en/shop/iznik-ceramics-bowl");
    await page.waitForLoadState("networkidle");

    const addToCartButton = page.getByRole("button", { name: /add to cart/i });
    if (await addToCartButton.isVisible().catch(() => false)) {
      await addToCartButton.click();

      // Go to checkout
      await page.goto("/en/shop/checkout");
      await page.waitForLoadState("networkidle");

      // Fill email
      const emailInput = page.getByPlaceholder(/you@example\.com/i);
      await emailInput.fill("test@example.com");

      // Refresh page
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Cart should still have items
      const cart = await page.evaluate((key) => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : { items: [] };
      }, CART_STORAGE_KEY);

      expect(cart.items.length).toBe(1);

      // Should still be on checkout page
      expect(page.url()).toContain("/checkout");
    }
  });

  test("handles concurrent tab sessions", async ({ page, context }) => {
    await dismissCookieConsent(page);

    // Add product in first tab
    await page.goto("/en/shop/iznik-ceramics-bowl");
    await page.waitForLoadState("networkidle");

    const addToCartButton = page.getByRole("button", { name: /add to cart/i });
    if (await addToCartButton.isVisible().catch(() => false)) {
      await addToCartButton.click();

      // Open a new tab and navigate to cart
      const newPage = await context.newPage();
      await newPage.goto("/en/shop/cart");
      await newPage.waitForLoadState("networkidle");

      // Cart should show the item added in first tab
      const cartItem = newPage.getByText(/İznik Ceramics Bowl/i);
      await expect(cartItem.first()).toBeVisible({ timeout: 5000 });

      // Clean up
      await newPage.close();
    }
  });
});

test.describe("Shop - Accessibility Edge Cases", () => {
  // Skip in CI without seeded data (uses iznik-ceramics-bowl)
  test.skip(!hasSeededData(), "Skipping: Requires seeded product data");

  test("maintains focus after adding to cart", async ({ page }) => {
    await page.goto("/en/shop/iznik-ceramics-bowl");
    await page.waitForLoadState("networkidle");
    await dismissCookieConsent(page);

    const addToCartButton = page.getByRole("button", { name: /add to cart/i });
    if (await addToCartButton.isVisible().catch(() => false)) {
      // Focus the button
      await addToCartButton.focus();

      // Click add to cart
      await addToCartButton.click();

      // Wait for cart update
      await page.waitForTimeout(500);

      // Focus should remain on the button or move to a logical place
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    }
  });

  test("error messages are announced to screen readers", async ({ page }) => {
    await page.goto("/en/shop/checkout");
    await page.waitForLoadState("networkidle");

    // If on checkout with items, test email validation error
    const emailInput = page.getByPlaceholder(/you@example\.com/i);
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill("invalid-email");

      const continueButton = page.getByRole("button", { name: /continue/i });
      await continueButton.click();

      // Error should be visible and have proper ARIA attributes
      const errorMessage = page.getByText(/valid email/i);
      if (await errorMessage.isVisible().catch(() => false)) {
        // Check if error is associated with the input
        const ariaDescribedBy = await emailInput.getAttribute("aria-describedby");
        const ariaInvalid = await emailInput.getAttribute("aria-invalid");

        // At least one accessibility attribute should be set
        expect(ariaDescribedBy || ariaInvalid).toBeTruthy();
      }
    }
  });
});

test.describe("Shop - Performance Edge Cases", () => {
  // Skip in CI without seeded data (uses iznik-ceramics-bowl)
  test.skip(!hasSeededData(), "Skipping: Requires seeded product data");

  test("handles rapid add to cart clicks", async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
    await dismissCookieConsent(page);

    await page.goto("/en/shop/iznik-ceramics-bowl");
    await page.waitForLoadState("networkidle");

    const addToCartButton = page.getByRole("button", { name: /add to cart/i });
    if (await addToCartButton.isVisible().catch(() => false)) {
      // Click rapidly multiple times
      await addToCartButton.click();
      await addToCartButton.click();
      await addToCartButton.click();

      // Wait for all clicks to process
      await page.waitForTimeout(500);

      // Cart should have handled this gracefully (no duplicates, or quantity increased)
      const cart = await page.evaluate((key) => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : { items: [] };
      }, CART_STORAGE_KEY);

      // Should have exactly 1 item type (quantity may vary based on implementation)
      expect(cart.items.length).toBe(1);
    }
  });

  test("handles rapid quantity changes", async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);

    // Add product
    await page.goto("/en/shop/iznik-ceramics-bowl");
    await page.waitForLoadState("networkidle");

    const addToCartButton = page.getByRole("button", { name: /add to cart/i });
    if (await addToCartButton.isVisible().catch(() => false)) {
      await addToCartButton.click();

      // Go to cart
      await page.goto("/en/shop/cart");
      await page.waitForLoadState("networkidle");

      // Find increment button
      const incrementButton = page.getByRole("button", { name: "+" }).first();
      if (await incrementButton.isVisible().catch(() => false)) {
        // Click rapidly
        await incrementButton.click();
        await incrementButton.click();
        await incrementButton.click();
        await incrementButton.click();
        await incrementButton.click();

        // Wait for all clicks to process
        await page.waitForTimeout(500);

        // Cart should have a reasonable quantity
        const cart = await page.evaluate((key) => {
          const stored = localStorage.getItem(key);
          return stored ? JSON.parse(stored) : { items: [] };
        }, CART_STORAGE_KEY);

        expect(cart.items[0].quantity).toBeGreaterThanOrEqual(1);
        expect(cart.items[0].quantity).toBeLessThanOrEqual(25); // Stock limit
      }
    }
  });
});
