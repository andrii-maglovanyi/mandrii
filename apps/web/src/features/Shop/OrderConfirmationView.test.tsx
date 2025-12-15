import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "~/__mocks__/msw/server";

import { OrderConfirmationView } from "./OrderConfirmationView";

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

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

// Mock next/navigation
let mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
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
  useSearchParams: () => mockSearchParams,
}));

// Mock UI components
vi.mock("~/components/ui", async () => {
  const actual = await vi.importActual("~/components/ui");
  return {
    ...actual,
    Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
      <button onClick={onClick}>{children}</button>
    ),
  };
});

// Cart mock
const mockClear = vi.fn();
vi.mock("~/contexts/CartContext", () => ({
  useCart: () => ({
    clear: mockClear,
  }),
}));

const createMockOrder = (overrides = {}) => ({
  created_at: "2024-01-15T10:00:00Z",
  currency: "GBP",
  email: "test@example.com",
  id: "order-123-456-789",
  order_items: [
    {
      currency: "GBP",
      id: "item-1",
      metadata: null,
      name_snapshot: "Test Product",
      product: {
        id: "prod-1",
        images: ["test.webp"],
        name: "Test Product",
        slug: "test-product",
      },
      quantity: 2,
      unit_price_minor: 2500,
    },
  ],
  payment_intent_id: "pi_test_123",
  status: "paid",
  subtotal_minor: 5000,
  total_minor: 5350,
  ...overrides,
});

describe("OrderConfirmationView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    server.resetHandlers();
  });

  describe("loading state", () => {
    it("shows loading state initially", () => {
      server.use(
        http.get("/api/orders/:orderId", async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({ order: createMockOrder() });
        }),
      );

      render(<OrderConfirmationView orderId="order-123" />);

      expect(screen.getByText("Loading order...")).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("shows error when order fetch fails", async () => {
      server.use(
        http.get("/api/orders/:orderId", () => {
          return HttpResponse.json({ error: "Not found" }, { status: 404 });
        }),
      );

      render(<OrderConfirmationView orderId="order-123" />);

      await waitFor(() => {
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      });
    });

    it("shows continue shopping link on error", async () => {
      server.use(
        http.get("/api/orders/:orderId", () => {
          return HttpResponse.json({ error: "Not found" }, { status: 404 });
        }),
      );

      render(<OrderConfirmationView orderId="order-123" />);

      await waitFor(() => {
        const continueLink = screen.getByRole("link", { name: "Continue shopping" });
        expect(continueLink).toHaveAttribute("href", "/en/shop");
      });
    });
  });

  describe("success state", () => {
    it("shows success heading for paid order", async () => {
      server.use(
        http.get("/api/orders/:orderId", () => {
          return HttpResponse.json({ order: createMockOrder({ status: "paid" }) });
        }),
      );

      render(<OrderConfirmationView orderId="order-123" />);

      await waitFor(() => {
        expect(screen.getByText("Payment successful!")).toBeInTheDocument();
      });
    });

    it("shows success description", async () => {
      server.use(
        http.get("/api/orders/:orderId", () => {
          return HttpResponse.json({ order: createMockOrder({ status: "paid" }) });
        }),
      );

      render(<OrderConfirmationView orderId="order-123" />);

      await waitFor(() => {
        expect(
          screen.getByText("Your order has been confirmed! We'll send you an email with the details."),
        ).toBeInTheDocument();
      });
    });

    it("clears cart on successful payment", async () => {
      server.use(
        http.get("/api/orders/:orderId", () => {
          return HttpResponse.json({ order: createMockOrder({ status: "paid" }) });
        }),
      );

      render(<OrderConfirmationView orderId="order-123" />);

      await waitFor(() => {
        expect(mockClear).toHaveBeenCalled();
      });
    });
  });

  describe("failed state", () => {
    it("shows failed heading for failed order", async () => {
      server.use(
        http.get("/api/orders/:orderId", () => {
          return HttpResponse.json({ order: createMockOrder({ status: "failed" }) });
        }),
      );

      render(<OrderConfirmationView orderId="order-123" />);

      await waitFor(() => {
        expect(screen.getByText("Payment failed")).toBeInTheDocument();
      });
    });

    it("shows try again button for failed payment", async () => {
      server.use(
        http.get("/api/orders/:orderId", () => {
          return HttpResponse.json({ order: createMockOrder({ status: "failed" }) });
        }),
      );

      render(<OrderConfirmationView orderId="order-123" />);

      const tryAgainLink = await screen.findByRole("link", { name: "Try again" });
      await waitFor(() => {
        expect(tryAgainLink).toHaveAttribute("href", "/en/shop/cart");
      });
    });

    it("uses redirect_status when order is pending", async () => {
      mockSearchParams = new URLSearchParams("redirect_status=failed");

      server.use(
        http.get("/api/orders/:orderId", () => {
          return HttpResponse.json({ order: createMockOrder({ status: "pending" }) });
        }),
      );

      render(<OrderConfirmationView orderId="order-123" />);

      await waitFor(() => {
        expect(screen.getByText("Payment failed")).toBeInTheDocument();
      });
    });
  });

  describe("processing state", () => {
    it("shows processing heading for pending order", async () => {
      server.use(
        http.get("/api/orders/:orderId", () => {
          return HttpResponse.json({ order: createMockOrder({ status: "pending" }) });
        }),
      );

      render(<OrderConfirmationView orderId="order-123" />);

      await waitFor(() => {
        expect(screen.getByText("Payment processing")).toBeInTheDocument();
      });
    });

    it("shows processing description", async () => {
      server.use(
        http.get("/api/orders/:orderId", () => {
          return HttpResponse.json({ order: createMockOrder({ status: "pending" }) });
        }),
      );

      render(<OrderConfirmationView orderId="order-123" />);

      await waitFor(() => {
        expect(
          screen.getByText("Your payment is being processed. We'll send you a confirmation email once complete."),
        ).toBeInTheDocument();
      });
    });
  });

  describe("order details", () => {
    beforeEach(() => {
      server.use(
        http.get("/api/orders/:orderId", () => {
          return HttpResponse.json({ order: createMockOrder({ status: "paid" }) });
        }),
      );
    });

    it("shows order details heading", async () => {
      render(<OrderConfirmationView orderId="order-123" />);

      await waitFor(() => {
        expect(screen.getByText("Order details")).toBeInTheDocument();
      });
    });

    it("shows order ID (truncated)", async () => {
      render(<OrderConfirmationView orderId="order-123" />);

      await waitFor(() => {
        // Order ID is split: <span>Order ID:</span> order-12...
        expect(screen.getByText("Order ID:")).toBeInTheDocument();
      });
      expect(screen.getByText(/order-12/)).toBeInTheDocument();
    });

    it("shows email", async () => {
      render(<OrderConfirmationView orderId="order-123" />);

      await waitFor(() => {
        // Email is split: <span>Email:</span> test@example.com
        expect(screen.getByText("Email:")).toBeInTheDocument();
      });
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    it("shows formatted date", async () => {
      render(<OrderConfirmationView orderId="order-123" />);

      await waitFor(() => {
        // Date is split: <span>Date:</span> January 15, 2024
        expect(screen.getByText("Date:")).toBeInTheDocument();
      });
      expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
    });

    it("shows order items", async () => {
      render(<OrderConfirmationView orderId="order-123" />);

      await waitFor(() => {
        expect(screen.getByText(/Test Product.*×.*2/)).toBeInTheDocument();
      });
    });

    it("shows item price", async () => {
      render(<OrderConfirmationView orderId="order-123" />);

      const priceElements = await screen.findAllByText("£50.00");
      await waitFor(() => {
        // £50.00 appears in both item line and subtotal
        expect(priceElements.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("shows subtotal", async () => {
      render(<OrderConfirmationView orderId="order-123" />);

      await waitFor(() => {
        expect(screen.getAllByText("£50.00").length).toBeGreaterThan(0);
      });
    });

    it("shows total", async () => {
      render(<OrderConfirmationView orderId="order-123" />);

      await waitFor(() => {
        expect(screen.getByText("£53.50")).toBeInTheDocument(); // 5350 minor
      });
    });
  });

  describe("continue shopping", () => {
    it("shows continue shopping link", async () => {
      server.use(
        http.get("/api/orders/:orderId", () => {
          return HttpResponse.json({ order: createMockOrder({ status: "paid" }) });
        }),
      );

      render(<OrderConfirmationView orderId="order-123" />);

      const continueLink = await screen.findByRole("link", { name: "Continue shopping" });
      await waitFor(() => {
        expect(continueLink).toHaveAttribute("href", "/en/shop");
      });
    });
  });

  describe("multiple order items", () => {
    it("displays all order items", async () => {
      const orderWithMultipleItems = createMockOrder({
        order_items: [
          {
            currency: "GBP",
            id: "item-1",
            metadata: null,
            name_snapshot: "Product One",
            product: null,
            quantity: 1,
            unit_price_minor: 2500,
          },
          {
            currency: "GBP",
            id: "item-2",
            metadata: null,
            name_snapshot: "Product Two",
            product: null,
            quantity: 3,
            unit_price_minor: 1500,
          },
        ],
        subtotal_minor: 7000,
        total_minor: 7350,
      });

      server.use(
        http.get("/api/orders/:orderId", () => {
          return HttpResponse.json({ order: orderWithMultipleItems });
        }),
      );

      render(<OrderConfirmationView orderId="order-123" />);

      await waitFor(() => {
        expect(screen.getByText(/Product One.*×.*1/)).toBeInTheDocument();
      });
      expect(screen.getByText(/Product Two.*×.*3/)).toBeInTheDocument();
    });
  });
});
