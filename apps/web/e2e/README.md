# E2E Tests

This directory contains Playwright end-to-end tests for the web application.

## Test Categories

| Spec File                     | Data Required | Stripe Required | Description                             |
| ----------------------------- | ------------- | --------------- | --------------------------------------- |
| `home.spec.ts`                | No            | No              | Homepage navigation and content         |
| `theme-toggle.spec.ts`        | No            | No              | Light/dark theme switching              |
| `authentication.spec.ts`      | No            | No              | Login/logout flows                      |
| `contact-form.spec.ts`        | No            | No              | Contact form submission                 |
| `shop.spec.ts`                | Partial       | No              | Shop catalog, search, filters           |
| `product-view.spec.ts`        | Yes           | No              | Product detail pages                    |
| `cart.spec.ts`                | Yes           | No              | Cart functionality                      |
| `checkout.spec.ts`            | Yes           | Partial         | Checkout flow (Stripe for payment step) |
| `checkout-payment.spec.ts`    | Yes           | Yes             | Full Stripe payment testing             |
| `shop-error-handling.spec.ts` | Partial       | No              | Error recovery scenarios                |

## Environment Requirements

### For Basic Tests (No External Dependencies)

```bash
pnpm playwright test home.spec.ts theme-toggle.spec.ts authentication.spec.ts contact-form.spec.ts
```

### For Shop/Cart Tests (Requires Seeded Data)

The following environment variables control test behavior:

```bash
# Set to skip tests that require seeded data in CI
CI=true
HAS_SEEDED_DATA=false  # Set to 'true' if database has products

# Database with seeded products must include:
# - mandrii-trident-tshirt (prod-1)
# - sunflower-sweatshirt (prod-2)
# - stand-with-ukraine-tshirt (prod-3)
# - carpathian-jumper (prod-4)
# - ukrainian-heart-hoodie (prod-5)
# - iznik-ceramics-bowl (prod-6) - Gift, no variants
# - nazar-boncugu-pendant (prod-7) - Gift, no variants
# - copper-cezve-coffee-pot (prod-8) - Gift, no variants
```

### For Stripe Payment Tests

```bash
# Required for Stripe Elements to load
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Required for PaymentIntent creation
STRIPE_SECRET_KEY=sk_test_...

# Optional: Enable Stripe tests in CI
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Same as NEXT_PUBLIC version
```

## Running Tests

### Local Development

```bash
# Start dev server and run all tests
pnpm playwright test

# Run specific test file
pnpm playwright test cart.spec.ts

# Run with UI mode
pnpm playwright test --ui

# Run in headed mode (visible browser)
pnpm playwright test --headed
```

### CI Environment

Tests automatically skip when dependencies are unavailable:

```bash
# CI runs with skip conditions
CI=true pnpm playwright test

# CI with seeded data
CI=true HAS_SEEDED_DATA=true pnpm playwright test

# CI with full Stripe integration
CI=true HAS_SEEDED_DATA=true STRIPE_PUBLISHABLE_KEY=pk_test_... STRIPE_SECRET_KEY=sk_test_... pnpm playwright test
```

## Product Slugs Reference

Tests use these hardcoded product slugs (must match seeded data):

| Slug                        | Category | Features                    |
| --------------------------- | -------- | --------------------------- |
| `mandrii-trident-tshirt`    | Clothing | Variants (gender/size), GBP |
| `sunflower-sweatshirt`      | Clothing | Variants + colors, GBP      |
| `stand-with-ukraine-tshirt` | Clothing | Unisex variants, GBP        |
| `carpathian-jumper`         | Clothing | Men/Women variants, GBP     |
| `ukrainian-heart-hoodie`    | Clothing | Variants + colors, GBP      |
| `iznik-ceramics-bowl`       | Gift     | No variants, stock=12, GBP  |
| `nazar-boncugu-pendant`     | Gift     | No variants, stock=25, GBP  |
| `copper-cezve-coffee-pot`   | Gift     | No variants, stock=8, GBP   |

## Test Data Alignment

MSW mocks in `src/__mocks__/msw/data/shop.ts` mirror the expected seed data.
When updating seed data or MSW mocks, keep them in sync.

## Stripe Test Cards

For payment flow testing (from [Stripe docs](https://stripe.com/docs/testing#cards)):

| Card Number         | Scenario           |
| ------------------- | ------------------ |
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0002 | Card declined      |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0000 0000 3220 | 3D Secure required |

Use any future expiry date (e.g., 12/30) and any 3-digit CVC (e.g., 123).

## Debugging Failed Tests

```bash
# Generate detailed trace
pnpm playwright test --trace on

# View trace after failure
pnpm playwright show-trace test-results/*/trace.zip

# Debug with inspector
pnpm playwright test --debug
```

## Writing New Tests

1. **No external dependencies**: Write test normally
2. **Requires seeded data**: Add skip condition:
   ```typescript
   test.skip(() => !!process.env.CI && !process.env.HAS_SEEDED_DATA, "Skipping: Requires seeded product data");
   ```
3. **Requires Stripe**: Add skip condition:
   ```typescript
   test.skip(!hasStripeConfig(), "Skipping: Requires Stripe configuration");
   ```
4. **Soft assertions**: For optional content, use:
   ```typescript
   if (await element.isVisible().catch(() => false)) {
     await expect(element).toHaveText("...");
   }
   ```
