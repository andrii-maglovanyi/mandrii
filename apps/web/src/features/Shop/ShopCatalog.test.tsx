import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { server, shopErrorHandlers, mockProducts } from "~/__mocks__/msw";

import { ShopCatalog } from "./ShopCatalog";

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

// Mock useProducts hook - still needed since component uses Apollo Client hooks
const mockUsePublicProducts = vi.fn();
const mockRefetch = vi.fn();

vi.mock("~/hooks/useProducts", () => ({
  useProducts: () => ({
    usePublicProducts: mockUsePublicProducts,
  }),
}));

// Mock useListControls
vi.mock("~/hooks/useListControls", () => ({
  useListControls: () => ({
    handleFilter: vi.fn(),
    handlePaginate: vi.fn(),
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
  },
}));

describe("ShopCatalog", () => {
  // Use mock data from MSW
  const testProducts = mockProducts.slice(0, 3);

  beforeEach(() => {
    vi.clearAllMocks();
    // Default to returning products from MSW mock data
    mockUsePublicProducts.mockReturnValue({
      count: testProducts.length,
      data: testProducts,
      error: null,
      loading: false,
      refetch: mockRefetch,
    });
  });

  describe("stock badge behavior", () => {
    it("shows 'Sold out' badge for product with variants that all have stock = 0", () => {
      const outOfStockProduct = mockProducts.find((p) => p.slug === "out-of-stock-item");
      mockUsePublicProducts.mockReturnValue({
        count: 1,
        data: [outOfStockProduct],
        error: null,
        loading: false,
        refetch: mockRefetch,
      });

      render(<ShopCatalog />);

      expect(screen.getByText("Sold out")).toBeInTheDocument();
    });

    it("does NOT show 'Sold out' for product without variants but with stock > 0", () => {
      // Ukrainian Embroidery Accessory has no variants but stock: 25
      const accessoryProduct = mockProducts.find((p) => p.slug === "ukrainian-embroidery-accessory");
      mockUsePublicProducts.mockReturnValue({
        count: 1,
        data: [accessoryProduct],
        error: null,
        loading: false,
        refetch: mockRefetch,
      });

      render(<ShopCatalog />);

      expect(screen.queryByText("Sold out")).not.toBeInTheDocument();
    });

    it("shows 'Sold out' for product without variants and stock = 0", () => {
      // Create a product without variants and stock = 0
      const noStockProduct = {
        ...mockProducts.find((p) => p.slug === "ukrainian-embroidery-accessory")!,
        id: "test-no-stock",
        stock: 0,
        variants: [],
      };
      mockUsePublicProducts.mockReturnValue({
        count: 1,
        data: [noStockProduct],
        error: null,
        loading: false,
        refetch: mockRefetch,
      });

      render(<ShopCatalog />);

      expect(screen.getByText("Sold out")).toBeInTheDocument();
    });

    it("does NOT show 'Sold out' for product with variants that have stock > 0", () => {
      // Mandrii Trident T-Shirt has variants with stock
      const inStockProduct = mockProducts.find((p) => p.slug === "mandrii-trident-tshirt");
      mockUsePublicProducts.mockReturnValue({
        count: 1,
        data: [inStockProduct],
        error: null,
        loading: false,
        refetch: mockRefetch,
      });

      render(<ShopCatalog />);

      expect(screen.queryByText("Sold out")).not.toBeInTheDocument();
    });

    it("uses variant stock sum correctly for mixed stock variants", () => {
      // Create a product where only some variants have stock
      const mixedStockProduct = {
        id: "test-mixed",
        name: "Mixed Stock Product",
        slug: "mixed-stock",
        priceMinor: 1000,
        currency: "GBP",
        status: "ACTIVE",
        images: [],
        variants: [
          { id: "v1", gender: "unisex" as const, ageGroup: "adult" as const, size: "s" as const, stock: 0 },
          { id: "v2", gender: "unisex" as const, ageGroup: "adult" as const, size: "m" as const, stock: 5 },
          { id: "v3", gender: "unisex" as const, ageGroup: "adult" as const, size: "l" as const, stock: 0 },
        ],
      };
      mockUsePublicProducts.mockReturnValue({
        count: 1,
        data: [mixedStockProduct],
        error: null,
        loading: false,
        refetch: mockRefetch,
      });

      render(<ShopCatalog />);

      // Total stock is 5, so should NOT be sold out
      expect(screen.queryByText("Sold out")).not.toBeInTheDocument();
    });
  });

  describe("rendering", () => {
    it("renders the page title", () => {
      render(<ShopCatalog />);

      expect(screen.getByRole("heading", { name: "Shop" })).toBeInTheDocument();
    });

    it("renders breadcrumbs", () => {
      render(<ShopCatalog />);

      expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    it("renders search input", () => {
      render(<ShopCatalog />);

      expect(screen.getByPlaceholderText("Search products by name...")).toBeInTheDocument();
    });

    it("renders category select", () => {
      render(<ShopCatalog />);

      const select = screen.getByTestId("select");
      expect(select).toBeInTheDocument();
      expect(screen.getByText("All categories")).toBeInTheDocument();
    });

    it("renders product cards for each product", () => {
      render(<ShopCatalog />);

      const productCards = screen.getAllByTestId("product-card");
      expect(productCards).toHaveLength(testProducts.length);
    });

    it("displays product names from mock data", () => {
      render(<ShopCatalog />);

      // Uses product names from MSW mock data
      expect(screen.getByText(testProducts[0].name)).toBeInTheDocument();
      expect(screen.getByText(testProducts[1].name)).toBeInTheDocument();
    });

    it("displays formatted prices", () => {
      render(<ShopCatalog />);

      // First product is £25.00 (2500 pence GBP)
      expect(screen.getByText("£25.00")).toBeInTheDocument();
    });

    it("displays results count", () => {
      render(<ShopCatalog />);

      expect(screen.getByText((content) => content.includes("Showing"))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes("items"))).toBeInTheDocument();
    });
  });

  describe("product card features", () => {
    it("links to product detail page", () => {
      render(<ShopCatalog />);

      const productCards = screen.getAllByTestId("product-card");
      expect(productCards[0]).toHaveAttribute("href", `/shop/${testProducts[0].slug}`);
    });

    it("renders product images when available", () => {
      render(<ShopCatalog />);

      const images = screen.getAllByRole("img");
      expect(images.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("search functionality", () => {
    it("allows typing in search input", async () => {
      const user = userEvent.setup();
      render(<ShopCatalog />);

      const searchInput = screen.getByPlaceholderText("Search products by name...");
      await user.type(searchInput, "hoodie");

      expect(searchInput).toHaveValue("hoodie");
    });
  });

  describe("loading state", () => {
    it("shows loading indicator when loading", () => {
      mockUsePublicProducts.mockReturnValue({
        count: 0,
        data: [],
        error: null,
        loading: true,
        refetch: mockRefetch,
      });

      render(<ShopCatalog />);

      expect(screen.getByTestId("animated-ellipsis")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows empty state when no products found", () => {
      // Use MSW error handler for empty results scenario
      server.use(shopErrorHandlers.emptyResults);

      mockUsePublicProducts.mockReturnValue({
        count: 0,
        data: [],
        error: null,
        loading: false,
        refetch: mockRefetch,
      });

      render(<ShopCatalog />);

      expect(screen.getByText("No products found")).toBeInTheDocument();
      expect(screen.getByText("Try adjusting your filters or search terms")).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("shows error message when fetch fails", () => {
      // Use MSW error handler for network error scenario
      server.use(shopErrorHandlers.networkError);

      mockUsePublicProducts.mockReturnValue({
        count: 0,
        data: [],
        error: new Error("Network error"),
        loading: false,
        refetch: mockRefetch,
      });

      render(<ShopCatalog />);

      expect(screen.getByText("Failed to load products")).toBeInTheDocument();
      expect(screen.getByText("There was a problem fetching the catalog.")).toBeInTheDocument();
    });

    it("shows retry button on error", () => {
      mockUsePublicProducts.mockReturnValue({
        count: 0,
        data: [],
        error: new Error("Network error"),
        loading: false,
        refetch: mockRefetch,
      });

      render(<ShopCatalog />);

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

      render(<ShopCatalog />);

      const retryButton = screen.getByRole("button", { name: /try again/i });
      await user.click(retryButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("pagination", () => {
    it("renders pagination component", () => {
      render(<ShopCatalog />);

      expect(screen.getByTestId("pagination")).toBeInTheDocument();
    });
  });
});
