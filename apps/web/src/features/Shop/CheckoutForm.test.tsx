import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CheckoutForm } from "./CheckoutForm";

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

// Mock UI components
vi.mock("~/components/ui", async () => {
  const actual = await vi.importActual("~/components/ui");
  return {
    ...actual,
    Button: ({
      children,
      disabled,
      type,
    }: {
      children: React.ReactNode;
      disabled?: boolean;
      type?: "button" | "submit";
    }) => (
      <button disabled={disabled} type={type ?? "button"}>
        {children}
      </button>
    ),
  };
});

// Mock Stripe hooks
const mockConfirmPayment = vi.fn();
let mockStripeReady = true;
let mockElementsReady = true;
let mockExpressCheckoutAvailable = false;

vi.mock("@stripe/react-stripe-js", () => ({
  AddressElement: ({ options }: { options: unknown }) => (
    <div data-testid="address-element">Address Element (mode: {(options as { mode: string }).mode})</div>
  ),
  ExpressCheckoutElement: ({
    onReady,
  }: {
    onConfirm: () => void;
    onReady: (data: { availablePaymentMethods: boolean }) => void;
  }) => {
    // Call onReady synchronously via useEffect to trigger state update
    if (mockExpressCheckoutAvailable) {
      // Use setTimeout(0) to call after render but before test assertion
      Promise.resolve().then(() => {
        onReady({ availablePaymentMethods: true });
      });
    }
    return mockExpressCheckoutAvailable ? <div data-testid="express-checkout">Express Checkout</div> : null;
  },
  PaymentElement: ({ options }: { options: unknown }) => (
    <div data-testid="payment-element">Payment Element (layout: {(options as { layout: string }).layout})</div>
  ),
  useElements: () => (mockElementsReady ? {} : null),
  useStripe: () =>
    mockStripeReady
      ? {
          confirmPayment: mockConfirmPayment,
        }
      : null,
}));

describe("CheckoutForm", () => {
  const defaultProps = {
    currency: "GBP",
    email: "test@example.com",
    orderId: "order-123",
    totalMinor: 5000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockStripeReady = true;
    mockElementsReady = true;
    mockExpressCheckoutAvailable = false;
    mockConfirmPayment.mockResolvedValue({});
  });

  describe("form structure", () => {
    it("renders shipping address section", () => {
      render(<CheckoutForm {...defaultProps} />);

      expect(screen.getByRole("heading", { name: "Shipping address" })).toBeInTheDocument();
      expect(screen.getByTestId("address-element")).toBeInTheDocument();
    });

    it("renders payment section", () => {
      render(<CheckoutForm {...defaultProps} />);

      expect(screen.getByRole("heading", { name: "Payment" })).toBeInTheDocument();
      expect(screen.getByTestId("payment-element")).toBeInTheDocument();
    });

    it("renders submit button with formatted price", () => {
      render(<CheckoutForm {...defaultProps} />);

      expect(screen.getByRole("button", { name: /Pay.*£50\.00/ })).toBeInTheDocument();
    });

    it("renders security note", () => {
      render(<CheckoutForm {...defaultProps} />);

      expect(screen.getByText("Your payment is securely processed by Stripe.")).toBeInTheDocument();
    });
  });

  describe("express checkout", () => {
    it("does not show express checkout divider when unavailable", () => {
      mockExpressCheckoutAvailable = false;

      render(<CheckoutForm {...defaultProps} />);

      expect(screen.queryByText("Or pay another way")).not.toBeInTheDocument();
    });

    it("shows express checkout when available", async () => {
      mockExpressCheckoutAvailable = true;

      render(<CheckoutForm {...defaultProps} />);

      // Wait for onReady callback to trigger state update
      await screen.findByTestId("express-checkout");

      // Use act to wait for state updates to propagate
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(screen.getByText("Or pay another way")).toBeInTheDocument();
    });
  });

  describe("address element", () => {
    it("configures address element for shipping mode", () => {
      render(<CheckoutForm {...defaultProps} />);

      const addressElement = screen.getByTestId("address-element");
      expect(addressElement).toHaveTextContent("mode: shipping");
    });
  });

  describe("payment element", () => {
    it("configures payment element with tabs layout", () => {
      render(<CheckoutForm {...defaultProps} />);

      const paymentElement = screen.getByTestId("payment-element");
      expect(paymentElement).toHaveTextContent("layout: tabs");
    });
  });

  describe("submit button state", () => {
    it("disables submit when stripe not ready", () => {
      mockStripeReady = false;

      render(<CheckoutForm {...defaultProps} />);

      expect(screen.getByRole("button", { name: /Pay/ })).toBeDisabled();
    });

    it("disables submit when elements not ready", () => {
      mockElementsReady = false;

      render(<CheckoutForm {...defaultProps} />);

      expect(screen.getByRole("button", { name: /Pay/ })).toBeDisabled();
    });

    it("enables submit when stripe and elements ready", () => {
      render(<CheckoutForm {...defaultProps} />);

      expect(screen.getByRole("button", { name: /Pay/ })).not.toBeDisabled();
    });
  });

  describe("form submission", () => {
    it("calls confirmPayment on form submit", async () => {
      const user = userEvent.setup();
      render(<CheckoutForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /Pay/ });
      await user.click(submitButton);

      expect(mockConfirmPayment).toHaveBeenCalledWith({
        confirmParams: {
          return_url: expect.stringContaining("/en/shop/order/order-123"),
        },
        elements: expect.anything(),
      });
    });

    it("shows processing state during submission", async () => {
      const user = userEvent.setup();
      mockConfirmPayment.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({}), 100)));

      render(<CheckoutForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /Pay/ });
      await user.click(submitButton);

      expect(screen.getByText("Processing...")).toBeInTheDocument();
    });

    it("shows error on payment failure", async () => {
      const user = userEvent.setup();
      mockConfirmPayment.mockResolvedValue({
        error: { message: "Your card was declined.", type: "card_error" },
      });

      render(<CheckoutForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /Pay/ });
      await user.click(submitButton);

      expect(await screen.findByText("Your card was declined.")).toBeInTheDocument();
    });

    it("shows generic error on validation error", async () => {
      const user = userEvent.setup();
      mockConfirmPayment.mockResolvedValue({
        error: { message: "Invalid card number", type: "validation_error" },
      });

      render(<CheckoutForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /Pay/ });
      await user.click(submitButton);

      expect(await screen.findByText("Invalid card number")).toBeInTheDocument();
    });

    it("shows fallback error message when none provided", async () => {
      const user = userEvent.setup();
      mockConfirmPayment.mockResolvedValue({
        error: { type: "card_error" },
      });

      render(<CheckoutForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /Pay/ });
      await user.click(submitButton);

      expect(await screen.findByText("Payment failed. Please try again.")).toBeInTheDocument();
    });

    it("shows unexpected error on exception", async () => {
      const user = userEvent.setup();
      mockConfirmPayment.mockRejectedValue(new Error("Network error"));

      render(<CheckoutForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /Pay/ });
      await user.click(submitButton);

      expect(await screen.findByText("An unexpected error occurred. Please try again.")).toBeInTheDocument();
    });
  });

  describe("currency formatting", () => {
    it("formats GBP price correctly", () => {
      render(<CheckoutForm {...defaultProps} currency="GBP" totalMinor={2500} />);

      expect(screen.getByRole("button", { name: /Pay.*£25\.00/ })).toBeInTheDocument();
    });

    it("formats EUR price correctly", () => {
      render(<CheckoutForm {...defaultProps} currency="EUR" totalMinor={2000} />);

      expect(screen.getByRole("button", { name: /Pay.*€20\.00/ })).toBeInTheDocument();
    });
  });
});
