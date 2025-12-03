import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { server, shopErrorHandlers, mockProducts, mockProductBySlug } from "~/__mocks__/msw";
import { Product } from "~/hooks/useProducts";

import { ProductView } from "./ProductView";

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

// Mock the navigation Link
vi.mock("~/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

// Mock UI components
vi.mock("~/components/ui", async () => {
  const actual = await vi.importActual("~/components/ui");
  return {
    ...actual,
    AnimatedEllipsis: () => <span data-testid="animated-ellipsis">Loading...</span>,
    Breadcrumbs: ({ items }: { items: Array<{ title: string; url?: string }> }) => (
      <nav data-testid="breadcrumbs">
        {items.map((item, i) => (
          <span key={i}>{item.title}</span>
        ))}
      </nav>
    ),
    ImageCarousel: ({ images }: { autoPlay?: boolean; images: string[]; showDots?: boolean }) => (
      <div data-testid="image-carousel">
        {images.map((img, i) => (
          <img alt={`Product ${i + 1}`} key={i} src={img} />
        ))}
      </div>
    ),
    TabPane: ({ children, tab }: { children: React.ReactNode; tab: string }) => (
      <div data-testid={`tab-${tab}`}>{children}</div>
    ),
    Tabs: ({ children }: { children: React.ReactNode; defaultActiveKey: string }) => (
      <div data-testid="tabs">{children}</div>
    ),
  };
});

// Mock constants
vi.mock("~/lib/constants", () => ({
  constants: {
    vercelBlobStorageUrl: "https://blob.example.com",
  },
}));

// Mock clothing constants
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
    { label: { en: "XL", uk: "XL" }, value: "xl" },
    { label: { en: "2XL", uk: "2XL" }, value: "2xl" },
  ],
  CLOTHING_SIZE_KIDS: [
    { label: { en: "3-4Y", uk: "3-4 років" }, value: "3-4y" },
    { label: { en: "5-6Y", uk: "5-6 років" }, value: "5-6y" },
    { label: { en: "9-10Y", uk: "9-10 років" }, value: "9-10y" },
    { label: { en: "11-12Y", uk: "11-12 років" }, value: "11-12y" },
  ],
}));

// Mock cart context - configurable per test
const mockAddItem = vi.fn();
let mockCartCurrency: string | undefined = undefined;

vi.mock("~/contexts/CartContext", () => ({
  getCartItemId: (productId: string, variant?: unknown) =>
    variant ? `${productId}-${JSON.stringify(variant)}` : productId,
  useCart: () => ({
    addItem: mockAddItem,
    currency: mockCartCurrency,
  }),
}));

// Helper to set cart currency for tests
const setMockCartCurrency = (currency: string | undefined) => {
  mockCartCurrency = currency;
};

// Mock notifications hook
const mockShowError = vi.fn();
vi.mock("~/hooks/useNotifications", () => ({
  useNotifications: () => ({
    showError: mockShowError,
    showSuccess: vi.fn(),
  }),
}));

// Mock useProducts hook
const mockUseGetProduct = vi.fn();

vi.mock("~/hooks/useProducts", () => ({
  useProducts: () => ({
    useGetProduct: mockUseGetProduct,
  }),
}));

describe("ProductView", () => {
  // Use the Ukrainian Heart Hoodie from MSW mock data
  const testProduct = mockProductBySlug("ukrainian-heart-hoodie") as Product;
  const testSlug = "ukrainian-heart-hoodie";

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetProduct.mockReturnValue({
      data: testProduct,
      error: null,
      loading: false,
    });
  });

  describe("rendering", () => {
    it("renders breadcrumbs with product name", () => {
      render(<ProductView slug={testSlug} />);

      const breadcrumbs = screen.getByTestId("breadcrumbs");
      expect(breadcrumbs).toBeInTheDocument();
      expect(breadcrumbs).toHaveTextContent("Home");
      expect(breadcrumbs).toHaveTextContent("Shop");
      expect(breadcrumbs).toHaveTextContent(testProduct.name);
    });

    it("renders product name as heading", () => {
      render(<ProductView slug={testSlug} />);

      expect(screen.getByRole("heading", { name: testProduct.name })).toBeInTheDocument();
    });

    it("renders formatted price", () => {
      render(<ProductView slug={testSlug} />);

      // £45.00 for 4500 pence GBP
      expect(screen.getByText("£45.00")).toBeInTheDocument();
    });

    it("renders product category", () => {
      render(<ProductView slug={testSlug} />);

      const categoryElements = screen.getAllByText("clothing");
      expect(categoryElements.length).toBeGreaterThanOrEqual(1);
    });

    it("renders image carousel with product images", () => {
      render(<ProductView slug={testSlug} />);

      const carousel = screen.getByTestId("image-carousel");
      expect(carousel).toBeInTheDocument();

      const images = carousel.querySelectorAll("img");
      expect(images.length).toBe(testProduct.images?.length || 0);
    });

    it("renders product description", () => {
      render(<ProductView slug={testSlug} />);

      if (testProduct.description_en) {
        expect(screen.getByText(testProduct.description_en)).toBeInTheDocument();
      }
    });
  });

  describe("loading state", () => {
    it("shows loading indicator when loading", () => {
      mockUseGetProduct.mockReturnValue({
        data: null,
        error: null,
        loading: true,
      });

      render(<ProductView slug={testSlug} />);

      expect(screen.getByTestId("animated-ellipsis")).toBeInTheDocument();
    });
  });

  describe("not found state", () => {
    it("shows empty state when product not found", () => {
      server.use(shopErrorHandlers.productNotFound);

      mockUseGetProduct.mockReturnValue({
        data: null,
        error: null,
        loading: false,
      });

      render(<ProductView slug="non-existent-product" />);

      expect(screen.getByText("Product not found")).toBeInTheDocument();
    });
  });

  describe("variant selection", () => {
    it("renders variant selectors for products with variants", () => {
      render(<ProductView slug={testSlug} />);

      expect(screen.getByText("Gender")).toBeInTheDocument();
      expect(screen.getByText("Size")).toBeInTheDocument();
    });

    it("shows gender options", () => {
      render(<ProductView slug={testSlug} />);

      // Ukrainian Heart Hoodie has unisex variants
      expect(screen.getByRole("button", { name: "Unisex" })).toBeInTheDocument();
    });

    it("enables size selector after selecting gender and age group", async () => {
      const user = userEvent.setup();
      render(<ProductView slug={testSlug} />);

      // Select gender
      await user.click(screen.getByRole("button", { name: "Unisex" }));

      // Select age group
      const adultButton = screen.getByRole("button", { name: "Adult" });
      if (!adultButton.hasAttribute("disabled")) {
        await user.click(adultButton);
      }

      // Size options should be available
      const sizeButtons = screen.getAllByRole("button", { name: /^[SMLX]+$|^\d+-\d+y$/ });
      expect(sizeButtons.length).toBeGreaterThan(0);
    });
  });

  describe("color selection", () => {
    // Use the Sunflower Sweatshirt which has color variants (black, navy)
    const colorProduct = mockProductBySlug("sunflower-sweatshirt") as Product;

    beforeEach(() => {
      mockUseGetProduct.mockReturnValue({
        data: colorProduct,
        error: null,
        loading: false,
      });
    });

    it("shows color selector for products with color variants", async () => {
      const user = userEvent.setup();
      render(<ProductView slug="sunflower-sweatshirt" />);

      // Select gender (unisex for this product)
      await user.click(screen.getByRole("button", { name: "Unisex" }));

      // Select age group
      const adultButton = screen.getByRole("button", { name: "Adult" });
      await user.click(adultButton);

      // Select size
      const sizeM = screen.getByRole("button", { name: "M" });
      await user.click(sizeM);

      // Color selector should now be visible
      expect(screen.getByText("Color")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Black" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Navy" })).toBeInTheDocument();
    });

    it("requires color selection before adding to cart", async () => {
      const user = userEvent.setup();
      render(<ProductView slug="sunflower-sweatshirt" />);

      // Select gender, age group, and size
      await user.click(screen.getByRole("button", { name: "Unisex" }));
      await user.click(screen.getByRole("button", { name: "Adult" }));
      await user.click(screen.getByRole("button", { name: "M" }));

      // Button should say "Select options" since color isn't selected
      expect(screen.getByRole("button", { name: /select options/i })).toBeInTheDocument();

      // Select color
      await user.click(screen.getByRole("button", { name: "Black" }));

      // Now button should say "Add to cart"
      expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();
    });

    it("includes color in cart item when added", async () => {
      const user = userEvent.setup();
      render(<ProductView slug="sunflower-sweatshirt" />);

      // Complete all selections including color
      await user.click(screen.getByRole("button", { name: "Unisex" }));
      await user.click(screen.getByRole("button", { name: "Adult" }));
      await user.click(screen.getByRole("button", { name: "M" }));
      await user.click(screen.getByRole("button", { name: "Navy" }));

      // Add to cart
      await user.click(screen.getByRole("button", { name: /add to cart/i }));

      // Verify addItem was called with color in variant
      expect(mockAddItem).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: expect.objectContaining({
            color: "navy",
          }),
        }),
      );
    });

    it("does not show color selector for products without color variants", () => {
      // Use the Mandrii Trident T-Shirt which has no color variants
      const noColorProduct = mockProductBySlug("mandrii-trident-tshirt") as Product;
      mockUseGetProduct.mockReturnValue({
        data: noColorProduct,
        error: null,
        loading: false,
      });

      render(<ProductView slug="mandrii-trident-tshirt" />);

      expect(screen.queryByText("Color")).not.toBeInTheDocument();
    });
  });

  describe("add to cart", () => {
    it("shows 'Select options' when variants not fully selected", () => {
      render(<ProductView slug={testSlug} />);

      expect(screen.getByRole("button", { name: /select options/i })).toBeInTheDocument();
    });

    it("shows 'Add to cart' when all variants selected", async () => {
      const user = userEvent.setup();
      render(<ProductView slug={testSlug} />);

      // Select gender
      await user.click(screen.getByRole("button", { name: "Unisex" }));

      // Select age group
      const adultButton = screen.getByRole("button", { name: "Adult" });
      if (!adultButton.hasAttribute("disabled")) {
        await user.click(adultButton);
      }

      // Select size
      const sizeM = screen.getByRole("button", { name: "M" });
      if (!sizeM.hasAttribute("disabled")) {
        await user.click(sizeM);
      }

      // Select color (Ukrainian Heart Hoodie has color variants now)
      const colorGrey = screen.getByRole("button", { name: "Grey" });
      await user.click(colorGrey);

      expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();
    });

    it("adds item to cart when clicked", async () => {
      const user = userEvent.setup();
      render(<ProductView slug={testSlug} />);

      // Select all variants
      await user.click(screen.getByRole("button", { name: "Unisex" }));

      const adultButton = screen.getByRole("button", { name: "Adult" });
      if (!adultButton.hasAttribute("disabled")) {
        await user.click(adultButton);
      }

      const sizeM = screen.getByRole("button", { name: "M" });
      if (!sizeM.hasAttribute("disabled")) {
        await user.click(sizeM);
      }

      // Select color (Ukrainian Heart Hoodie has color variants now)
      const colorGrey = screen.getByRole("button", { name: "Grey" });
      await user.click(colorGrey);

      // Click add to cart
      const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
      await user.click(addToCartButton);

      expect(mockAddItem).toHaveBeenCalled();
    });
  });

  describe("products without variants", () => {
    const accessoryProduct = mockProductBySlug("ukrainian-embroidery-accessory") as Product;

    beforeEach(() => {
      mockUseGetProduct.mockReturnValue({
        data: accessoryProduct,
        error: null,
        loading: false,
      });
    });

    it("does not show variant selectors", () => {
      render(<ProductView slug="ukrainian-embroidery-accessory" />);

      expect(screen.queryByText("Gender")).not.toBeInTheDocument();
      expect(screen.queryByText("Size")).not.toBeInTheDocument();
    });

    it("shows Add to cart button directly", () => {
      render(<ProductView slug="ukrainian-embroidery-accessory" />);

      expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();
    });
  });

  describe("out of stock products", () => {
    const outOfStockProduct = mockProductBySlug("out-of-stock-item") as Product;

    beforeEach(() => {
      mockUseGetProduct.mockReturnValue({
        data: outOfStockProduct,
        error: null,
        loading: false,
      });
    });

    it("shows out of stock indicator", () => {
      render(<ProductView slug="out-of-stock-item" />);

      // The product name contains "Out of Stock" and so does the description
      // Use getAllByText to verify out of stock content is present
      const outOfStockElements = screen.getAllByText(/out of stock/i);
      expect(outOfStockElements.length).toBeGreaterThan(0);
    });

    it("disables add to cart button", () => {
      render(<ProductView slug="out-of-stock-item" />);

      const addToCartButton = screen.getByRole("button", { name: /add to cart|select options/i });
      expect(addToCartButton).toBeDisabled();
    });
  });

  describe("tabs", () => {
    it("renders product details tab", () => {
      render(<ProductView slug={testSlug} />);

      expect(screen.getByTestId("tabs")).toBeInTheDocument();
      expect(screen.getByTestId("tab-Product Details")).toBeInTheDocument();
    });

    it("renders shipping & returns tab", () => {
      render(<ProductView slug={testSlug} />);

      expect(screen.getByTestId("tab-Shipping & Returns")).toBeInTheDocument();
    });
  });

  describe("multi-currency handling", () => {
    const euroProduct = mockProductBySlug("euro-priced-item") as Product;

    beforeEach(() => {
      mockUseGetProduct.mockReturnValue({
        data: euroProduct,
        error: null,
        loading: false,
      });
    });

    afterEach(() => {
      // Reset cart currency after each test
      setMockCartCurrency(undefined);
    });

    it("shows error notification when adding EUR item to GBP cart", async () => {
      // Set cart to have GBP currency (simulating existing cart items)
      setMockCartCurrency("GBP");

      const user = userEvent.setup();
      render(<ProductView slug="euro-priced-item" />);

      // Click add to cart (no variants needed for accessories)
      const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
      await user.click(addToCartButton);

      // Should show error with both currencies mentioned, not add to cart
      expect(mockShowError).toHaveBeenCalledWith(
        expect.stringMatching(/EUR.*GBP|priced in EUR.*contains GBP/i),
      );
      expect(mockAddItem).not.toHaveBeenCalled();
    });

    it("shows error notification when adding GBP item to EUR cart", async () => {
      // Set cart to have EUR currency
      setMockCartCurrency("EUR");

      // Use a GBP product
      const gbpProduct = mockProductBySlug("ukrainian-embroidery-accessory") as Product;
      mockUseGetProduct.mockReturnValue({
        data: gbpProduct,
        error: null,
        loading: false,
      });

      const user = userEvent.setup();
      render(<ProductView slug="ukrainian-embroidery-accessory" />);

      const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
      await user.click(addToCartButton);

      // Should show error with both currencies mentioned
      expect(mockShowError).toHaveBeenCalledWith(
        expect.stringMatching(/GBP.*EUR|priced in GBP.*contains EUR/i),
      );
      expect(mockAddItem).not.toHaveBeenCalled();
    });

    it("allows adding item when cart is empty (no currency set)", async () => {
      // Cart currency is undefined by default (empty cart)
      setMockCartCurrency(undefined);

      const user = userEvent.setup();
      render(<ProductView slug="euro-priced-item" />);

      const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
      await user.click(addToCartButton);

      expect(mockShowError).not.toHaveBeenCalled();
      expect(mockAddItem).toHaveBeenCalled();
    });

    it("allows adding item when cart has same currency", async () => {
      // Set cart to have EUR currency (matching the product)
      setMockCartCurrency("EUR");

      const user = userEvent.setup();
      render(<ProductView slug="euro-priced-item" />);

      const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
      await user.click(addToCartButton);

      expect(mockShowError).not.toHaveBeenCalled();
      expect(mockAddItem).toHaveBeenCalled();
    });
  });

  describe("price override variants", () => {
    const priceOverrideProduct = mockProductBySlug("premium-vyshyvanka-shirt") as Product;

    beforeEach(() => {
      mockUseGetProduct.mockReturnValue({
        data: priceOverrideProduct,
        error: null,
        loading: false,
      });
    });

    it("shows base price initially (£35.00)", () => {
      render(<ProductView slug="premium-vyshyvanka-shirt" />);

      // Base price is 3500 pence = £35.00
      expect(screen.getByText("£35.00")).toBeInTheDocument();
    });

    it("shows base price for variants without price override", async () => {
      const user = userEvent.setup();
      render(<ProductView slug="premium-vyshyvanka-shirt" />);

      // Select M size (no price override)
      await user.click(screen.getByRole("button", { name: "Unisex" }));
      await user.click(screen.getByRole("button", { name: "Adult" }));
      await user.click(screen.getByRole("button", { name: "M" }));

      // Price should still be base price
      expect(screen.getByText("£35.00")).toBeInTheDocument();
    });

    it("shows price override for XL size (£40.00)", async () => {
      const user = userEvent.setup();
      render(<ProductView slug="premium-vyshyvanka-shirt" />);

      // Select XL size (has priceOverrideMinor: 4000)
      await user.click(screen.getByRole("button", { name: "Unisex" }));
      await user.click(screen.getByRole("button", { name: "Adult" }));
      await user.click(screen.getByRole("button", { name: "XL" }));

      // Price should show the override price
      expect(screen.getByText("£40.00")).toBeInTheDocument();
    });

    it("shows price override for 2XL size (£43.00)", async () => {
      const user = userEvent.setup();
      render(<ProductView slug="premium-vyshyvanka-shirt" />);

      // Select 2XL size (has priceOverrideMinor: 4300)
      await user.click(screen.getByRole("button", { name: "Unisex" }));
      await user.click(screen.getByRole("button", { name: "Adult" }));
      await user.click(screen.getByRole("button", { name: "2XL" }));

      // Price should show the higher override price
      expect(screen.getByText("£43.00")).toBeInTheDocument();
    });

    it("updates price dynamically when changing from regular to override variant", async () => {
      const user = userEvent.setup();
      render(<ProductView slug="premium-vyshyvanka-shirt" />);

      // Select M size first (no override)
      await user.click(screen.getByRole("button", { name: "Unisex" }));
      await user.click(screen.getByRole("button", { name: "Adult" }));
      await user.click(screen.getByRole("button", { name: "M" }));

      expect(screen.getByText("£35.00")).toBeInTheDocument();

      // Now switch to XL (has override)
      await user.click(screen.getByRole("button", { name: "XL" }));

      expect(screen.getByText("£40.00")).toBeInTheDocument();
    });

    it("uses override price when adding to cart", async () => {
      const user = userEvent.setup();
      render(<ProductView slug="premium-vyshyvanka-shirt" />);

      // Select XL size (has priceOverrideMinor: 4000)
      await user.click(screen.getByRole("button", { name: "Unisex" }));
      await user.click(screen.getByRole("button", { name: "Adult" }));
      await user.click(screen.getByRole("button", { name: "XL" }));

      // Add to cart
      await user.click(screen.getByRole("button", { name: /add to cart/i }));

      // Verify addItem was called with the override price
      expect(mockAddItem).toHaveBeenCalledWith(
        expect.objectContaining({
          priceMinor: 4000, // The override price, not base 3500
        }),
      );
    });
  });

  describe("low stock products", () => {
    const lowStockProduct = mockProductBySlug("limited-edition-badge") as Product;

    beforeEach(() => {
      mockUseGetProduct.mockReturnValue({
        data: lowStockProduct,
        error: null,
        loading: false,
      });
    });

    it("shows in stock status for low stock items", () => {
      render(<ProductView slug="limited-edition-badge" />);

      // Currently shows "In stock" (not specific count) for items with stock > 0
      expect(screen.getByText("In stock")).toBeInTheDocument();
    });

    it("allows adding to cart for low stock items", async () => {
      const user = userEvent.setup();
      render(<ProductView slug="limited-edition-badge" />);

      const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
      expect(addToCartButton).toBeEnabled();

      await user.click(addToCartButton);

      expect(mockAddItem).toHaveBeenCalled();
    });

    it("passes correct stock limit to cart for quantity capping", async () => {
      const user = userEvent.setup();
      render(<ProductView slug="limited-edition-badge" />);

      const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
      await user.click(addToCartButton);

      // Verify cart item includes stock limit of 2 for quantity capping
      expect(mockAddItem).toHaveBeenCalledWith(
        expect.objectContaining({
          stock: 2,
        }),
      );
    });
  });
});
