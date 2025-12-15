import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Image from "next/image";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CartItem } from "~/contexts/CartContext";
import { Clothing_Age_Group_Enum, Clothing_Gender_Enum, Clothing_Size_Enum } from "~/types/graphql.generated";

import { CartView } from "./CartView";

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
    }: {
      children: React.ReactNode;
      disabled?: boolean;
      onClick?: () => void;
    }) => (
      <button disabled={disabled} onClick={onClick}>
        {children}
      </button>
    ),
    EmptyState: ({ body, heading }: { body: string; heading: string; icon?: React.ReactNode }) => (
      <div data-testid="empty-state">
        <h2>{heading}</h2>
        <p>{body}</p>
      </div>
    ),
    FallbackImage: ({ alt, src }: { alt: string; src: string }) => <Image alt={alt} src={src} />,
  };
});

// Mock constants
vi.mock("~/lib/constants/options/CLOTHING", () => ({
  CLOTHING_AGE_GROUP: [
    { label: { en: "Adult", uk: "Дорослий" }, value: "adult" },
    { label: { en: "Kids", uk: "Діти" }, value: "kids" },
  ],
  CLOTHING_GENDER: [
    { label: { en: "Unisex", uk: "Унісекс" }, value: "unisex" },
    { label: { en: "Men", uk: "Чоловіки" }, value: "men" },
    { label: { en: "Women", uk: "Жінки" }, value: "women" },
  ],
  CLOTHING_SIZE_ADULT: [
    { label: { en: "S", uk: "S" }, value: "s" },
    { label: { en: "M", uk: "M" }, value: "m" },
    { label: { en: "L", uk: "L" }, value: "l" },
  ],
  CLOTHING_SIZE_KIDS: [
    { label: { en: "7-8Y", uk: "7-8 років" }, value: "y7_8" },
    { label: { en: "9-10Y", uk: "9-10 років" }, value: "y9_10" },
  ],
}));

// Cart mock state
let mockCartItems: CartItem[] = [];
let mockCurrencyMismatchWarning = false;
const mockSetQuantity = vi.fn();
const mockRemoveItem = vi.fn();
const mockClear = vi.fn();
const mockClearCurrencyWarning = vi.fn();

vi.mock("~/contexts/CartContext", () => ({
  useCart: () => ({
    clear: mockClear,
    clearCurrencyWarning: mockClearCurrencyWarning,
    currencyMismatchWarning: mockCurrencyMismatchWarning,
    items: mockCartItems,
    removeItem: mockRemoveItem,
    setQuantity: mockSetQuantity,
    totalMinor: mockCartItems.reduce((sum, item) => sum + item.priceMinor * item.quantity, 0),
  }),
}));

const createCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  currency: "GBP",
  id: "prod-1",
  image: "test-image.webp",
  name: "Test Product",
  priceMinor: 2500,
  quantity: 1,
  slug: "test-product",
  stock: 10,
  ...overrides,
});

describe("CartView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCartItems = [];
    mockCurrencyMismatchWarning = false;
  });

  describe("empty cart", () => {
    it("shows empty state when cart has no items", () => {
      render(<CartView />);

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
      expect(screen.getByText("Add something from the shop to start checkout")).toBeInTheDocument();
    });

    it("shows breadcrumbs in empty state", () => {
      render(<CartView />);

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

    it("renders cart header with title", () => {
      render(<CartView />);

      expect(screen.getByRole("heading", { name: "Your Cart" })).toBeInTheDocument();
    });

    it("displays item count", () => {
      render(<CartView />);

      expect(screen.getByText("1 item")).toBeInTheDocument();
    });

    it("displays plural item count for multiple items", () => {
      mockCartItems = [createCartItem({ id: "prod-1" }), createCartItem({ id: "prod-2", name: "Product 2" })];

      render(<CartView />);

      expect(screen.getByText("2 items")).toBeInTheDocument();
    });

    it("displays product name", () => {
      render(<CartView />);

      expect(screen.getByRole("heading", { name: "Test Product" })).toBeInTheDocument();
    });

    it("displays formatted price", () => {
      render(<CartView />);

      // £25.00 appears in multiple places: item price, subtotal, and total
      const priceElements = screen.getAllByText("£25.00");
      expect(priceElements.length).toBeGreaterThanOrEqual(1);
    });

    it("displays unit price with each label", () => {
      mockCartItems = [createCartItem({ quantity: 2 })];

      render(<CartView />);

      expect(screen.getByText("£25.00 each")).toBeInTheDocument();
    });

    it("displays total price for multiple quantity", () => {
      mockCartItems = [createCartItem({ quantity: 3 })];

      render(<CartView />);

      // £75.00 appears in item total, subtotal, and total
      const priceElements = screen.getAllByText("£75.00");
      expect(priceElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("variant labels", () => {
    it("displays variant label for items with variant", () => {
      mockCartItems = [
        createCartItem({
          variant: {
            ageGroup: Clothing_Age_Group_Enum.Adult,
            gender: Clothing_Gender_Enum.Men,
            size: Clothing_Size_Enum.M,
          },
        }),
      ];

      render(<CartView />);

      expect(screen.getByText("Adult · Men · M")).toBeInTheDocument();
    });

    it("does not display variant label for items without variant", () => {
      mockCartItems = [createCartItem()];

      render(<CartView />);

      expect(screen.queryByText(/Adult/)).not.toBeInTheDocument();
    });
  });

  describe("quantity controls", () => {
    beforeEach(() => {
      mockCartItems = [createCartItem({ quantity: 2 })];
    });

    it("displays current quantity", () => {
      render(<CartView />);

      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("calls setQuantity with decreased value when minus clicked", async () => {
      const user = userEvent.setup();
      render(<CartView />);

      const minusButton = screen.getByRole("button", { name: "−" });
      await user.click(minusButton);

      expect(mockSetQuantity).toHaveBeenCalledWith("prod-1", 1);
    });

    it("calls setQuantity with increased value when plus clicked", async () => {
      const user = userEvent.setup();
      render(<CartView />);

      const plusButton = screen.getByRole("button", { name: "+" });
      await user.click(plusButton);

      expect(mockSetQuantity).toHaveBeenCalledWith("prod-1", 3);
    });

    it("disables plus button when quantity equals stock", () => {
      mockCartItems = [createCartItem({ quantity: 10, stock: 10 })];

      render(<CartView />);

      const plusButton = screen.getByRole("button", { name: "+" });
      expect(plusButton).toBeDisabled();
    });

    it("shows max stock warning when at limit", () => {
      mockCartItems = [createCartItem({ quantity: 10, stock: 10 })];

      render(<CartView />);

      expect(screen.getByText("Max stock")).toBeInTheDocument();
    });

    it("does not disable plus button when stock is undefined", () => {
      mockCartItems = [createCartItem({ quantity: 100, stock: undefined })];

      render(<CartView />);

      const plusButton = screen.getByRole("button", { name: "+" });
      expect(plusButton).not.toBeDisabled();
    });
  });

  describe("remove item", () => {
    beforeEach(() => {
      mockCartItems = [createCartItem()];
    });

    it("calls removeItem when Remove button clicked", async () => {
      const user = userEvent.setup();
      render(<CartView />);

      const removeButton = screen.getByRole("button", { name: "Remove" });
      await user.click(removeButton);

      expect(mockRemoveItem).toHaveBeenCalledWith("prod-1");
    });
  });

  describe("clear cart", () => {
    beforeEach(() => {
      mockCartItems = [createCartItem()];
    });

    it("calls clear when Clear cart button clicked", async () => {
      const user = userEvent.setup();
      render(<CartView />);

      const clearButton = screen.getByRole("button", { name: "Clear cart" });
      await user.click(clearButton);

      expect(mockClear).toHaveBeenCalled();
    });
  });

  describe("order summary", () => {
    beforeEach(() => {
      mockCartItems = [createCartItem({ priceMinor: 2500, quantity: 2 })];
    });

    it("displays order summary heading", () => {
      render(<CartView />);

      expect(screen.getByRole("heading", { name: "Order summary" })).toBeInTheDocument();
    });

    it("displays subtotal", () => {
      render(<CartView />);

      expect(screen.getByText("Subtotal")).toBeInTheDocument();
    });

    it("displays shipping note", () => {
      render(<CartView />);

      expect(screen.getByText("Shipping")).toBeInTheDocument();
      expect(screen.getByText("Calculated at checkout")).toBeInTheDocument();
    });

    it("displays total", () => {
      render(<CartView />);

      expect(screen.getByText("Total")).toBeInTheDocument();
      // £50.00 for 2 items at £25 each
      expect(screen.getAllByText("£50.00").length).toBeGreaterThan(0);
    });
  });

  describe("checkout button", () => {
    beforeEach(() => {
      mockCartItems = [createCartItem()];
    });

    it("renders proceed to checkout button", () => {
      render(<CartView />);

      expect(screen.getByRole("button", { name: "Proceed to checkout" })).toBeInTheDocument();
    });

    it("links to checkout page", () => {
      render(<CartView />);

      const checkoutLink = screen.getByRole("link", { name: "Proceed to checkout" });
      expect(checkoutLink).toHaveAttribute("href", "/en/shop/checkout");
    });
  });

  describe("currency mismatch warning", () => {
    beforeEach(() => {
      mockCartItems = [createCartItem()];
      mockCurrencyMismatchWarning = true;
    });

    it("displays warning when currency mismatch detected", () => {
      render(<CartView />);

      expect(
        screen.getByText(/Some items were removed from your cart because they had a different currency/),
      ).toBeInTheDocument();
    });

    it("calls clearCurrencyWarning when dismiss clicked", async () => {
      const user = userEvent.setup();
      render(<CartView />);

      const dismissButton = screen.getByRole("button", { name: "Dismiss" });
      await user.click(dismissButton);

      expect(mockClearCurrencyWarning).toHaveBeenCalled();
    });
  });

  describe("product links", () => {
    beforeEach(() => {
      mockCartItems = [createCartItem({ slug: "my-product" })];
    });

    it("links product image to product page", () => {
      render(<CartView />);

      const productLinks = screen.getAllByRole("link", { name: "Test Product" });
      expect(productLinks[0]).toHaveAttribute("href", "/en/shop/my-product");
    });

    it("links product name to product page", () => {
      render(<CartView />);

      const productLinks = screen.getAllByRole("link", { name: "Test Product" });
      expect(productLinks.length).toBeGreaterThan(0);
    });
  });
});
