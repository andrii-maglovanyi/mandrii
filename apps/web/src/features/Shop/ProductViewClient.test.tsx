import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockProductBySlug, mockProducts, server, shopErrorHandlers } from "~/__mocks__/msw";
import { GetProductBySlugQuery } from "~/types/graphql.generated";

import { ProductViewClient } from "./ProductViewClient";

type GraphQLProduct = GetProductBySlugQuery["products"][number];

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
}));

// Mock cart context - configurable per test
const mockAddItem = vi.fn().mockReturnValue({ success: true });
let mockCartCurrency: string | undefined = undefined;
let mockCartItems: Array<{ id: string; quantity: number }> = [];

vi.mock("~/contexts/CartContext", () => ({
  getCartItemId: (productId: string, variant?: unknown) =>
    variant ? `${productId}-${JSON.stringify(variant)}` : productId,
  useCart: () => ({
    addItem: mockAddItem,
    currency: mockCartCurrency,
    items: mockCartItems,
  }),
}));

// Helper to set cart currency for tests
const setMockCartCurrency = (currency: string | undefined) => {
  mockCartCurrency = currency;
};

// Helper to set cart items for tests
const setMockCartItems = (items: Array<{ id: string; quantity: number }>) => {
  mockCartItems = items;
};

// Mock notifications hook
const mockShowError = vi.fn();
vi.mock("~/hooks/useNotifications", () => ({
  useNotifications: () => ({
    showError: mockShowError,
    showSuccess: vi.fn(),
  }),
}));

// Mock useProducts hook - return SSR data only (no client refetch in tests)
vi.mock("~/hooks/useProducts", async () => {
  const actual = await vi.importActual("~/hooks/useProducts");
  return {
    ...actual,
    useProducts: () => ({
      useGetProduct: () => ({
        data: undefined, // No client data - tests use SSR initialProduct
        error: undefined,
        loading: false,
      }),
      usePublicProducts: vi.fn(),
    }),
  };
});

/**
 * Convert mock product to GraphQL format for SSR simulation.
 */
function toGraphQLProduct(product: ReturnType<typeof mockProductBySlug>): GraphQLProduct {
  if (!product) throw new Error("Product not found");
  return {
    badge: product.badge ?? null,
    category: product.category ?? "clothing",
    clothing_product_details: product.clothingType ? { clothing_type: product.clothingType } : null,
    created_at: new Date().toISOString(),
    currency: product.currency,
    description_en: product.description_en ?? null,
    description_uk: product.description_uk ?? null,
    id: product.id,
    images: product.images ?? null,
    name: product.name,
    price_minor: product.priceMinor,
    product_variants: (product.variants ?? []).map((v) => ({
      age_group: v.ageGroup,
      color: v.color ?? null,
      gender: v.gender,
      id: v.id,
      price_override_minor: v.priceOverrideMinor ?? null,
      size: v.size,
      sku: v.sku ?? null,
      stock: v.stock,
    })),
    slug: product.slug,
    status: product.status,
    stock: product.stock ?? null,
    updated_at: new Date().toISOString(),
  } as GraphQLProduct;
}

describe("ProductViewClient", () => {
  // Use the Ukrainian Heart Hoodie from MSW mock data
  const testProduct = mockProductBySlug("ukrainian-heart-hoodie");
  const testGraphQLProduct = toGraphQLProduct(testProduct);
  const testSlug = "ukrainian-heart-hoodie";

  beforeEach(() => {
    vi.clearAllMocks();
    setMockCartCurrency(undefined);
    setMockCartItems([]);
  });

  describe("SSR initial render - no loading state", () => {
    it("renders product immediately without loading state", () => {
      render(<ProductViewClient initialProduct={testGraphQLProduct} slug={testSlug} />);

      // Should NOT show loading indicator
      expect(screen.queryByTestId("animated-ellipsis")).not.toBeInTheDocument();

      // Should show product name immediately
      expect(screen.getByRole("heading", { name: testProduct!.name })).toBeInTheDocument();
    });

    it("displays product price immediately", () => {
      render(<ProductViewClient initialProduct={testGraphQLProduct} slug={testSlug} />);

      // £45.00 for 4500 pence GBP
      expect(screen.getByText("£45.00")).toBeInTheDocument();
    });

    it("displays breadcrumbs with product name immediately", () => {
      render(<ProductViewClient initialProduct={testGraphQLProduct} slug={testSlug} />);

      const breadcrumbs = screen.getByTestId("breadcrumbs");
      expect(breadcrumbs).toBeInTheDocument();
      expect(breadcrumbs).toHaveTextContent("Home");
      expect(breadcrumbs).toHaveTextContent("Shop");
      expect(breadcrumbs).toHaveTextContent(testProduct!.name);
    });

    it("uses SSR data when client fetch returns undefined", () => {
      // The mock returns undefined for client data, so SSR data should be used
      render(<ProductViewClient initialProduct={testGraphQLProduct} slug={testSlug} />);

      // Should display SSR product price
      expect(screen.getByText("£45.00")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: testProduct!.name })).toBeInTheDocument();
    });
  });

  describe("rendering", () => {
    it("renders product category", () => {
      render(<ProductViewClient initialProduct={testGraphQLProduct} slug={testSlug} />);

      const categoryElements = screen.getAllByText("clothing");
      expect(categoryElements.length).toBeGreaterThanOrEqual(1);
    });

    it("renders image carousel with product images", () => {
      render(<ProductViewClient initialProduct={testGraphQLProduct} slug={testSlug} />);

      const carousel = screen.getByTestId("image-carousel");
      expect(carousel).toBeInTheDocument();

      const images = carousel.querySelectorAll("img");
      expect(images.length).toBe(testProduct!.images?.length || 0);
    });

    it("renders product description", () => {
      render(<ProductViewClient initialProduct={testGraphQLProduct} slug={testSlug} />);

      if (testProduct!.description_en) {
        expect(screen.getByText(testProduct!.description_en)).toBeInTheDocument();
      }
    });
  });

  describe("not found state", () => {
    it("shows empty state when product is null", () => {
      render(<ProductViewClient initialProduct={null} slug="non-existent-product" />);

      expect(screen.getByText("Product not found")).toBeInTheDocument();
    });
  });

  describe("variant selection", () => {
    it("renders variant selectors for products with variants", () => {
      render(<ProductViewClient initialProduct={testGraphQLProduct} slug={testSlug} />);

      expect(screen.getByText("Age group")).toBeInTheDocument();
      expect(screen.getByText("Size")).toBeInTheDocument();
    });

    it("shows age group options", () => {
      render(<ProductViewClient initialProduct={testGraphQLProduct} slug={testSlug} />);

      // Ukrainian Heart Hoodie has adult and kids variants
      expect(screen.getByRole("button", { name: "Adult" })).toBeInTheDocument();
    });

    it("enables size selector after selecting age group and gender", async () => {
      const user = userEvent.setup();
      render(<ProductViewClient initialProduct={testGraphQLProduct} slug={testSlug} />);

      // Select age group first
      await user.click(screen.getByRole("button", { name: "Adult" }));

      // Select gender
      const unisexButton = screen.getByRole("button", { name: "Unisex" });
      if (!unisexButton.hasAttribute("disabled")) {
        await user.click(unisexButton);
      }

      // Size options should be available
      const sizeButtons = screen.getAllByRole("button", { name: /^[SMLX]+$|^\d+-\d+y$/ });
      expect(sizeButtons.length).toBeGreaterThan(0);
    });
  });

  describe("color selection", () => {
    // Use the Sunflower Sweatshirt which has color variants (black, navy)
    const colorProduct = mockProductBySlug("sunflower-sweatshirt");
    const colorGraphQLProduct = toGraphQLProduct(colorProduct);

    it("shows color selector for products with color variants", async () => {
      const user = userEvent.setup();
      render(<ProductViewClient initialProduct={colorGraphQLProduct} slug="sunflower-sweatshirt" />);

      // Select age group first
      await user.click(screen.getByRole("button", { name: "Adult" }));

      // Select gender (unisex for this product)
      await user.click(screen.getByRole("button", { name: "Unisex" }));

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
      render(<ProductViewClient initialProduct={colorGraphQLProduct} slug="sunflower-sweatshirt" />);

      // Select age group, gender, and size
      await user.click(screen.getByRole("button", { name: "Adult" }));
      await user.click(screen.getByRole("button", { name: "Unisex" }));
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
      render(<ProductViewClient initialProduct={colorGraphQLProduct} slug="sunflower-sweatshirt" />);

      // Complete all selections including color
      await user.click(screen.getByRole("button", { name: "Adult" }));
      await user.click(screen.getByRole("button", { name: "Unisex" }));
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
      const noColorProduct = mockProductBySlug("mandrii-trident-tshirt");
      const noColorGraphQL = toGraphQLProduct(noColorProduct);

      render(<ProductViewClient initialProduct={noColorGraphQL} slug="mandrii-trident-tshirt" />);

      expect(screen.queryByText("Color")).not.toBeInTheDocument();
    });
  });

  describe("add to cart", () => {
    it("shows 'Select options' when variants not fully selected", () => {
      render(<ProductViewClient initialProduct={testGraphQLProduct} slug={testSlug} />);

      expect(screen.getByRole("button", { name: /select options/i })).toBeInTheDocument();
    });

    it("shows 'Add to cart' when all variants selected", async () => {
      const user = userEvent.setup();
      render(<ProductViewClient initialProduct={testGraphQLProduct} slug={testSlug} />);

      // Select age group first
      await user.click(screen.getByRole("button", { name: "Adult" }));

      // Select gender
      const unisexButton = screen.getByRole("button", { name: "Unisex" });
      if (!unisexButton.hasAttribute("disabled")) {
        await user.click(unisexButton);
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
      render(<ProductViewClient initialProduct={testGraphQLProduct} slug={testSlug} />);

      // Select all variants
      await user.click(screen.getByRole("button", { name: "Adult" }));

      const unisexButton = screen.getByRole("button", { name: "Unisex" });
      if (!unisexButton.hasAttribute("disabled")) {
        await user.click(unisexButton);
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
    const accessoryProduct = mockProductBySlug("ukrainian-embroidery-accessory");
    const accessoryGraphQL = toGraphQLProduct(accessoryProduct);

    it("does not show variant selectors", () => {
      render(<ProductViewClient initialProduct={accessoryGraphQL} slug="ukrainian-embroidery-accessory" />);

      expect(screen.queryByText("Age group")).not.toBeInTheDocument();
      expect(screen.queryByText("Size")).not.toBeInTheDocument();
    });

    it("shows Add to cart button directly", () => {
      render(<ProductViewClient initialProduct={accessoryGraphQL} slug="ukrainian-embroidery-accessory" />);

      expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();
    });
  });

  describe("out of stock products", () => {
    const outOfStockProduct = mockProductBySlug("out-of-stock-item");
    const outOfStockGraphQL = toGraphQLProduct(outOfStockProduct);

    it("shows out of stock indicator", () => {
      render(<ProductViewClient initialProduct={outOfStockGraphQL} slug="out-of-stock-item" />);

      const outOfStockElements = screen.getAllByText(/out of stock/i);
      expect(outOfStockElements.length).toBeGreaterThan(0);
    });

    it("disables add to cart button", () => {
      render(<ProductViewClient initialProduct={outOfStockGraphQL} slug="out-of-stock-item" />);

      const addToCartButton = screen.getByRole("button", { name: /add to cart|select options/i });
      expect(addToCartButton).toBeDisabled();
    });
  });

  describe("tabs", () => {
    it("renders shipping info tab", () => {
      render(<ProductViewClient initialProduct={testGraphQLProduct} slug={testSlug} />);

      expect(screen.getByTestId("tabs")).toBeInTheDocument();
      expect(screen.getByTestId("tab-Shipping info")).toBeInTheDocument();
    });

    it("renders returns policy tab", () => {
      render(<ProductViewClient initialProduct={testGraphQLProduct} slug={testSlug} />);

      expect(screen.getByTestId("tab-Returns policy")).toBeInTheDocument();
    });
  });

  describe("multi-currency handling", () => {
    const euroProduct = mockProductBySlug("euro-priced-item");
    const euroGraphQL = toGraphQLProduct(euroProduct);

    afterEach(() => {
      setMockCartCurrency(undefined);
    });

    it("shows error notification when adding EUR item to GBP cart", async () => {
      setMockCartCurrency("GBP");

      const user = userEvent.setup();
      render(<ProductViewClient initialProduct={euroGraphQL} slug="euro-priced-item" />);

      const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
      await user.click(addToCartButton);

      expect(mockShowError).toHaveBeenCalledWith(expect.stringMatching(/EUR.*GBP|priced in EUR.*contains GBP/i));
      expect(mockAddItem).not.toHaveBeenCalled();
    });

    it("shows error notification when adding GBP item to EUR cart", async () => {
      setMockCartCurrency("EUR");

      const gbpProduct = mockProductBySlug("ukrainian-embroidery-accessory");
      const gbpGraphQL = toGraphQLProduct(gbpProduct);

      const user = userEvent.setup();
      render(<ProductViewClient initialProduct={gbpGraphQL} slug="ukrainian-embroidery-accessory" />);

      const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
      await user.click(addToCartButton);

      expect(mockShowError).toHaveBeenCalledWith(expect.stringMatching(/GBP.*EUR|priced in GBP.*contains EUR/i));
      expect(mockAddItem).not.toHaveBeenCalled();
    });

    it("allows adding item when cart is empty (no currency set)", async () => {
      setMockCartCurrency(undefined);

      const user = userEvent.setup();
      render(<ProductViewClient initialProduct={euroGraphQL} slug="euro-priced-item" />);

      const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
      await user.click(addToCartButton);

      expect(mockShowError).not.toHaveBeenCalled();
      expect(mockAddItem).toHaveBeenCalled();
    });

    it("allows adding item when cart has same currency", async () => {
      setMockCartCurrency("EUR");

      const user = userEvent.setup();
      render(<ProductViewClient initialProduct={euroGraphQL} slug="euro-priced-item" />);

      const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
      await user.click(addToCartButton);

      expect(mockShowError).not.toHaveBeenCalled();
      expect(mockAddItem).toHaveBeenCalled();
    });
  });

  describe("price override variants", () => {
    const priceOverrideProduct = mockProductBySlug("premium-vyshyvanka-shirt");
    const priceOverrideGraphQL = toGraphQLProduct(priceOverrideProduct);

    it("shows base price initially (£35.00)", () => {
      render(<ProductViewClient initialProduct={priceOverrideGraphQL} slug="premium-vyshyvanka-shirt" />);

      expect(screen.getByText("£35.00")).toBeInTheDocument();
    });

    it("shows base price for variants without price override", async () => {
      const user = userEvent.setup();
      render(<ProductViewClient initialProduct={priceOverrideGraphQL} slug="premium-vyshyvanka-shirt" />);

      await user.click(screen.getByRole("button", { name: "Adult" }));
      await user.click(screen.getByRole("button", { name: "Unisex" }));
      await user.click(screen.getByRole("button", { name: "M" }));

      expect(screen.getByText("£35.00")).toBeInTheDocument();
    });

    it("shows price override for XL size (£40.00)", async () => {
      const user = userEvent.setup();
      render(<ProductViewClient initialProduct={priceOverrideGraphQL} slug="premium-vyshyvanka-shirt" />);

      await user.click(screen.getByRole("button", { name: "Adult" }));
      await user.click(screen.getByRole("button", { name: "Unisex" }));
      await user.click(screen.getByRole("button", { name: "XL" }));

      expect(screen.getByText("£40.00")).toBeInTheDocument();
    });

    it("shows price override for 2XL size (£43.00)", async () => {
      const user = userEvent.setup();
      render(<ProductViewClient initialProduct={priceOverrideGraphQL} slug="premium-vyshyvanka-shirt" />);

      await user.click(screen.getByRole("button", { name: "Adult" }));
      await user.click(screen.getByRole("button", { name: "Unisex" }));
      await user.click(screen.getByRole("button", { name: "2XL" }));

      expect(screen.getByText("£43.00")).toBeInTheDocument();
    });

    it("updates price dynamically when changing from regular to override variant", async () => {
      const user = userEvent.setup();
      render(<ProductViewClient initialProduct={priceOverrideGraphQL} slug="premium-vyshyvanka-shirt" />);

      await user.click(screen.getByRole("button", { name: "Adult" }));
      await user.click(screen.getByRole("button", { name: "Unisex" }));
      await user.click(screen.getByRole("button", { name: "M" }));

      expect(screen.getByText("£35.00")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "XL" }));

      expect(screen.getByText("£40.00")).toBeInTheDocument();
    });

    it("uses override price when adding to cart", async () => {
      const user = userEvent.setup();
      render(<ProductViewClient initialProduct={priceOverrideGraphQL} slug="premium-vyshyvanka-shirt" />);

      await user.click(screen.getByRole("button", { name: "Adult" }));
      await user.click(screen.getByRole("button", { name: "Unisex" }));
      await user.click(screen.getByRole("button", { name: "XL" }));

      await user.click(screen.getByRole("button", { name: /add to cart/i }));

      expect(mockAddItem).toHaveBeenCalledWith(
        expect.objectContaining({
          priceMinor: 4000,
        }),
      );
    });
  });

  describe("low stock products", () => {
    const lowStockProduct = mockProductBySlug("limited-edition-badge");
    const lowStockGraphQL = toGraphQLProduct(lowStockProduct);

    it("shows in stock status for low stock items", () => {
      render(<ProductViewClient initialProduct={lowStockGraphQL} slug="limited-edition-badge" />);

      expect(screen.getByText("In stock")).toBeInTheDocument();
    });

    it("allows adding to cart for low stock items", async () => {
      const user = userEvent.setup();
      render(<ProductViewClient initialProduct={lowStockGraphQL} slug="limited-edition-badge" />);

      const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
      expect(addToCartButton).toBeEnabled();

      await user.click(addToCartButton);

      expect(mockAddItem).toHaveBeenCalled();
    });

    it("passes correct stock limit to cart for quantity capping", async () => {
      const user = userEvent.setup();
      render(<ProductViewClient initialProduct={lowStockGraphQL} slug="limited-edition-badge" />);

      const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
      await user.click(addToCartButton);

      expect(mockAddItem).toHaveBeenCalledWith(
        expect.objectContaining({
          stock: 2,
        }),
      );
    });
  });
});
