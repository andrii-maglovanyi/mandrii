import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockProducts, server, shopErrorHandlers } from "~/__mocks__/msw";
import { GetPublicProductsQuery } from "~/types/graphql.generated";

import { ShopCatalogClient } from "./ShopCatalogClient";

type GraphQLProduct = GetPublicProductsQuery["products"][number];

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

// Mock UI components that have complex dependencies
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
    Card: ({ children, className, href }: { children: React.ReactNode; className?: string; href?: string }) => (
      <a className={className} data-testid="product-card" href={href}>
        {children}
      </a>
    ),
    Pagination: ({
      count,
      index,
      onPaginate,
    }: {
      count: number;
      index: number;
      loading?: boolean;
      nextText: string;
      onPaginate: (page: number) => void;
      prevText: string;
    }) => (
      <div data-testid="pagination">
        <span>
          Page {index} of {count}
        </span>
        <button disabled={index <= 1} onClick={() => onPaginate(index - 1)}>
          Prev
        </button>
        <button disabled={index >= count} onClick={() => onPaginate(index + 1)}>
          Next
        </button>
      </div>
    ),
  };
});

// Mock useProducts hook - used for client-side filtering/pagination
const mockUsePublicProducts = vi.fn();
const mockRefetch = vi.fn();

vi.mock("~/hooks/useProducts", () => ({
  useProducts: () => ({
    usePublicProducts: mockUsePublicProducts,
  }),
}));

// Mock useListControls
const mockHandleFilter = vi.fn();
const mockHandlePaginate = vi.fn();

vi.mock("~/hooks/useListControls", () => ({
  useListControls: () => ({
    handleFilter: mockHandleFilter,
    handlePaginate: mockHandlePaginate,
    listState: { limit: 12, offset: 0, where: {} },
  }),
}));

// Mock constants
vi.mock("~/lib/constants", () => ({
  constants: {
    options: {
      PRODUCT_CATEGORIES: [
        { label: { en: "Clothing", uk: "Одяг" }, value: "clothing" },
        { label: { en: "Accessories", uk: "Аксесуари" }, value: "accessories" },
      ],
    },
    vercelBlobStorageUrl: "https://blob.vercel.com",
  },
}));

/**
 * Convert mock products to GraphQL format for SSR simulation.
 */
function toGraphQLProducts(products: typeof mockProducts): GraphQLProduct[] {
  return products.map((p) => ({
    badge: p.badge ?? null,
    category: p.category ?? "clothing",
    clothing_product_details: p.clothingType ? { clothing_type: p.clothingType } : null,
    created_at: new Date().toISOString(),
    currency: p.currency,
    description_en: p.description_en ?? null,
    description_uk: p.description_uk ?? null,
    id: p.id,
    images: p.images ?? null,
    name: p.name,
    price_minor: p.priceMinor,
    product_variants: (p.variants ?? []).map((v) => ({
      age_group: v.ageGroup,
      color: v.color ?? null,
      gender: v.gender,
      id: v.id,
      price_override_minor: v.priceOverrideMinor ?? null,
      size: v.size,
      sku: v.sku ?? null,
      stock: v.stock,
    })),
    slug: p.slug,
    status: p.status,
    stock: p.stock ?? null,
    updated_at: new Date().toISOString(),
  })) as GraphQLProduct[];
}

describe("ShopCatalogClient", () => {
  const testProducts = mockProducts.slice(0, 3);
  const graphqlProducts = toGraphQLProducts(testProducts);

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for when user hasn't interacted yet
    mockUsePublicProducts.mockReturnValue({
      count: 0,
      data: [],
      error: null,
      loading: false,
      refetch: mockRefetch,
    });
  });

  describe("SSR initial render - no loading state", () => {
    it("renders products immediately without loading state", () => {
      render(<ShopCatalogClient initialCount={testProducts.length} initialProducts={graphqlProducts} />);

      // Should NOT show loading indicator on initial render
      expect(screen.queryByTestId("animated-ellipsis")).not.toBeInTheDocument();

      // Should show products immediately
      const productCards = screen.getAllByTestId("product-card");
      expect(productCards).toHaveLength(testProducts.length);
    });

    it("displays product names from SSR data immediately", () => {
      render(<ShopCatalogClient initialCount={testProducts.length} initialProducts={graphqlProducts} />);

      expect(screen.getByText(testProducts[0].name)).toBeInTheDocument();
      expect(screen.getByText(testProducts[1].name)).toBeInTheDocument();
    });

    it("displays formatted prices immediately", () => {
      render(<ShopCatalogClient initialCount={testProducts.length} initialProducts={graphqlProducts} />);

      // First product is £25.00 (2500 pence GBP)
      expect(screen.getByText("£25.00")).toBeInTheDocument();
    });

    it("displays results count from SSR data", () => {
      render(<ShopCatalogClient initialCount={testProducts.length} initialProducts={graphqlProducts} />);

      expect(screen.getByText((content) => content.includes("Showing"))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes("items"))).toBeInTheDocument();
    });

    it("does not fetch from API on initial render", () => {
      render(<ShopCatalogClient initialCount={testProducts.length} initialProducts={graphqlProducts} />);

      // usePublicProducts should be called with limit: 0 to skip the query
      expect(mockUsePublicProducts).toHaveBeenCalledWith({ limit: 0 });
    });
  });

  describe("stock badge behavior", () => {
    it("shows 'Sold out' badge for product with variants that all have stock = 0", () => {
      const outOfStockProduct = mockProducts.find((p) => p.slug === "out-of-stock-item");
      const graphqlOutOfStock = toGraphQLProducts([outOfStockProduct!]);

      render(<ShopCatalogClient initialCount={1} initialProducts={graphqlOutOfStock} />);

      expect(screen.getByText("Sold out")).toBeInTheDocument();
    });

    it("does NOT show 'Sold out' for product without variants but with stock > 0", () => {
      const accessoryProduct = mockProducts.find((p) => p.slug === "ukrainian-embroidery-accessory");
      const graphqlAccessory = toGraphQLProducts([accessoryProduct!]);

      render(<ShopCatalogClient initialCount={1} initialProducts={graphqlAccessory} />);

      expect(screen.queryByText("Sold out")).not.toBeInTheDocument();
    });

    it("shows 'Sold out' for product without variants and stock = 0", () => {
      const noStockProduct = {
        ...mockProducts.find((p) => p.slug === "ukrainian-embroidery-accessory")!,
        id: "test-no-stock",
        stock: 0,
        variants: [],
      };
      const graphqlNoStock = toGraphQLProducts([noStockProduct]);

      render(<ShopCatalogClient initialCount={1} initialProducts={graphqlNoStock} />);

      expect(screen.getByText("Sold out")).toBeInTheDocument();
    });

    it("does NOT show 'Sold out' for product with variants that have stock > 0", () => {
      const inStockProduct = mockProducts.find((p) => p.slug === "mandrii-trident-tshirt");
      const graphqlInStock = toGraphQLProducts([inStockProduct!]);

      render(<ShopCatalogClient initialCount={1} initialProducts={graphqlInStock} />);

      expect(screen.queryByText("Sold out")).not.toBeInTheDocument();
    });
  });

  describe("rendering", () => {
    it("renders the page title", () => {
      render(<ShopCatalogClient initialCount={testProducts.length} initialProducts={graphqlProducts} />);

      expect(screen.getByRole("heading", { name: "Shop" })).toBeInTheDocument();
    });

    it("renders breadcrumbs", () => {
      render(<ShopCatalogClient initialCount={testProducts.length} initialProducts={graphqlProducts} />);

      expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    it("renders search input", () => {
      render(<ShopCatalogClient initialCount={testProducts.length} initialProducts={graphqlProducts} />);

      expect(screen.getByPlaceholderText("Search products by name...")).toBeInTheDocument();
    });

    it("renders category select", () => {
      render(<ShopCatalogClient initialCount={testProducts.length} initialProducts={graphqlProducts} />);

      const select = screen.getByTestId("select");
      expect(select).toBeInTheDocument();
      expect(screen.getByText("All categories")).toBeInTheDocument();
    });

    it("renders product cards for each product", () => {
      render(<ShopCatalogClient initialCount={testProducts.length} initialProducts={graphqlProducts} />);

      const productCards = screen.getAllByTestId("product-card");
      expect(productCards).toHaveLength(testProducts.length);
    });
  });

  describe("product card features", () => {
    it("links to product detail page", () => {
      render(<ShopCatalogClient initialCount={testProducts.length} initialProducts={graphqlProducts} />);

      const productCards = screen.getAllByTestId("product-card");
      expect(productCards[0]).toHaveAttribute("href", `/shop/${testProducts[0].slug}`);
    });

    it("renders product images when available", () => {
      render(<ShopCatalogClient initialCount={testProducts.length} initialProducts={graphqlProducts} />);

      const images = screen.getAllByRole("img");
      expect(images.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("search functionality triggers client-side fetch", () => {
    it("allows typing in search input", async () => {
      const user = userEvent.setup();
      render(<ShopCatalogClient initialCount={testProducts.length} initialProducts={graphqlProducts} />);

      const searchInput = screen.getByPlaceholderText("Search products by name...");
      await user.type(searchInput, "hoodie");

      expect(searchInput).toHaveValue("hoodie");
    });

    it("triggers API fetch when user searches", async () => {
      const user = userEvent.setup();

      // Mock the API response for when user interacts
      mockUsePublicProducts.mockReturnValue({
        count: 1,
        data: [testProducts[0]],
        error: null,
        loading: false,
        refetch: mockRefetch,
      });

      render(<ShopCatalogClient initialCount={testProducts.length} initialProducts={graphqlProducts} />);

      const searchInput = screen.getByPlaceholderText("Search products by name...");
      await user.type(searchInput, "t");

      // After interaction, usePublicProducts should be called with the listState
      expect(mockUsePublicProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 12,
          offset: 0,
        }),
      );
    });
  });

  describe("loading state after interaction", () => {
    it("shows loading indicator when fetching after user interaction", async () => {
      const user = userEvent.setup();

      mockUsePublicProducts.mockReturnValue({
        count: 0,
        data: [],
        error: null,
        loading: true,
        refetch: mockRefetch,
      });

      render(<ShopCatalogClient initialCount={testProducts.length} initialProducts={graphqlProducts} />);

      // Initially no loading state
      expect(screen.queryByTestId("animated-ellipsis")).not.toBeInTheDocument();

      // Type to trigger interaction
      const searchInput = screen.getByPlaceholderText("Search products by name...");
      await user.type(searchInput, "t");

      // Now should show loading
      expect(screen.getByTestId("animated-ellipsis")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows empty state when no products in SSR data", () => {
      render(<ShopCatalogClient initialCount={0} initialProducts={[]} />);

      expect(screen.getByText("No products found")).toBeInTheDocument();
      expect(screen.getByText("Try adjusting your filters or search terms")).toBeInTheDocument();
    });
  });

  describe("error state after interaction", () => {
    it("shows error message when fetch fails after user interaction", async () => {
      const user = userEvent.setup();
      server.use(shopErrorHandlers.networkError);

      mockUsePublicProducts.mockReturnValue({
        count: 0,
        data: [],
        error: new Error("Network error"),
        loading: false,
        refetch: mockRefetch,
      });

      render(<ShopCatalogClient initialCount={testProducts.length} initialProducts={graphqlProducts} />);

      // Trigger interaction
      const searchInput = screen.getByPlaceholderText("Search products by name...");
      await user.type(searchInput, "t");

      expect(screen.getByText("Failed to load products")).toBeInTheDocument();
      expect(screen.getByText("There was a problem fetching the catalog.")).toBeInTheDocument();
    });

    it("shows retry button on error", async () => {
      const user = userEvent.setup();

      mockUsePublicProducts.mockReturnValue({
        count: 0,
        data: [],
        error: new Error("Network error"),
        loading: false,
        refetch: mockRefetch,
      });

      render(<ShopCatalogClient initialCount={testProducts.length} initialProducts={graphqlProducts} />);

      // Trigger interaction
      const searchInput = screen.getByPlaceholderText("Search products by name...");
      await user.type(searchInput, "t");

      expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    });

    it("calls refetch when retry button is clicked", async () => {
      const user = userEvent.setup();

      mockUsePublicProducts.mockReturnValue({
        count: 0,
        data: [],
        error: new Error("Network error"),
        loading: false,
        refetch: mockRefetch,
      });

      render(<ShopCatalogClient initialCount={testProducts.length} initialProducts={graphqlProducts} />);

      // Trigger interaction
      const searchInput = screen.getByPlaceholderText("Search products by name...");
      await user.type(searchInput, "t");

      const retryButton = screen.getByRole("button", { name: /try again/i });
      await user.click(retryButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("pagination", () => {
    it("renders pagination component", () => {
      render(<ShopCatalogClient initialCount={testProducts.length} initialProducts={graphqlProducts} />);

      expect(screen.getByTestId("pagination")).toBeInTheDocument();
    });
  });
});
