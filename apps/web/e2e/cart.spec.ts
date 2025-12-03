import { expect, Page, test } from "@playwright/test";

/**
 * Cart E2E Tests
 *
 * Tests cart functionality through real user flows:
 * - Add to cart via PDP (not localStorage seeding)
 * - Stock limit enforcement
 * - Currency mismatch guard on PDP
 * - Out of stock handling
 * - Cart quantity controls
 * - Cart persistence
 */

const CART_STORAGE_KEY = "mndr.cart";

// Product slugs from MSW mock data
const PRODUCTS = {
  // GBP products
  tridentTshirt: "mandrii-trident-tshirt", // prod-1, has variants, no colors
  sunflowerSweatshirt: "sunflower-sweatshirt", // prod-2, has color variants (black/navy)
  standWithUkraine: "stand-with-ukraine-tshirt", // prod-3, has variants, no colors
  ukrainianHoodie: "ukrainian-heart-hoodie", // prod-5, has color variants (grey/black)
  // Out of stock
  outOfStock: "out-of-stock-item", // prod-6, all variants stock=0
  // Non-variant products
  embroideryAccessory: "ukrainian-embroidery-accessory", // prod-7, no variants, stock=25
  // EUR product for currency mismatch testing
  euroPriced: "euro-priced-item", // prod-8, no variants, EUR currency
  // Price override product
  vyshyvankaShirt: "premium-vyshyvanka-shirt", // prod-9, XL/2XL have price overrides
  // Low stock product
  limitedBadge: "limited-edition-badge", // prod-10, no variants, stock=2
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
 */
async function selectVariants(
  page: Page,
  options: {
    gender?: string;
    ageGroup?: string;
    size?: string;
    color?: string;
  } = {},
) {
  const { gender = "Unisex", ageGroup = "Adult", size = "M", color } = options;

  // Select gender
  const genderButton = page.getByRole("button", { name: new RegExp(`^${gender}$`, "i") });
  if (await genderButton.isVisible().catch(() => false)) {
    await genderButton.click();
  }

  // Select age group
  const ageButton = page.getByRole("button", { name: new RegExp(`^${ageGroup}$`, "i") });
  if (await ageButton.isEnabled().catch(() => false)) {
    await ageButton.click();
  }

  // Select size
  const sizeButton = page.getByRole("button", { name: new RegExp(`^${size}$`, "i") });
  if (await sizeButton.isEnabled().catch(() => false)) {
    await sizeButton.click();
  }

  // Select color if provided
  if (color) {
    const colorButton = page.getByRole("button", { name: new RegExp(`^${color}$`, "i") });
    if (await colorButton.isVisible().catch(() => false)) {
      await colorButton.click();
    }
  }
}

test.describe("Cart - Real Add to Cart Flows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("adds GBP product to cart after selecting all variants", async ({ page }) => {
    await page.goto(`/en/shop/${PRODUCTS.tridentTshirt}`);
    await page.waitForLoadState("networkidle");

    // Select variants
    await selectVariants(page, { gender: "Men", ageGroup: "Adult", size: "M" });

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
    await page.goto(`/en/shop/${PRODUCTS.embroideryAccessory}`);
    await page.waitForLoadState("networkidle");

    // Should show "Add to cart" directly (no variants)
    const addToCartButton = page.getByRole("button", { name: /add to cart/i });
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    // Verify cart
    const cart = await getCart(page);
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].name).toBe("Ukrainian Embroidery Accessory");
    expect(cart.items[0].currency).toBe("GBP");
  });

  test("requires color selection for products with color variants", async ({ page }) => {
    await page.goto(`/en/shop/${PRODUCTS.sunflowerSweatshirt}`);
    await page.waitForLoadState("networkidle");

    // Select gender, age group, and size (but not color)
    await selectVariants(page, { gender: "Unisex", ageGroup: "Adult", size: "M" });

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

  test("adds item with price override variant", async ({ page }) => {
    await page.goto(`/en/shop/${PRODUCTS.vyshyvankaShirt}`);
    await page.waitForLoadState("networkidle");

    // Select XL which has price override (£40 instead of £35)
    await selectVariants(page, { gender: "Unisex", ageGroup: "Adult", size: "XL" });

    // Verify price display shows override
    const priceDisplay = page.getByText("£40.00");
    await expect(priceDisplay).toBeVisible();

    // Add to cart
    const addToCartButton = page.getByRole("button", { name: /add to cart/i });
    await addToCartButton.click();

    // Verify cart has override price
    const cart = await getCart(page);
    expect(cart.items[0].priceMinor).toBe(4000); // £40.00
  });
});

test.describe("Cart - EUR Product Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("adds EUR product to empty cart successfully", async ({ page }) => {
    await page.goto(`/en/shop/${PRODUCTS.euroPriced}`);
    await page.waitForLoadState("networkidle");

    // EUR product has no variants, should show Add to cart directly
    const addToCartButton = page.getByRole("button", { name: /add to cart/i });
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    // Verify cart has EUR item
    const cart = await getCart(page);
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].currency).toBe("EUR");
    expect(cart.items[0].priceMinor).toBe(2000);
  });

  test("displays EUR currency in cart", async ({ page }) => {
    // Add EUR product first
    await page.goto(`/en/shop/${PRODUCTS.euroPriced}`);
    await page.waitForLoadState("networkidle");

    const addToCartButton = page.getByRole("button", { name: /add to cart/i });
    await addToCartButton.click();

    // Go to cart
    await page.goto("/en/cart");
    await page.waitForLoadState("networkidle");

    // Price should be in EUR format (€20.00)
    const eurPrice = page.getByText(/€20\.00/);
    await expect(eurPrice.first()).toBeVisible();
  });
});

test.describe("Cart - Currency Mismatch Guard (PDP)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("shows error when adding GBP item to cart with EUR item", async ({ page }) => {
    // First, add EUR product
    await page.goto(`/en/shop/${PRODUCTS.euroPriced}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Verify EUR item in cart
    let cart = await getCart(page);
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].currency).toBe("EUR");

    // Now try to add GBP product
    await page.goto(`/en/shop/${PRODUCTS.embroideryAccessory}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Should show currency mismatch error
    const errorNotification = page.getByText(/different currency|currency mismatch/i);
    await expect(errorNotification).toBeVisible();

    // Cart should still only have EUR item
    cart = await getCart(page);
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].currency).toBe("EUR");
  });

  test("shows error when adding EUR item to cart with GBP item", async ({ page }) => {
    // First, add GBP product
    await page.goto(`/en/shop/${PRODUCTS.embroideryAccessory}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Verify GBP item in cart
    let cart = await getCart(page);
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].currency).toBe("GBP");

    // Now try to add EUR product
    await page.goto(`/en/shop/${PRODUCTS.euroPriced}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Should show currency mismatch error
    const errorNotification = page.getByText(/different currency|currency mismatch/i);
    await expect(errorNotification).toBeVisible();

    // Cart should still only have GBP item
    cart = await getCart(page);
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].currency).toBe("GBP");
  });

  test("allows adding same-currency items", async ({ page }) => {
    // Add first GBP product
    await page.goto(`/en/shop/${PRODUCTS.embroideryAccessory}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Add second GBP product (limited badge)
    await page.goto(`/en/shop/${PRODUCTS.limitedBadge}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Both should be in cart
    const cart = await getCart(page);
    expect(cart.items.length).toBe(2);
    expect(cart.items.every((item: { currency: string }) => item.currency === "GBP")).toBe(true);
  });
});

test.describe("Cart - Out of Stock Handling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("shows out of stock indicator on PDP", async ({ page }) => {
    await page.goto(`/en/shop/${PRODUCTS.outOfStock}`);
    await page.waitForLoadState("networkidle");

    // Should show out of stock indicator
    const outOfStockText = page.getByText(/out of stock|sold out/i);
    await expect(outOfStockText).toBeVisible();
  });

  test("disables add to cart button for out of stock products", async ({ page }) => {
    await page.goto(`/en/shop/${PRODUCTS.outOfStock}`);
    await page.waitForLoadState("networkidle");

    // Select variants if required
    await selectVariants(page, { gender: "Unisex", ageGroup: "Adult", size: "M" });

    // Add to cart button should be disabled or show out of stock
    const addToCartButton = page.getByRole("button", { name: /add to cart/i });
    const outOfStockButton = page.getByRole("button", { name: /out of stock|sold out/i });

    // Either disabled Add to cart or Out of Stock button
    const isDisabled = await addToCartButton.isDisabled().catch(() => false);
    const hasOutOfStockButton = await outOfStockButton.isVisible().catch(() => false);

    expect(isDisabled || hasOutOfStockButton).toBe(true);
  });

  test("shows Sold out badge on catalog for out of stock products", async ({ page }) => {
    await page.goto("/en/shop");
    await page.waitForLoadState("networkidle");

    // Find the out of stock product card
    const outOfStockCard = page.locator('[href="/en/shop/out-of-stock-item"]');

    if (await outOfStockCard.isVisible().catch(() => false)) {
      // Should have sold out badge
      const soldOutBadge = outOfStockCard.getByText(/sold out/i);
      await expect(soldOutBadge).toBeVisible();
    }
  });
});

test.describe("Cart - Low Stock Handling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("respects stock limit when adding low stock item", async ({ page }) => {
    // Limited badge has stock=2
    await page.goto(`/en/shop/${PRODUCTS.limitedBadge}`);
    await page.waitForLoadState("networkidle");

    // Add to cart
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Go to cart and try to increase beyond stock
    await page.goto("/en/cart");
    await page.waitForLoadState("networkidle");

    const cartItem = page.locator('[class*="rounded-2xl"]').filter({ hasText: "Limited Edition Badge" });
    const incrementButton = cartItem.getByRole("button", { name: "+" });

    // Should be able to add 1 more (to reach stock of 2)
    await incrementButton.click();
    await page.waitForTimeout(100);

    // Now at max, button should be disabled
    await expect(incrementButton).toBeDisabled();

    // Should show max stock message
    const maxStockMessage = page.getByText(/max stock reached/i);
    await expect(maxStockMessage).toBeVisible();

    // Verify quantity is capped at stock limit
    const cart = await getCart(page);
    expect(cart.items[0].quantity).toBe(2);
  });

  test("caps quantity at stock limit when adding multiple times", async ({ page }) => {
    // Add limited badge twice from PDP
    await page.goto(`/en/shop/${PRODUCTS.limitedBadge}`);
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /add to cart/i }).click();
    await page.waitForTimeout(100);
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Cart should have quantity capped at stock=2
    const cart = await getCart(page);
    expect(cart.items[0].quantity).toBeLessThanOrEqual(2);
  });
});

test.describe("Cart - Quantity Controls", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("can increase item quantity in cart", async ({ page }) => {
    // Add product with good stock
    await page.goto(`/en/shop/${PRODUCTS.embroideryAccessory}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Go to cart
    await page.goto("/en/cart");
    await page.waitForLoadState("networkidle");

    const cartItem = page.locator('[class*="rounded-2xl"]').filter({ hasText: "Embroidery Accessory" });
    const incrementButton = cartItem.getByRole("button", { name: "+" });

    // Increase quantity
    await incrementButton.click();
    await page.waitForTimeout(100);

    const cart = await getCart(page);
    expect(cart.items[0].quantity).toBe(2);
  });

  test("can decrease item quantity in cart", async ({ page }) => {
    // Add product
    await page.goto(`/en/shop/${PRODUCTS.embroideryAccessory}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Go to cart and increase first
    await page.goto("/en/cart");
    await page.waitForLoadState("networkidle");

    const cartItem = page.locator('[class*="rounded-2xl"]').filter({ hasText: "Embroidery Accessory" });
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
    await page.goto(`/en/shop/${PRODUCTS.embroideryAccessory}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Go to cart
    await page.goto("/en/cart");
    await page.waitForLoadState("networkidle");

    const cartItem = page.locator('[class*="rounded-2xl"]').filter({ hasText: "Embroidery Accessory" });
    const decrementButton = cartItem.getByRole("button", { name: "−" });

    // Decrease to 0
    await decrementButton.click();
    await page.waitForTimeout(100);

    // Cart should be empty
    const cart = await getCart(page);
    expect(cart.items.length).toBe(0);

    // Empty state should show
    const emptyState = page.getByText(/your cart is empty/i);
    await expect(emptyState).toBeVisible();
  });

  test("can remove item using remove button", async ({ page }) => {
    // Add product
    await page.goto(`/en/shop/${PRODUCTS.embroideryAccessory}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Go to cart
    await page.goto("/en/cart");
    await page.waitForLoadState("networkidle");

    const removeButton = page.getByRole("button", { name: /remove/i });
    await removeButton.click();
    await page.waitForTimeout(100);

    const cart = await getCart(page);
    expect(cart.items.length).toBe(0);
  });

  test("can clear entire cart", async ({ page }) => {
    // Add two products
    await page.goto(`/en/shop/${PRODUCTS.embroideryAccessory}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    await page.goto(`/en/shop/${PRODUCTS.limitedBadge}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Go to cart
    await page.goto("/en/cart");
    await page.waitForLoadState("networkidle");

    // Verify 2 items
    let cart = await getCart(page);
    expect(cart.items.length).toBe(2);

    // Clear cart
    const clearButton = page.getByRole("button", { name: /clear cart/i });
    await clearButton.click();
    await page.waitForTimeout(100);

    cart = await getCart(page);
    expect(cart.items.length).toBe(0);
  });
});

test.describe("Cart - Order Summary", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("displays correct subtotal for multiple items", async ({ page }) => {
    // Add embroidery accessory (£15.00)
    await page.goto(`/en/shop/${PRODUCTS.embroideryAccessory}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Add limited badge (£5.00)
    await page.goto(`/en/shop/${PRODUCTS.limitedBadge}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Go to cart
    await page.goto("/en/cart");
    await page.waitForLoadState("networkidle");

    // Total should be £20.00
    const total = page.getByText("£20.00");
    await expect(total.first()).toBeVisible();
  });

  test("updates subtotal when quantity changes", async ({ page }) => {
    // Add embroidery accessory (£15.00)
    await page.goto(`/en/shop/${PRODUCTS.embroideryAccessory}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Go to cart
    await page.goto("/en/cart");
    await page.waitForLoadState("networkidle");

    // Initial total £15.00
    await expect(page.getByText("£15.00").first()).toBeVisible();

    // Increase quantity
    const cartItem = page.locator('[class*="rounded-2xl"]').filter({ hasText: "Embroidery Accessory" });
    const incrementButton = cartItem.getByRole("button", { name: "+" });
    await incrementButton.click();
    await page.waitForTimeout(100);

    // Total should now be £30.00
    await expect(page.getByText("£30.00").first()).toBeVisible();
  });

  test("shows empty state when cart is empty", async ({ page }) => {
    await page.goto("/en/cart");
    await page.waitForLoadState("networkidle");

    const emptyState = page.getByText(/your cart is empty/i);
    await expect(emptyState).toBeVisible();
  });
});

test.describe("Cart - Persistence", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);
  });

  test("cart persists after page reload", async ({ page }) => {
    // Add product
    await page.goto(`/en/shop/${PRODUCTS.embroideryAccessory}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Cart should still have item
    const cart = await getCart(page);
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].name).toBe("Ukrainian Embroidery Accessory");
  });

  test("cart persists across navigation", async ({ page }) => {
    // Add product
    await page.goto(`/en/shop/${PRODUCTS.embroideryAccessory}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Navigate around
    await page.goto("/en/shop");
    await page.waitForLoadState("networkidle");
    await page.goto("/en/cart");
    await page.waitForLoadState("networkidle");
    await page.goto("/en/shop");
    await page.waitForLoadState("networkidle");

    // Cart should still have item
    const cart = await getCart(page);
    expect(cart.items.length).toBe(1);
  });
});

test.describe("Cart - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("cart displays properly on mobile", async ({ page }) => {
    await page.goto("/en/shop");
    await clearCart(page);

    // Add product
    await page.goto(`/en/shop/${PRODUCTS.embroideryAccessory}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Go to cart
    await page.goto("/en/cart");
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
    await selectVariants(page, { gender: "Men", ageGroup: "Adult", size: "L" });

    // Add to cart
    const addToCartButton = page.getByRole("button", { name: /add to cart/i });
    await addToCartButton.click();

    // Verify cart has item
    const cart = await getCart(page);
    expect(cart.items.length).toBe(1);
  });
});
