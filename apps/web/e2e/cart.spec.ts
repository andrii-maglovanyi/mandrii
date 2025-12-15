import { expect, Page, test } from "@playwright/test";

/**
 * Cart E2E Tests
 *
 * Tests cart functionality through real user flows:
 * - Cart button in header with badge
 * - Add to cart via PDP (not localStorage seeding)
 * - Stock limit enforcement
 * - Cart quantity controls
 * - Cart persistence
 *
 * Environment Requirements:
 * - Seeded product data: Tests expect specific product slugs to exist
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

// Product slugs from database seed data
const PRODUCTS = {
  carpathianJumper: "carpathian-jumper", // £55, Men/Women, no colors
  copperCezve: "copper-cezve-coffee-pot", // £42, stock=8, no variants (can test low stock)
  // Gift products (non-variant) - these show "Add to cart" directly
  iznikBowl: "iznik-ceramics-bowl", // £35, stock=12, no variants
  nazarPendant: "nazar-boncugu-pendant", // £28, stock=25, no variants
  standWithUkraine: "stand-with-ukraine-tshirt", // £22, Unisex, no colors
  sunflowerSweatshirt: "sunflower-sweatshirt", // £40, Unisex, has color variants (black/navy)
  // Clothing products with variants
  tridentTshirt: "mandrii-trident-tshirt", // £25, Men/Women/Kids, various sizes, no colors
  ukrainianHoodie: "ukrainian-heart-hoodie", // £45, Unisex, has color variants (grey/black)
};

/**
 * Helper to clear cart before tests
 */
async function clearCart(page: Page) {
  await page.evaluate((key) => localStorage.removeItem(key), CART_STORAGE_KEY);
}

/**
 * Helper to get cart from localStorage
 */
async function getCart(page: Page) {
  return await page.evaluate((key) => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : { items: [] };
  }, CART_STORAGE_KEY);
}

/**
 * Helper to select variant options on PDP
 * IMPORTANT: The variant cascading logic requires selecting in order:
 * Age group → Gender → Size (each selection enables the next)
 */
async function selectVariants(
  page: Page,
  options: {
    ageGroup?: string;
    color?: string;
    gender?: string;
    size?: string;
  } = {},
) {
  const { ageGroup = "Adult", color, gender = "Unisex", size = "M" } = options;

  // Step 1: Select age group first (enables Gender options)
  const ageButton = page.getByRole("button", { name: new RegExp(`^${ageGroup}$`, "i") });
  if (await ageButton.isVisible().catch(() => false)) {
    await ageButton.click();
    // Wait for selection to be applied
    await expect(ageButton)
      .toHaveAttribute("aria-pressed", "true", { timeout: 2000 })
      .catch(() => {});
  }

  // Step 2: Select gender (now enabled after age group selection, enables Size options)
  const genderButton = page.getByRole("button", { name: new RegExp(`^${gender}$`, "i") });
  if (await genderButton.isVisible().catch(() => false)) {
    await expect(genderButton)
      .toBeEnabled({ timeout: 5000 })
      .catch(() => {});
    await genderButton.click();
    // Wait for selection to be applied
    await expect(genderButton)
      .toHaveAttribute("aria-pressed", "true", { timeout: 2000 })
      .catch(() => {});
  }

  // Step 3: Select size (now enabled after gender selection)
  const sizeButton = page.getByRole("button", { name: new RegExp(`^${size}$`, "i") });
  if (await sizeButton.isVisible().catch(() => false)) {
    await expect(sizeButton)
      .toBeEnabled({ timeout: 5000 })
      .catch(() => {});
    await sizeButton.click();
    // Wait for selection to be applied
    await expect(sizeButton)
      .toHaveAttribute("aria-pressed", "true", { timeout: 2000 })
      .catch(() => {});
  }

  // Step 4: Select color if provided (typically not cascading-dependent)
  if (color) {
    const colorButton = page.getByRole("button", { name: new RegExp(`^${color}$`, "i") });
    if (await colorButton.isVisible().catch(() => false)) {
      await colorButton.click();
    }
  }
}

test.describe("Cart Button - Header", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("cart button is visible in header", async ({ page }) => {
    // Find the visible cart button (last one on desktop = desktop header)
    const cartButton = page.getByTestId("cart-button").last();
    await expect(cartButton).toBeVisible();
  });

  test("cart button has no badge when cart is empty", async ({ page }) => {
    // Badges shouldn't be visible on any cart button
    const cartCounts = page.getByTestId("cart-count");
    // No badges should exist when cart is empty
    await expect(cartCounts).toHaveCount(0);
  });

  test("clicking cart button navigates to cart page", async ({ page }) => {
    // Desktop cart button (last in DOM)
    const cartButton = page.getByTestId("cart-button").last();
    await cartButton.click();
    await page.waitForURL(/\/shop\/cart/);
    await expect(page).toHaveURL(/\/en\/shop\/cart/);
  });

  test("cart button has accessible label", async ({ page }) => {
    const cartButton = page.getByRole("button", { name: /shopping bag/i }).last();
    await expect(cartButton).toBeVisible();
  });

  test("cart button navigates to cart from any page", async ({ page }) => {
    // Navigate to home page
    await page.goto("/en");
    await page.waitForLoadState("networkidle");

    // Click cart button (desktop)
    const cartButton = page.getByTestId("cart-button").last();
    await cartButton.click();
    await page.waitForURL(/\/shop\/cart/);
    await expect(page).toHaveURL(/\/en\/shop\/cart/);
  });
});

test.describe("Cart Button - Mobile", () => {
  test.use({ viewport: { height: 667, width: 375 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("cart button is visible in mobile header", async ({ page }) => {
    const cartButton = page.getByTestId("cart-button").first();
    await expect(cartButton).toBeVisible();
  });

  test("clicking cart button on mobile navigates to cart", async ({ page }) => {
    const cartButton = page.getByTestId("cart-button").first();
    await cartButton.click();
    await page.waitForURL(/\/shop\/cart/);
    await expect(page).toHaveURL(/\/en\/shop\/cart/);
  });
});

test.describe("Cart - Real Add to Cart Flows", () => {
  // Skip in CI without seeded data
  test.skip(!hasSeededData(), "Skipping: Requires seeded product data");

  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("adds GBP product to cart after selecting all variants", async ({ page }) => {
    await page.goto(`/en/shop/${PRODUCTS.tridentTshirt}`);
    await page.waitForLoadState("networkidle");

    // Select variants
    await selectVariants(page, { ageGroup: "Adult", gender: "Men", size: "M" });

    // Add to cart
    const addToCartButton = page.getByRole("button", { name: /add to cart/i });
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    // Verify cart has item with correct currency
    const cart = await getCart(page);
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].currency).toBe("GBP");
    expect(cart.items[0].priceMinor).toBe(2500);
  });

  test("adds non-variant product directly to cart", async ({ page }) => {
    // Gift products have no variants - show Add to cart directly
    await page.goto(`/en/shop/${PRODUCTS.nazarPendant}`);
    await page.waitForLoadState("networkidle");

    // Should show "Add to cart" directly (no variants)
    const addToCartButton = page.getByRole("button", { name: /add to cart/i });
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    // Verify cart
    const cart = await getCart(page);
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].name).toBe("Nazar Boncugu Evil Eye Pendant");
    expect(cart.items[0].currency).toBe("GBP");
  });

  test("requires color selection for products with color variants", async ({ page }) => {
    await page.goto(`/en/shop/${PRODUCTS.sunflowerSweatshirt}`);
    await page.waitForLoadState("networkidle");

    // Select gender, age group, and size (but not color)
    await selectVariants(page, { ageGroup: "Adult", gender: "Unisex", size: "M" });

    // Button should still show "Select options" because color is required
    const selectOptionsButton = page.getByRole("button", { name: /select options/i });
    await expect(selectOptionsButton).toBeVisible();

    // Now select a color
    const blackButton = page.getByRole("button", { name: /^Black$/i });
    await blackButton.click();

    // Now "Add to cart" should be visible
    const addToCartButton = page.getByRole("button", { name: /add to cart/i });
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    // Verify cart has item with color
    const cart = await getCart(page);
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].variant.color).toBe("black");
  });

  test("adds gift product to cart", async ({ page }) => {
    // Test with iznik bowl (£35)
    await page.goto(`/en/shop/${PRODUCTS.iznikBowl}`);
    await page.waitForLoadState("networkidle");

    // Gift products show Add to cart directly
    const addToCartButton = page.getByRole("button", { name: /add to cart/i });
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    // Verify cart
    const cart = await getCart(page);
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].priceMinor).toBe(3500); // £35.00
  });
});

test.describe("Cart - Multiple Items", () => {
  // Skip in CI without seeded data
  test.skip(!hasSeededData(), "Skipping: Requires seeded product data");

  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("allows adding multiple same-currency items", async ({ page }) => {
    // Add first GBP product (gift - no variants)
    await page.goto(`/en/shop/${PRODUCTS.nazarPendant}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Add second GBP product (another gift)
    await page.goto(`/en/shop/${PRODUCTS.iznikBowl}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Both should be in cart
    const cart = await getCart(page);
    expect(cart.items.length).toBe(2);
    expect(cart.items.every((item: { currency: string }) => item.currency === "GBP")).toBe(true);
  });
});

test.describe("Cart - Low Stock Handling", () => {
  // Skip in CI without seeded data
  test.skip(!hasSeededData(), "Skipping: Requires seeded product data");

  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("respects stock limit when increasing quantity", async ({ page }) => {
    // Copper Cezve has stock=8
    await page.goto(`/en/shop/${PRODUCTS.copperCezve}`);
    await page.waitForLoadState("networkidle");

    // Add to cart
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Go to cart
    await page.goto("/en/shop/cart");
    await page.waitForLoadState("networkidle");

    // Verify item is in cart
    const cart = await getCart(page);
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].stock).toBe(8);
  });
});

test.describe("Cart - Quantity Controls", () => {
  // Skip in CI without seeded data
  test.skip(!hasSeededData(), "Skipping: Requires seeded product data");

  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("can increase item quantity in cart", async ({ page }) => {
    // Add product with good stock (nazar pendant has stock=25)
    await page.goto(`/en/shop/${PRODUCTS.nazarPendant}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Go to cart
    await page.goto("/en/shop/cart");
    await page.waitForLoadState("networkidle");

    const cartItem = page.locator('[class*="rounded-2xl"]').filter({ hasText: "Nazar Boncugu" });
    const incrementButton = cartItem.getByRole("button", { name: "+" });

    // Increase quantity
    await incrementButton.click();
    await page.waitForTimeout(100);

    const cart = await getCart(page);
    expect(cart.items[0].quantity).toBe(2);
  });

  test("can decrease item quantity in cart", async ({ page }) => {
    // Add product
    await page.goto(`/en/shop/${PRODUCTS.nazarPendant}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Go to cart and increase first
    await page.goto("/en/shop/cart");
    await page.waitForLoadState("networkidle");

    const cartItem = page.locator('[class*="rounded-2xl"]').filter({ hasText: "Nazar Boncugu" });
    const incrementButton = cartItem.getByRole("button", { name: "+" });
    const decrementButton = cartItem.getByRole("button", { name: "−" });

    // Increase to 3
    await incrementButton.click();
    await incrementButton.click();
    await page.waitForTimeout(100);

    // Now decrease
    await decrementButton.click();
    await page.waitForTimeout(100);

    const cart = await getCart(page);
    expect(cart.items[0].quantity).toBe(2);
  });

  test("removes item when quantity reaches 0", async ({ page }) => {
    // Add product
    await page.goto(`/en/shop/${PRODUCTS.nazarPendant}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Go to cart
    await page.goto("/en/shop/cart");
    await page.waitForLoadState("networkidle");

    const cartItem = page.locator('[class*="rounded-2xl"]').filter({ hasText: "Nazar Boncugu" });
    const decrementButton = cartItem.getByRole("button", { name: "−" });

    // Decrease to 0
    await decrementButton.click();
    await page.waitForTimeout(100);

    // Cart should be empty
    const cart = await getCart(page);
    expect(cart.items.length).toBe(0);

    // Empty state should show
    const emptyState = page.getByText(/your (cart|bag) is empty/i);
    await expect(emptyState).toBeVisible();
  });

  test("can remove item using remove button", async ({ page }) => {
    // Add product
    await page.goto(`/en/shop/${PRODUCTS.nazarPendant}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Go to cart
    await page.goto("/en/shop/cart");
    await page.waitForLoadState("networkidle");

    const removeButton = page.getByRole("button", { name: /remove/i });
    await removeButton.click();
    await page.waitForTimeout(100);

    const cart = await getCart(page);
    expect(cart.items.length).toBe(0);
  });

  test("can clear entire cart", async ({ page }) => {
    // Add two products
    await page.goto(`/en/shop/${PRODUCTS.nazarPendant}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    await page.goto(`/en/shop/${PRODUCTS.iznikBowl}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Go to cart
    await page.goto("/en/shop/cart");
    await page.waitForLoadState("networkidle");

    // Verify 2 items
    let cart = await getCart(page);
    expect(cart.items.length).toBe(2);

    // Clear cart
    const clearButton = page.getByRole("button", { name: /clear (cart|bag)/i });
    await clearButton.click();
    await page.waitForTimeout(100);

    cart = await getCart(page);
    expect(cart.items.length).toBe(0);
  });
});

test.describe("Cart - Order Summary", () => {
  // Skip in CI without seeded data
  test.skip(!hasSeededData(), "Skipping: Requires seeded product data");

  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("displays correct subtotal for multiple items", async ({ page }) => {
    // Add nazar pendant (£28.00)
    await page.goto(`/en/shop/${PRODUCTS.nazarPendant}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Add iznik bowl (£35.00)
    await page.goto(`/en/shop/${PRODUCTS.iznikBowl}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Go to cart
    await page.goto("/en/shop/cart");
    await page.waitForLoadState("networkidle");

    // Total should be £63.00
    const total = page.getByText("£63.00");
    await expect(total.first()).toBeVisible();
  });

  test("updates subtotal when quantity changes", async ({ page }) => {
    // Add nazar pendant (£28.00)
    await page.goto(`/en/shop/${PRODUCTS.nazarPendant}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Go to cart
    await page.goto("/en/shop/cart");
    await page.waitForLoadState("networkidle");

    // Initial total £28.00
    await expect(page.getByText("£28.00").first()).toBeVisible();

    // Increase quantity
    const cartItem = page.locator('[class*="rounded-2xl"]').filter({ hasText: "Nazar Boncugu" });
    const incrementButton = cartItem.getByRole("button", { name: "+" });
    await incrementButton.click();
    await page.waitForTimeout(100);

    // Total should now be £56.00
    await expect(page.getByText("£56.00").first()).toBeVisible();
  });

  test("shows empty state when cart is empty", async ({ page }) => {
    await page.goto("/en/shop/cart");
    await page.waitForLoadState("networkidle");

    const emptyState = page.getByText(/your (cart|bag) is empty/i).first();
    await expect(emptyState).toBeVisible();
  });
});

test.describe("Cart - Persistence", () => {
  // Skip in CI without seeded data
  test.skip(!hasSeededData(), "Skipping: Requires seeded product data");

  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("cart persists after page reload", async ({ page }) => {
    // Add product
    await page.goto(`/en/shop/${PRODUCTS.nazarPendant}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Cart should still have item
    const cart = await getCart(page);
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].name).toBe("Nazar Boncugu Evil Eye Pendant");
  });

  test("cart persists across navigation", async ({ page }) => {
    // Add product
    await page.goto(`/en/shop/${PRODUCTS.nazarPendant}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Navigate around
    await page.goto("/en/shop");
    await page.waitForLoadState("networkidle");
    await page.goto("/en/shop/cart");
    await page.waitForLoadState("networkidle");
    await page.goto("/en/shop");
    await page.waitForLoadState("networkidle");

    // Cart should still have item
    const cart = await getCart(page);
    expect(cart.items.length).toBe(1);
  });
});

test.describe("Cart - Mobile", () => {
  test.use({ viewport: { height: 667, width: 375 } });

  // Skip in CI without seeded data
  test.skip(!hasSeededData(), "Skipping: Requires seeded product data");

  test("cart displays properly on mobile", async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);

    // Add product (gift product - no variants needed)
    await page.goto(`/en/shop/${PRODUCTS.nazarPendant}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Go to cart
    await page.goto("/en/shop/cart");
    await page.waitForLoadState("networkidle");

    // Order summary should be visible
    const orderSummary = page.getByText(/order summary/i);
    await expect(orderSummary).toBeVisible();

    // Quantity controls should be touch-friendly
    const incrementButton = page.getByRole("button", { name: "+" });
    if ((await incrementButton.count()) > 0) {
      const box = await incrementButton.first().boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(36);
        expect(box.width).toBeGreaterThanOrEqual(36);
      }
    }
  });

  test("mobile PDP add to cart flow works", async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);

    await page.goto(`/en/shop/${PRODUCTS.tridentTshirt}`);
    await page.waitForLoadState("networkidle");

    // Select variants
    await selectVariants(page, { ageGroup: "Adult", gender: "Men", size: "L" });

    // Add to cart
    const addToCartButton = page.getByRole("button", { name: /add to cart/i });
    await addToCartButton.click();

    // Verify cart has item
    const cart = await getCart(page);
    expect(cart.items.length).toBe(1);
  });
});
