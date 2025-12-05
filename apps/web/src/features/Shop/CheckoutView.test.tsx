import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "~/__mocks__/msw/server";
import { CartItem } from "~/contexts/CartContext";
import { Clothing_Age_Group_Enum, Clothing_Gender_Enum, Clothing_Size_Enum } from "~/types/graphql.generated";

import { CheckoutView } from "./CheckoutView";

// Mock next-intl
vi.mock("next-intl", () => ({
  useLocale: () => "en",
}));

// Mock i18n hook
vi.mock("~/i18n/useI18n", () => ({
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
}));

// Mock navigation Link
vi.mock("~/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

// Mock UI components
vi.mock("~/components/ui", async () => {
  const actual = await vi.importActual("~/components/ui");
  return {
    ...actual,
    Breadcrumbs: ({ items }: { items: Array<{ title: string; url?: string }> }) => (
      <nav data-testid="breadcrumbs">
        {items.map((item, i) => (
          <span key={i}>{item.title}</span>
        ))}
      </nav>
    ),
    Button: ({
      children,
      disabled,
      onClick,
      type,
    }: {
      children: React.ReactNode;
      disabled?: boolean;
      onClick?: () => void;
      type?: "button" | "submit";
    }) => (
      <button disabled={disabled} onClick={onClick} type={type ?? "button"}>
        {children}
      </button>
    ),
    EmptyState: ({ body, heading }: { body: string; heading: string; icon?: React.ReactNode }) => (
      <div data-testid="empty-state">
        <h2>{heading}</h2>
        <p>{body}</p>
      </div>
    ),
    FallbackImage: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
    Input: ({
      disabled,
      onChange,
      placeholder,
      value,
    }: {
      disabled?: boolean;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      placeholder?: string;
      value: string;
    }) => <input disabled={disabled} onChange={onChange} placeholder={placeholder} value={value} />,
  };
});

// Mock ShippingInfo component
vi.mock("./components", () => ({
  EU_SHIPPING_COST_MINOR: 899,
  FREE_SHIPPING_THRESHOLD_MINOR: 7000,
  ROW_SHIPPING_COST_MINOR: 1499,
  ShippingInfo: ({ compact }: { compact?: boolean }) => (
    <div data-testid="shipping-info">{compact ? "Compact shipping" : "Full shipping"}</div>
  ),
  UK_SHIPPING_COST_MINOR: 399,
}));

// Mock CheckoutForm component
vi.mock("./CheckoutForm", () => ({
  CheckoutForm: () => <div data-testid="checkout-form">Checkout Form</div>,
}));

// Mock Stripe Elements
vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div data-testid="stripe-elements">{children}</div>,
}));

// Mock Stripe loader
vi.mock("@stripe/stripe-js", () => ({
  loadStripe: vi.fn(() => Promise.resolve(null)),
}));

// Mock reCAPTCHA
const mockExecuteRecaptcha = vi.fn(() => Promise.resolve("test-captcha-token"));
vi.mock("react-google-recaptcha-v3", () => ({
  GoogleReCaptchaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useGoogleReCaptcha: () => ({ executeRecaptcha: mockExecuteRecaptcha }),
}));

// Mock config
vi.mock("~/lib/config/public", () => ({
  publicConfig: {
    recaptcha: { siteKey: "test-site-key" },
    stripe: { publishableKey: "pk_test_123" },
  },
}));

// Cart mock state
let mockCartItems: CartItem[] = [];
const mockRemoveItem = vi.fn();

vi.mock("~/contexts/CartContext", () => ({
  useCart: () => ({
    items: mockCartItems,
    removeItem: mockRemoveItem,
  }),
}));

// Auth mock
vi.mock("~/contexts/AuthContext", () => ({
  useAuth: () => ({
    profile: null,
  }),
}));

const createCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  currency: "GBP",
  id: "prod-1::unisex::adult::m",
  image: "test-image.webp",
  name: "Test Product",
  priceMinor: 2500,
  quantity: 1,
  slug: "test-product",
  stock: 10,
  variant: {
    ageGroup: Clothing_Age_Group_Enum.Adult,
    gender: Clothing_Gender_Enum.Unisex,
    size: Clothing_Size_Enum.M,
  },
  ...overrides,
});

describe("CheckoutView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCartItems = [];
    server.resetHandlers();
  });

  describe("empty cart", () => {
    it("shows empty state when cart has no items", () => {
      render(<CheckoutView />);

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText("Your bag is empty")).toBeInTheDocument();
    });

    it("shows breadcrumbs in empty state", () => {
      render(<CheckoutView />);

      const breadcrumbs = screen.getByTestId("breadcrumbs");
      expect(breadcrumbs).toBeInTheDocument();
      expect(breadcrumbs).toHaveTextContent("Home");
      expect(breadcrumbs).toHaveTextContent("Shop");
    });
  });

  describe("cart with items", () => {
    beforeEach(() => {
      mockCartItems = [createCartItem()];
    });

    it("renders checkout heading", () => {
      render(<CheckoutView />);

      expect(screen.getByRole("heading", { name: "Checkout" })).toBeInTheDocument();
    });

    it("shows breadcrumbs with checkout path", () => {
      render(<CheckoutView />);

      const breadcrumbs = screen.getByTestId("breadcrumbs");
      expect(breadcrumbs).toHaveTextContent("Bag");
      expect(breadcrumbs).toHaveTextContent("Checkout");
    });

    it("displays order summary heading", () => {
      render(<CheckoutView />);

      expect(screen.getByRole("heading", { name: /Order summary/i })).toBeInTheDocument();
    });

    it("displays product in order summary", () => {
      render(<CheckoutView />);

      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    it("displays quantity in order summary", () => {
      render(<CheckoutView />);

      expect(screen.getByText(/Qty.*1/)).toBeInTheDocument();
    });

    it("displays formatted price", () => {
      render(<CheckoutView />);

      // £25.00 appears in item price and subtotal
      const priceElements = screen.getAllByText("£25.00");
      expect(priceElements.length).toBeGreaterThanOrEqual(1);
    });

    it("displays subtotal with item count", () => {
      render(<CheckoutView />);

      expect(screen.getByText(/Subtotal.*1.*item/)).toBeInTheDocument();
    });

    it("displays edit bag link", () => {
      render(<CheckoutView />);

      const editLink = screen.getByRole("link", { name: /Edit bag/i });
      expect(editLink).toHaveAttribute("href", "/shop/cart");
    });

    it("displays shipping destination selector", () => {
      render(<CheckoutView />);

      // Shipping destination selector is present
      expect(screen.getByText(/Shipping destination/i)).toBeInTheDocument();
      // Default value is United Kingdom
      expect(screen.getByText("United Kingdom")).toBeInTheDocument();
    });
  });

  describe("email input", () => {
    beforeEach(() => {
      mockCartItems = [createCartItem()];
    });

    it("displays contact information heading", () => {
      render(<CheckoutView />);

      expect(screen.getByRole("heading", { name: "Contact information" })).toBeInTheDocument();
    });

    it("displays email input", () => {
      render(<CheckoutView />);

      expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    });

    it("displays email helper text", () => {
      render(<CheckoutView />);

      expect(screen.getByText("I'll send your order confirmation to this address.")).toBeInTheDocument();
    });

    it("allows typing in email input", async () => {
      const user = userEvent.setup();
      render(<CheckoutView />);

      const emailInput = screen.getByPlaceholderText("Email address");
      await user.type(emailInput, "test@example.com");

      expect(emailInput).toHaveValue("test@example.com");
    });
  });

  describe("continue button", () => {
    beforeEach(() => {
      mockCartItems = [createCartItem()];
    });

    it("displays continue button", () => {
      render(<CheckoutView />);

      expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
    });

    it("disables continue button when email is empty", () => {
      render(<CheckoutView />);

      const continueButton = screen.getByRole("button", { name: "Continue" });
      expect(continueButton).toBeDisabled();
    });

    it("enables continue button when valid email entered", async () => {
      const user = userEvent.setup();
      render(<CheckoutView />);

      const emailInput = screen.getByPlaceholderText("Email address");
      await user.type(emailInput, "test@example.com");

      const continueButton = screen.getByRole("button", { name: "Continue" });
      expect(continueButton).not.toBeDisabled();
    });

    it("keeps button disabled for invalid email", async () => {
      const user = userEvent.setup();
      render(<CheckoutView />);

      const emailInput = screen.getByPlaceholderText("Email address");
      await user.type(emailInput, "notanemail");

      const continueButton = screen.getByRole("button", { name: "Continue" });
      expect(continueButton).toBeDisabled();
    });

    it("keeps button disabled for email without TLD", async () => {
      const user = userEvent.setup();
      render(<CheckoutView />);

      const emailInput = screen.getByPlaceholderText("Email address");
      await user.type(emailInput, "user@domain");

      const continueButton = screen.getByRole("button", { name: "Continue" });
      expect(continueButton).toBeDisabled();
    });

    it("keeps button disabled for email with single-char TLD", async () => {
      const user = userEvent.setup();
      render(<CheckoutView />);

      const emailInput = screen.getByPlaceholderText("Email address");
      await user.type(emailInput, "user@domain.c");

      const continueButton = screen.getByRole("button", { name: "Continue" });
      expect(continueButton).toBeDisabled();
    });
  });

  describe("checkout initiation", () => {
    beforeEach(() => {
      mockCartItems = [createCartItem()];
    });

    it("shows validating state when continue clicked", async () => {
      const user = userEvent.setup();

      // Setup slow response
      server.use(
        http.post("/api/checkout", async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({ clientSecret: "pi_test_secret" });
        }),
      );

      render(<CheckoutView />);

      const emailInput = screen.getByPlaceholderText("Email address");
      await user.type(emailInput, "test@example.com");

      const continueButton = screen.getByRole("button", { name: "Continue" });
      await user.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText("Validating your order...")).toBeInTheDocument();
      });
    });

    it("shows checkout form on successful validation", async () => {
      const user = userEvent.setup();

      server.use(
        http.post("/api/checkout", () => {
          return HttpResponse.json({
            clientSecret: "pi_test_secret",
            currency: "GBP",
            items: [],
            orderId: "order-123",
            paymentIntentId: "pi_test_123",
            shippingMinor: 0,
            subtotalMinor: 2500,
            totalMinor: 2500,
          });
        }),
      );

      render(<CheckoutView />);

      const emailInput = screen.getByPlaceholderText("Email address");
      await user.type(emailInput, "test@example.com");

      const continueButton = screen.getByRole("button", { name: "Continue" });
      await user.click(continueButton);

      await waitFor(() => {
        expect(screen.getByTestId("stripe-elements")).toBeInTheDocument();
      });
    });

    it("shows error on validation failure", async () => {
      const user = userEvent.setup();

      server.use(
        http.post("/api/checkout", () => {
          return HttpResponse.json(
            {
              code: "CART_VALIDATION_FAILED",
              data: {
                errors: [{ itemId: "prod-1", message: "Product not found", type: "not_found" }],
              },
              error: "Validation failed",
            },
            { status: 400 },
          );
        }),
      );

      render(<CheckoutView />);

      const emailInput = screen.getByPlaceholderText("Email address");
      await user.type(emailInput, "test@example.com");

      const continueButton = screen.getByRole("button", { name: "Continue" });
      await user.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText("Cart issues detected")).toBeInTheDocument();
        expect(screen.getByText("Product not found")).toBeInTheDocument();
      });
    });

    it("shows rate limit error", async () => {
      const user = userEvent.setup();

      server.use(
        http.post("/api/checkout", () => {
          return HttpResponse.json({ code: "RATE_LIMIT", error: "Too many requests" }, { status: 429 });
        }),
      );

      render(<CheckoutView />);

      const emailInput = screen.getByPlaceholderText("Email address");
      await user.type(emailInput, "test@example.com");

      const continueButton = screen.getByRole("button", { name: "Continue" });
      await user.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText("Too many requests. Please wait a moment and try again.")).toBeInTheDocument();
      });
    });
  });

  // Note: Remove item functionality was moved to CartView only.
  // Users can remove items via the "Edit bag" link which takes them to /shop/cart

  describe("multiple items", () => {
    beforeEach(() => {
      mockCartItems = [
        createCartItem({ id: "prod-1", name: "Product 1", priceMinor: 2500, quantity: 2 }),
        createCartItem({ id: "prod-2", name: "Product 2", priceMinor: 1500, quantity: 1 }),
      ];
    });

    it("displays all items", () => {
      render(<CheckoutView />);

      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 2")).toBeInTheDocument();
    });

    it("shows correct total items count", () => {
      render(<CheckoutView />);

      expect(screen.getByText(/Subtotal.*3.*items/)).toBeInTheDocument();
    });

    it("calculates correct total", () => {
      render(<CheckoutView />);

      // (2500 * 2) + (1500 * 1) + 399 shipping = 6899
      expect(screen.getByText("£68.99")).toBeInTheDocument();
    });
  });
});
