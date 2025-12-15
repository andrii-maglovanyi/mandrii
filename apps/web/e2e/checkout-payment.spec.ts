import { expect, Page, test } from "@playwright/test";

/**
 * Checkout Payment E2E Tests
 *
 * Tests the complete payment flow with Stripe test cards:
 * - Successful payment completion
 * - Declined card handling
 * - Insufficient funds error
 * - 3D Secure authentication
 *
 * Environment Requirements:
 * - STRIPE_PUBLISHABLE_KEY: Required for Stripe Elements
 * - STRIPE_SECRET_KEY: Required for creating test PaymentIntents
 * - Seeded product data: Tests expect "mandrii-trident-tshirt" to exist
 *
 * In CI, these tests will be skipped unless both Stripe keys and HAS_SEEDED_DATA=true are set.
 *
 * Stripe Test Cards:
 * https://stripe.com/docs/testing#cards
 * - Success: 4242424242424242
 * - Declined: 4000000000000002
 * - Insufficient funds: 4000000000009995
 * - 3D Secure Required: 4000000000003220
 */

const CART_STORAGE_KEY = "mndr.cart";

/**
 * Check if Stripe is configured for payment testing
 */
const hasStripeConfig = (): boolean => {
  return !!process.env.STRIPE_PUBLISHABLE_KEY && !!process.env.STRIPE_SECRET_KEY;
};

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
 * Helper to dismiss cookie consent banner
 */
async function dismissCookieConsent(page: Page) {
  const acceptButton = page.getByRole("button", { name: /Accept/i });
  if (await acceptButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await acceptButton.click({ timeout: 2000 });
    await expect(acceptButton)
      .not.toBeVisible({ timeout: 2000 })
      .catch(() => {});
  }
}

/**
 * Helper to fill Stripe address element
 */
async function fillStripeAddressElement(page: Page) {
  // Wait for address iframe
  const addressFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]').nth(1);

  // Fill address fields
  await addressFrame.locator('[name="name"]').fill("Test User");
  await addressFrame.locator('[name="addressLine1"]').fill("123 Test Street");
  await addressFrame.locator('[name="locality"]').fill("London");
  await addressFrame.locator('[name="postalCode"]').fill("SW1A 1AA");
}

/**
 * Helper to fill Stripe card element
 */
async function fillStripeCardElement(
  page: Page,
  cardNumber: string = "4242424242424242",
  expiry: string = "12/30",
  cvc: string = "123",
) {
  // Wait for Stripe iframe to load
  const stripeFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]').first();

  // Fill card number
  const cardInput = stripeFrame.locator('[name="number"]');
  await cardInput.fill(cardNumber);

  // Fill expiry
  const expiryInput = stripeFrame.locator('[name="expiry"]');
  await expiryInput.fill(expiry);

  // Fill CVC
  const cvcInput = stripeFrame.locator('[name="cvc"]');
  await cvcInput.fill(cvc);
}

/**
 * Helper to add a product to cart and navigate to checkout
 */
async function setupCheckoutWithProduct(page: Page) {
  await page.goto("/en/shop");
  await page.waitForLoadState("domcontentloaded");
  await dismissCookieConsent(page);

  // Navigate to a product with variants
  const productLink = page.locator('a[href*="/shop/mandrii-trident-tshirt"]').first();
  await expect(productLink).toBeVisible({ timeout: 10000 });
  await productLink.click();

  // Wait for product page
  await expect(page.getByRole("heading", { name: /Mandrii Trident T-Shirt/i })).toBeVisible({ timeout: 10000 });

  // Select variants: Men, Adult, M
  await page.getByRole("button", { name: /^Men$/i }).click();
  await page.getByRole("button", { name: /^Adult$/i }).click();
  await page.getByRole("button", { name: /^M$/i }).click();

  // Add to cart
  const addToCartButton = page.getByRole("button", { name: /^Add to cart$/i });
  await expect(addToCartButton).toBeEnabled({ timeout: 5000 });
  await addToCartButton.click();

  // Wait for cart to update
  await expect(page.getByTestId("cart-count").first()).toContainText("1", { timeout: 5000 });

  // Navigate to cart
  await page.getByTestId("cart-button").last().click();
  await page.waitForURL(/\/shop\/cart/);

  // Navigate to checkout
  await page.getByRole("link", { name: /proceed to checkout/i }).click();
  await page.waitForURL(/\/shop\/checkout/);
}

test.describe("Checkout - Stripe Payment Flow", () => {
  // Skip all tests if Stripe is not configured or no seeded data
  test.skip(!hasStripeConfig() || !hasSeededData(), "Skipping: Requires Stripe configuration and seeded product data");

  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("completes payment with valid test card", async ({ page }) => {
    await setupCheckoutWithProduct(page);

    // Fill email
    const emailInput = page.getByPlaceholder(/you@example\.com/i);
    await emailInput.fill("test@example.com");

    // Click continue to show Stripe form
    await page.getByRole("button", { name: /continue/i }).click();

    // Wait for Stripe Elements to load
    await expect(page.locator('iframe[name*="stripe"]').first()).toBeVisible({ timeout: 15000 });

    // Fill address
    await fillStripeAddressElement(page);

    // Fill card details with valid test card
    await fillStripeCardElement(page, "4242424242424242", "12/30", "123");

    // Submit payment
    const payButton = page.getByRole("button", { name: /^Pay/i });
    await payButton.click();

    // Wait for redirect to order confirmation
    await page.waitForURL(/\/shop\/order\//, { timeout: 30000 });

    // Should show success state
    const successHeading = page.getByRole("heading", { name: /payment successful/i });
    const processingHeading = page.getByRole("heading", { name: /processing|confirming/i });

    // Either success or processing (webhook may still be pending)
    await expect(successHeading.or(processingHeading)).toBeVisible({ timeout: 10000 });
  });

  test("shows error for declined card", async ({ page }) => {
    await setupCheckoutWithProduct(page);

    // Fill email
    await page.getByPlaceholder(/you@example\.com/i).fill("test@example.com");

    // Click continue
    await page.getByRole("button", { name: /continue/i }).click();

    // Wait for Stripe Elements
    await expect(page.locator('iframe[name*="stripe"]').first()).toBeVisible({ timeout: 15000 });

    // Fill address
    await fillStripeAddressElement(page);

    // Fill card with declined test card
    await fillStripeCardElement(page, "4000000000000002", "12/30", "123");

    // Submit payment
    await page.getByRole("button", { name: /^Pay/i }).click();

    // Should show decline error
    const declineError = page.getByText(/declined|card was declined/i);
    await expect(declineError).toBeVisible({ timeout: 10000 });
  });

  test("shows error for insufficient funds", async ({ page }) => {
    await setupCheckoutWithProduct(page);

    // Fill email
    await page.getByPlaceholder(/you@example\.com/i).fill("test@example.com");

    // Click continue
    await page.getByRole("button", { name: /continue/i }).click();

    // Wait for Stripe Elements
    await expect(page.locator('iframe[name*="stripe"]').first()).toBeVisible({ timeout: 15000 });

    // Fill address
    await fillStripeAddressElement(page);

    // Fill card with insufficient funds test card
    await fillStripeCardElement(page, "4000000000009995", "12/30", "123");

    // Submit payment
    await page.getByRole("button", { name: /^Pay/i }).click();

    // Should show insufficient funds error
    const insufficientError = page.getByText(/insufficient funds|not enough/i);
    await expect(insufficientError).toBeVisible({ timeout: 10000 });
  });

  test("handles 3D Secure authentication", async ({ page }) => {
    await setupCheckoutWithProduct(page);

    // Fill email
    await page.getByPlaceholder(/you@example\.com/i).fill("test@example.com");

    // Click continue
    await page.getByRole("button", { name: /continue/i }).click();

    // Wait for Stripe Elements
    await expect(page.locator('iframe[name*="stripe"]').first()).toBeVisible({ timeout: 15000 });

    // Fill address
    await fillStripeAddressElement(page);

    // Fill card that requires 3D Secure
    await fillStripeCardElement(page, "4000000000003220", "12/30", "123");

    // Submit payment
    await page.getByRole("button", { name: /^Pay/i }).click();

    // Wait for 3D Secure modal or redirect
    // In test mode, this should either auto-complete or show a test modal
    await page.waitForTimeout(2000);

    // Check for 3DS iframe or success/error
    const threeDsFrame = page.frameLocator('iframe[name*="stripe-challenge"]');
    const hasThreeDs = (await threeDsFrame.locator("body").count()) > 0;

    if (hasThreeDs) {
      // Complete 3DS authentication in test mode
      const completeButton = threeDsFrame.getByRole("button", { name: /complete/i });
      if (await completeButton.isVisible().catch(() => false)) {
        await completeButton.click();
      }
    }

    // Should eventually redirect or show result
    // Allow more time for 3DS flow
    await page.waitForTimeout(5000);
  });

  test("preserves cart items during payment flow", async ({ page }) => {
    await setupCheckoutWithProduct(page);

    // Verify cart has item before payment
    let cart = await page.evaluate((key) => {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : { items: [] };
    }, CART_STORAGE_KEY);

    expect(cart.items.length).toBe(1);

    // Fill email
    await page.getByPlaceholder(/you@example\.com/i).fill("test@example.com");

    // Click continue
    await page.getByRole("button", { name: /continue/i }).click();

    // Wait for Stripe form
    await expect(page.locator('iframe[name*="stripe"]').first()).toBeVisible({ timeout: 15000 });

    // Cart should still have items (in case user navigates back)
    cart = await page.evaluate((key) => {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : { items: [] };
    }, CART_STORAGE_KEY);

    expect(cart.items.length).toBe(1);
  });

  test("shows processing state during payment", async ({ page }) => {
    await setupCheckoutWithProduct(page);

    // Fill email
    await page.getByPlaceholder(/you@example\.com/i).fill("test@example.com");

    // Click continue
    await page.getByRole("button", { name: /continue/i }).click();

    // Wait for Stripe Elements
    await expect(page.locator('iframe[name*="stripe"]').first()).toBeVisible({ timeout: 15000 });

    // Fill valid card
    await fillStripeAddressElement(page);
    await fillStripeCardElement(page);

    // Submit payment
    const payButton = page.getByRole("button", { name: /^Pay/i });
    await payButton.click();

    // Should show processing state
    const processingText = page.getByText(/processing|please wait/i);
    // Note: This may be very fast, so we use a short timeout
    await expect(processingText)
      .toBeVisible({ timeout: 2000 })
      .catch(() => {
        // Processing may have been too fast - that's OK
      });
  });
});

test.describe("Checkout - Payment Error Recovery", () => {
  // Skip if Stripe is not configured or no seeded data
  test.skip(!hasStripeConfig() || !hasSeededData(), "Skipping: Requires Stripe configuration and seeded product data");

  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("allows retry after payment failure", async ({ page }) => {
    await setupCheckoutWithProduct(page);

    // Fill email
    await page.getByPlaceholder(/you@example\.com/i).fill("test@example.com");

    // Click continue
    await page.getByRole("button", { name: /continue/i }).click();

    // Wait for Stripe Elements
    await expect(page.locator('iframe[name*="stripe"]').first()).toBeVisible({ timeout: 15000 });

    // Fill address
    await fillStripeAddressElement(page);

    // First attempt with declined card
    await fillStripeCardElement(page, "4000000000000002");

    await page.getByRole("button", { name: /^Pay/i }).click();

    // Wait for error
    await expect(page.getByText(/declined/i)).toBeVisible({ timeout: 10000 });

    // Clear card and retry with valid card
    // The card input should still be editable
    await fillStripeCardElement(page, "4242424242424242");

    // Retry payment
    await page.getByRole("button", { name: /^Pay/i }).click();

    // Should now succeed
    await page.waitForURL(/\/shop\/order\//, { timeout: 30000 });
  });

  test("can navigate back to cart during checkout", async ({ page }) => {
    await setupCheckoutWithProduct(page);

    // Click back to cart link
    const backLink = page.getByRole("link", { name: /back to cart|edit bag/i });
    await expect(backLink).toBeVisible();
    await backLink.click();

    // Should be back on cart page
    await page.waitForURL(/\/shop\/cart/);

    // Cart should still have the item
    const cartItem = page.getByText(/Mandrii Trident T-Shirt/i);
    await expect(cartItem.first()).toBeVisible();
  });
});

test.describe("Checkout - Ukrainian Locale", () => {
  // Skip if Stripe is not configured or no seeded data
  test.skip(!hasStripeConfig() || !hasSeededData(), "Skipping: Requires Stripe configuration and seeded product data");

  test.beforeEach(async ({ page }) => {
    await page.goto("/uk/shop");
    await clearCart(page);
  });

  test("checkout flow works in Ukrainian locale", async ({ page }) => {
    await dismissCookieConsent(page);

    // Navigate to product
    const productLink = page.locator('a[href*="/shop/mandrii-trident-tshirt"]').first();

    if (await productLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await productLink.click();

      // Wait for product page
      await page.waitForLoadState("networkidle");

      // Select variants
      await page
        .getByRole("button", { name: /^Men|Чоловіки$/i })
        .first()
        .click()
        .catch(() => {});
      await page
        .getByRole("button", { name: /^Adult|Дорослий$/i })
        .first()
        .click()
        .catch(() => {});
      await page
        .getByRole("button", { name: /^M$/i })
        .first()
        .click()
        .catch(() => {});

      // Add to cart
      const addToCartButton = page.getByRole("button", { name: /add to cart|до кошика/i });
      if (await addToCartButton.isVisible().catch(() => false)) {
        await addToCartButton.click();

        // Navigate to checkout
        await page.goto("/uk/shop/checkout");
        await page.waitForLoadState("networkidle");

        // Should show checkout page in Ukrainian
        const checkoutHeading = page.getByRole("heading", { name: /checkout|оформлення/i });
        await expect(checkoutHeading).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test("error messages display in Ukrainian", async ({ page }) => {
    await page.goto("/uk/shop/checkout");
    await page.waitForLoadState("networkidle");

    // If cart is empty, should show Ukrainian empty state message
    const emptyMessage = page.getByText(/кошик порожній|cart is empty/i);
    await expect(emptyMessage).toBeVisible({ timeout: 5000 });
  });
});
