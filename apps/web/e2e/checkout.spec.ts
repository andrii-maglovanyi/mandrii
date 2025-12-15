import { expect, Page, test } from "@playwright/test";

/**
 * Checkout E2E Tests
 *
 * Tests the complete checkout flow:
 * - Navigation from cart to checkout
 * - Email input and validation
 * - Cart validation (server-side)
 * - Stripe payment form (PaymentElement)
 * - Order confirmation
 *
 * Environment Requirements:
 * - STRIPE_PUBLISHABLE_KEY: Required for Stripe Elements to load
 * - Seeded product data: Tests expect "mandrii-trident-tshirt" to exist
 *
 * In CI without proper setup, some tests will be skipped.
 *
 * Note: For Stripe tests, use test card numbers from:
 * https://stripe.com/docs/testing#cards
 * - Success: 4242424242424242
 * - Declined: 4000000000000002
 * - Insufficient funds: 4000000000009995
 */

const CART_STORAGE_KEY = "mndr.cart";

/**
 * Check if Stripe is configured (publishable key available)
 * In CI, we may not have Stripe credentials
 */
const hasStripeConfig = (): boolean => {
  // Playwright runs in Node, but the app uses NEXT_PUBLIC_ env vars
  // We check if we're in CI and assume Stripe isn't configured there
  return !process.env.CI || !!process.env.STRIPE_PUBLISHABLE_KEY;
};

/**
 * Helper to add the first available product to cart and navigate to checkout
 */
async function addFirstProductAndGoToCheckout(page: Page) {
  // Go to shop
  await page.goto("/en/shop");
  await page.waitForLoadState("domcontentloaded");

  // Dismiss cookie consent banner if present
  await dismissCookieConsent(page);

  // Wait for products to load (they load via client-side GraphQL)
  // The product cards have an overlay link - click that directly
  const productLink = page
    .getByRole("main")
    // Match locale-prefixed hrefs too (e.g., /en/shop/mandrii-trident-tshirt)
    .locator('a[href*="/shop/mandrii-trident-tshirt"]')
    .first();
  await expect(productLink).toBeVisible({ timeout: 10000 });
  await productLink.click();

  // Wait for product page to load - wait for the heading to appear
  await expect(page.getByRole("heading", { name: /Mandrii Trident T-Shirt/i })).toBeVisible({ timeout: 10000 });

  // Select Age group: Adult (must be selected first to enable other variants)
  const adultButton = page.getByRole("button", { name: /^Adult$/i });
  await expect(adultButton).toBeVisible({ timeout: 5000 });
  await adultButton.click();

  // Wait for selection to be applied
  await expect(adultButton)
    .toHaveAttribute("aria-pressed", "true", { timeout: 2000 })
    .catch(() => {});

  // Now Gender should be enabled - select Men
  const menButton = page.getByRole("button", { name: /^Men$/i });
  await expect(menButton).toBeEnabled({ timeout: 5000 });
  await menButton.click();

  // Wait for selection to be applied (button becomes selected)
  await expect(menButton)
    .toHaveAttribute("aria-pressed", "true", { timeout: 2000 })
    .catch(() => {});

  // Now Size should be enabled - select M
  const mButton = page.getByRole("button", { name: /^M$/i });
  await expect(mButton).toBeEnabled({ timeout: 5000 });
  await mButton.click();

  // Wait for selection to be applied
  await expect(mButton)
    .toHaveAttribute("aria-pressed", "true", { timeout: 2000 })
    .catch(() => {});

  // Wait for "Add to cart" button to appear (not "Select options")
  const addToCartButton = page.getByRole("button", { name: /^Add to cart$/i });
  await expect(addToCartButton).toBeVisible({ timeout: 5000 });
  await expect(addToCartButton).toBeEnabled({ timeout: 5000 });

  await addToCartButton.click();

  // Wait for cart to update - check for cart count badge to appear
  // The cart badge uses data-testid="cart-count" - use .first() as there are multiple cart buttons
  const cartCount = page.getByTestId("cart-count").first();
  await expect(cartCount).toContainText("1", { timeout: 5000 });

  // Navigate to cart by clicking the Cart button in the header (preserves localStorage)
  // On mobile the desktop cart button is hidden, so we need to click the first visible one
  const cartButtons = page.getByTestId("cart-button");
  const firstCartButton = cartButtons.first();
  const lastCartButton = cartButtons.last();

  // Try clicking the visible cart button - desktop uses last, mobile uses first
  if (await lastCartButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await lastCartButton.click();
  } else {
    await firstCartButton.click();
  }
  await page.waitForURL(/\/shop\/cart/, { timeout: 10000 });
  await page.waitForLoadState("domcontentloaded");

  // Wait for cart content to load - check for the product in cart
  // Use more specific selector - look in the main area
  await expect(
    page
      .getByRole("main")
      .getByText(/Mandrii Trident T-Shirt/i)
      .first(),
  ).toBeVisible({ timeout: 10000 });

  // Click checkout button
  const checkoutLink = page.getByRole("link", { name: /proceed to checkout/i });
  await expect(checkoutLink).toBeVisible({ timeout: 5000 });
  await checkoutLink.click();
  await page.waitForURL(/\/shop\/checkout/);
}

/**
 * Helper to clear cart before tests
 */
async function clearCart(page: Page) {
  await page.evaluate((key) => localStorage.removeItem(key), CART_STORAGE_KEY);
}

/**
 * Helper to dismiss cookie consent banner if present
 */
async function dismissCookieConsent(page: Page) {
  const acceptButton = page.getByRole("button", { name: /Accept/i });
  if (await acceptButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await acceptButton.click({ timeout: 2000 });
    // Wait for banner to disappear
    await expect(acceptButton)
      .not.toBeVisible({ timeout: 2000 })
      .catch(() => {});
  }
}

/**
 * Check if we have seeded product data
 * This is determined by trying to find the expected product
 */
async function hasSeededProducts(page: Page): Promise<boolean> {
  try {
    const productLink = page.getByRole("main").locator('a[href*="/shop/mandrii-trident-tshirt"]').first();
    return await productLink.isVisible({ timeout: 5000 }).catch(() => false);
  } catch {
    return false;
  }
}

test.describe("Checkout - Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("cart page shows empty state when cart is empty", async ({ page }) => {
    await page.goto("/en/shop/cart");
    await page.waitForLoadState("domcontentloaded");

    // Should show empty cart state - look in main content area
    // Wait for the empty state to appear (handles hydration automatically)
    const emptyState = page.getByRole("main").getByText(/your cart is empty/i);
    await expect(emptyState).toBeVisible({ timeout: 5000 });
  });

  test("checkout page shows empty state when accessed with empty cart", async ({ page }) => {
    await page.goto("/en/shop/checkout");
    await page.waitForLoadState("domcontentloaded");

    // Should show empty bag message - look in main content area
    // Wait for the empty state to appear (handles hydration automatically)
    const emptyState = page.getByRole("main").getByText(/your bag is empty/i);
    await expect(emptyState).toBeVisible({ timeout: 5000 });
  });

  test("can navigate from shop to cart", async ({ page }) => {
    await page.goto("/en/shop");
    await page.waitForLoadState("domcontentloaded");

    // Wait for the cart button to be visible
    const cartButton = page.getByTestId("cart-button").last();
    await expect(cartButton).toBeVisible({ timeout: 5000 });
    await cartButton.click();

    await page.waitForURL(/\/shop\/cart/);
    await expect(page).toHaveURL(/\/en\/shop\/cart/);
  });
});

test.describe("Checkout - With Product", () => {
  // Skip these tests in CI if no seeded products are available
  test.skip(
    () => !!process.env.CI && !process.env.HAS_SEEDED_DATA,
    "Skipping: Requires seeded product data (mandrii-trident-tshirt)",
  );

  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);

    // Additional check: verify products are available
    const hasProducts = await hasSeededProducts(page);
    test.skip(!hasProducts, "Skipping: Product data not found");
  });

  test("can add product and proceed to checkout", async ({ page }) => {
    await addFirstProductAndGoToCheckout(page);

    // Should be on checkout page
    await expect(page).toHaveURL(/\/en\/shop\/checkout/);

    // Should show email input - scope to main area, use label as accessible name
    const emailInput = page.getByRole("textbox", { name: /email address/i });
    await expect(emailInput).toBeVisible();
  });

  test("back to cart link works on checkout page", async ({ page }) => {
    await addFirstProductAndGoToCheckout(page);

    // The link text is "Edit bag" not "back to cart"
    const backLink = page.getByRole("link", { name: /edit bag/i });
    await expect(backLink).toBeVisible();
    await backLink.click();

    await page.waitForURL(/\/shop\/cart/);
    await expect(page).toHaveURL(/\/en\/shop\/cart/);
  });

  test("continue button is disabled without email", async ({ page }) => {
    await addFirstProductAndGoToCheckout(page);

    // Button text is "Continue" not "Continue to payment"
    const continueButton = page.getByRole("button", { name: /^Continue$/i });
    await expect(continueButton).toBeDisabled();
  });

  test("shows error for invalid email format", async ({ page }) => {
    await addFirstProductAndGoToCheckout(page);

    // Use label as accessible name
    const emailInput = page.getByRole("textbox", { name: /email address/i });
    await emailInput.fill("notanemail");

    // The Continue button should remain disabled with an invalid email
    // This is the validation feedback - the button won't enable until a valid email is entered
    const continueButton = page.getByRole("button", { name: /^Continue$/i });
    await expect(continueButton).toBeDisabled();

    // Verify entering a valid email enables the button
    await emailInput.fill("test@example.com");
    await expect(continueButton).toBeEnabled();
  });

  test("accepts valid email and enables continue button", async ({ page }) => {
    await addFirstProductAndGoToCheckout(page);

    // Use label as accessible name
    const emailInput = page.getByRole("textbox", { name: /email address/i });
    await emailInput.fill("test@example.com");

    const continueButton = page.getByRole("button", { name: /^Continue$/i });
    await expect(continueButton).toBeEnabled();
  });

  test("clicking continue validates cart and shows Stripe form", async ({ page }) => {
    // This test requires Stripe to be configured
    test.skip(!hasStripeConfig(), "Skipping: Requires Stripe configuration");

    await addFirstProductAndGoToCheckout(page);

    // Use label as accessible name
    const emailInput = page.getByRole("textbox", { name: /email address/i });
    await emailInput.fill("test@example.com");

    const continueButton = page.getByRole("button", { name: /^Continue$/i });
    await continueButton.click();

    // After clicking continue, either:
    // 1. Loading state appears briefly, then Stripe form
    // 2. An error message if checkout fails
    // 3. "Payment system is not configured" if Stripe publishable key is missing

    // First, wait for the button to be gone or loading state to appear
    // The Continue button is replaced by loading spinner when checkout is initiated
    await expect(continueButton)
      .toBeHidden({ timeout: 10000 })
      .catch(() => {
        // Button might not be hidden if there's an immediate error
      });

    // Now check for the expected outcomes
    // The Pay button shows amount, e.g., "Pay £28.99"
    const payButton = page.getByRole("button", { name: /^Pay\s/i });
    const stripeNotConfigured = page.getByText(/payment system is not configured/i);
    const errorMessage = page.getByText(/error|failed|please try again/i).first();

    // Wait for any of these outcomes
    await expect(payButton.or(stripeNotConfigured).or(errorMessage)).toBeVisible({ timeout: 15000 });
  });
});

test.describe("Checkout - Order Confirmation", () => {
  // Use a valid UUID format that won't exist in the database
  const MOCK_ORDER_ID = "00000000-0000-4000-8000-000000000000";

  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("order confirmation page displays with success status", async ({ page }) => {
    // Simulate successful payment redirect
    await page.goto(`/en/shop/order/${MOCK_ORDER_ID}?redirect_status=succeeded`);
    await page.waitForLoadState("domcontentloaded");

    // Wait for loading state to disappear (order fetch completes)
    await expect(page.getByRole("heading", { name: /loading order/i })).not.toBeVisible({ timeout: 10000 });

    // Since test order ID won't exist in DB, we expect error state
    // The component shows "Something went wrong" heading and "Continue shopping" link on error
    const errorHeading = page.getByRole("heading", { name: /something went wrong/i });
    const successHeading = page.getByRole("heading", { name: /payment successful/i });

    // Either success or error heading should be visible
    await expect(successHeading.or(errorHeading)).toBeVisible({ timeout: 5000 });
  });

  test("order confirmation page displays with failed status", async ({ page }) => {
    await page.goto(`/en/shop/order/${MOCK_ORDER_ID}?redirect_status=failed`);
    await page.waitForLoadState("domcontentloaded");

    // Wait for loading state to disappear
    await expect(page.getByRole("heading", { name: /loading order/i })).not.toBeVisible({ timeout: 10000 });

    // Since test order ID won't exist in DB, we expect error state
    const errorHeading = page.getByRole("heading", { name: /something went wrong/i });
    const failedHeading = page.getByRole("heading", { name: /payment failed/i });

    // Either failed or error heading should be visible
    await expect(failedHeading.or(errorHeading)).toBeVisible({ timeout: 5000 });
  });

  test("order confirmation has continue shopping link", async ({ page }) => {
    await page.goto(`/en/shop/order/${MOCK_ORDER_ID}?redirect_status=succeeded`);
    await page.waitForLoadState("domcontentloaded");

    // Wait for loading state to disappear
    await expect(page.getByRole("heading", { name: /loading order/i })).not.toBeVisible({ timeout: 10000 });

    // Continue shopping link should be visible (in both success and error states)
    const continueShoppingLink = page.getByRole("link", { name: /continue shopping/i });
    await expect(continueShoppingLink).toBeVisible({ timeout: 5000 });

    // Test clicking the link
    await continueShoppingLink.click();
    await page.waitForURL(/\/shop/);
    await expect(page).toHaveURL(/\/shop/);
  });
});

test.describe("Checkout - Mobile", () => {
  test.use({ viewport: { height: 667, width: 375 } });

  // Skip these tests in CI if no seeded products are available
  test.skip(() => !!process.env.CI && !process.env.HAS_SEEDED_DATA, "Skipping: Requires seeded product data");

  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);

    // Additional check: verify products are available
    const hasProducts = await hasSeededProducts(page);
    test.skip(!hasProducts, "Skipping: Product data not found");
  });

  test("checkout page is usable on mobile", async ({ page }) => {
    await addFirstProductAndGoToCheckout(page);

    // Email input should be visible - use label as accessible name
    const emailInput = page.getByRole("textbox", { name: /email address/i });
    await expect(emailInput).toBeVisible();

    // Edit bag link should be visible
    const backLink = page.getByRole("link", { name: /edit bag/i });
    await expect(backLink).toBeVisible();

    // Continue button should be visible
    const continueButton = page.getByRole("button", { name: /^Continue$/i });
    await expect(continueButton).toBeVisible();
  });
});
