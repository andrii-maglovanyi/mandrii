/**
 * Centralized Mock Definitions
 *
 * This module provides reusable mock definitions for common dependencies.
 * Import and use these in your test files instead of duplicating mocks.
 *
 * Usage:
 * ```typescript
 * import { vi } from "vitest";
 * import { mockNextIntl, mockI18n, mockCartContext } from "~/__mocks__/test-utils/mocks";
 *
 * // Apply mocks
 * vi.mock("next-intl", mockNextIntl);
 * vi.mock("~/i18n/useI18n", mockI18n);
 * ```
 */

import React from "react";
import { vi } from "vitest";

// ============================================================================
// Internationalization Mocks
// ============================================================================

/**
 * Mock for next-intl package.
 * Returns English locale by default.
 */
export const mockNextIntl = () => ({
  useLocale: () => "en",
});

/**
 * Mock for the i18n hook.
 * Returns the key with parameter interpolation.
 */
export const mockI18n = () => ({
  useI18n: () => (key: string, params?: Record<string, unknown>) => {
    if (params) {
      let result = key;
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(`{${k}}`, String(v));
      });
      return result;
    }
    return key;
  },
});

/**
 * Mock for next-intl navigation Link component.
 */
export const mockIntlNavigation = () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href }, children),
});

// ============================================================================
// Next.js Mocks
// ============================================================================

/**
 * Mock for next/link.
 */
export const mockNextLink = () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href }, children),
});

/**
 * Mock for next/image.
 */
export const mockNextImage = () => ({
  default: ({ alt, src }: { alt: string; src: string }) => React.createElement("img", { alt, src }),
});

/**
 * Creates a mock for next/navigation with configurable search params.
 */
export function createNextNavigationMock(searchParams = new URLSearchParams()) {
  return () => ({
    permanentRedirect: vi.fn(),
    redirect: vi.fn(),
    usePathname: () => "/en/shop/order/test-123",
    useRouter: () => ({
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
      push: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
    }),
    useSearchParams: () => searchParams,
  });
}

// ============================================================================
// Cart Context Mock
// ============================================================================

import { CartItem } from "~/contexts/CartContext";

/**
 * Configurable cart context mock.
 * Use the helper methods to configure cart state for individual tests.
 */
export function createCartContextMock() {
  let items: CartItem[] = [];
  let currency: string | undefined = undefined;
  let currencyMismatchWarning = false;

  const mockFns = {
    addItem: vi.fn(),
    clear: vi.fn(),
    clearCurrencyWarning: vi.fn(),
    removeItem: vi.fn(),
    setQuantity: vi.fn(),
  };

  return {
    // Configuration methods
    reset: () => {
      items = [];
      currency = undefined;
      currencyMismatchWarning = false;
      Object.values(mockFns).forEach((fn) => fn.mockClear());
    },
    setCurrency: (c: string | undefined) => {
      currency = c;
    },
    setCurrencyMismatchWarning: (warning: boolean) => {
      currencyMismatchWarning = warning;
    },
    setItems: (newItems: CartItem[]) => {
      items = newItems;
    },

    // Mock functions (for assertions)
    ...mockFns,

    // The mock factory function for vi.mock
    mockFactory: () => ({
      getCartItemId: (productId: string, variant?: unknown) =>
        variant ? `${productId}-${JSON.stringify(variant)}` : productId,
      useCart: () => ({
        addItem: mockFns.addItem,
        clear: mockFns.clear,
        clearCurrencyWarning: mockFns.clearCurrencyWarning,
        currency,
        currencyMismatchWarning,
        items,
        removeItem: mockFns.removeItem,
        setQuantity: mockFns.setQuantity,
        totalMinor: items.reduce((sum, item) => sum + item.priceMinor * item.quantity, 0),
      }),
    }),
  };
}

// ============================================================================
// Auth Context Mock
// ============================================================================

/**
 * Mock for auth context with configurable profile.
 */
export function createAuthContextMock() {
  let profile: Record<string, unknown> | null = null;

  return {
    mockFactory: () => ({
      useAuth: () => ({
        profile,
      }),
    }),
    reset: () => {
      profile = null;
    },
    setProfile: (p: Record<string, unknown> | null) => {
      profile = p;
    },
  };
}

// ============================================================================
// Notifications Mock
// ============================================================================

/**
 * Mock for notifications hook.
 */
export function createNotificationsMock() {
  const showError = vi.fn();
  const showSuccess = vi.fn();

  return {
    mockFactory: () => ({
      useNotifications: () => ({
        showError,
        showSuccess,
      }),
    }),
    reset: () => {
      showError.mockClear();
      showSuccess.mockClear();
    },
    showError,
    showSuccess,
  };
}

// ============================================================================
// Stripe Mocks
// ============================================================================

/**
 * Mock for @stripe/react-stripe-js.
 */
export function createStripeMock() {
  let stripeReady = true;
  let elementsReady = true;
  let expressCheckoutAvailable = false;
  const confirmPayment = vi.fn().mockResolvedValue({});

  return {
    confirmPayment,
    mockFactory: () => ({
      AddressElement: ({ options }: { options: { mode: string } }) =>
        React.createElement("div", { "data-testid": "address-element" }, `Address Element (mode: ${options.mode})`),
      ExpressCheckoutElement: ({
        onReady,
      }: {
        onConfirm: () => void;
        onReady: (data: { availablePaymentMethods: boolean }) => void;
      }) => {
        if (expressCheckoutAvailable) {
          Promise.resolve().then(() => {
            onReady({ availablePaymentMethods: true });
          });
        }
        return expressCheckoutAvailable
          ? React.createElement("div", { "data-testid": "express-checkout" }, "Express Checkout")
          : null;
      },
      PaymentElement: ({ options }: { options: { layout: string } }) =>
        React.createElement("div", { "data-testid": "payment-element" }, `Payment Element (layout: ${options.layout})`),
      useElements: () => (elementsReady ? {} : null),
      useStripe: () =>
        stripeReady
          ? {
              confirmPayment,
            }
          : null,
    }),
    reset: () => {
      stripeReady = true;
      elementsReady = true;
      expressCheckoutAvailable = false;
      confirmPayment.mockReset().mockResolvedValue({});
    },
    setElementsReady: (ready: boolean) => {
      elementsReady = ready;
    },
    setExpressCheckoutAvailable: (available: boolean) => {
      expressCheckoutAvailable = available;
    },
    setStripeReady: (ready: boolean) => {
      stripeReady = ready;
    },
  };
}

/**
 * Mock for @stripe/stripe-js loadStripe.
 */
export const mockStripeJs = () => ({
  loadStripe: vi.fn(() => Promise.resolve(null)),
});

// ============================================================================
// reCAPTCHA Mock
// ============================================================================

/**
 * Mock for react-google-recaptcha-v3.
 */
export function createRecaptchaMock() {
  const executeRecaptcha = vi.fn(() => Promise.resolve("test-captcha-token"));

  return {
    executeRecaptcha,
    mockFactory: () => ({
      GoogleReCaptchaProvider: ({ children }: { children: React.ReactNode }) => children,
      useGoogleReCaptcha: () => ({ executeRecaptcha }),
    }),
    reset: () => {
      executeRecaptcha.mockClear().mockImplementation(() => Promise.resolve("test-captcha-token"));
    },
  };
}

// ============================================================================
// Config Mocks
// ============================================================================

/**
 * Mock for public config.
 */
export const mockPublicConfig = () => ({
  publicConfig: {
    recaptcha: { siteKey: "test-site-key" },
    stripe: { publishableKey: "pk_test_123" },
  },
});

/**
 * Mock for constants.
 */
export const mockConstants = () => ({
  constants: {
    options: {
      PRODUCT_CATEGORIES: [
        { label: { en: "Clothing", uk: "Одяг" }, value: "clothing" },
        { label: { en: "Accessories", uk: "Аксесуари" }, value: "accessories" },
      ],
    },
    vercelBlobStorageUrl: "https://blob.example.com",
  },
});

/**
 * Mock for clothing constants.
 */
export const mockClothingConstants = () => ({
  CLOTHING_AGE_GROUP: [
    { label: { en: "Adult", uk: "Дорослий" }, value: "adult" },
    { label: { en: "Kids", uk: "Діти" }, value: "kids" },
  ],
  CLOTHING_GENDER: [
    { label: { en: "Unisex", uk: "Унісекс" }, value: "unisex" },
    { label: { en: "Men", uk: "Чоловіки" }, value: "men" },
    { label: { en: "Women", uk: "Жінки" }, value: "women" },
    { label: { en: "Boys", uk: "Хлопчики" }, value: "boys" },
    { label: { en: "Girls", uk: "Дівчатка" }, value: "girls" },
  ],
  CLOTHING_GENDER_ADULT: [
    { label: { en: "Men", uk: "Чоловіки" }, value: "men" },
    { label: { en: "Women", uk: "Жінки" }, value: "women" },
    { label: { en: "Unisex", uk: "Унісекс" }, value: "unisex" },
  ],
  CLOTHING_GENDER_KIDS: [
    { label: { en: "Boys", uk: "Хлопчики" }, value: "boys" },
    { label: { en: "Girls", uk: "Дівчатка" }, value: "girls" },
    { label: { en: "Unisex", uk: "Унісекс" }, value: "unisex" },
  ],
  CLOTHING_SIZE_ADULT: [
    { label: { en: "S", uk: "S" }, value: "s" },
    { label: { en: "M", uk: "M" }, value: "m" },
    { label: { en: "L", uk: "L" }, value: "l" },
    { label: { en: "XL", uk: "XL" }, value: "xl" },
    { label: { en: "2XL", uk: "2XL" }, value: "xxl" },
  ],
  CLOTHING_SIZE_KIDS: [
    { label: { en: "3-4Y", uk: "3-4 років" }, value: "y3_4" },
    { label: { en: "5-6Y", uk: "5-6 років" }, value: "y5_6" },
    { label: { en: "9-10Y", uk: "9-10 років" }, value: "y9_10" },
    { label: { en: "11-12Y", uk: "11-12 років" }, value: "y11_12" },
  ],
});
