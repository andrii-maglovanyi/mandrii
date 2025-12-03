import { describe, expect, it } from "vitest";

import { applyWhereClause, mockProducts } from "~/__mocks__/msw/data/shop";
import { Product } from "./useProducts";

describe("useProducts", () => {
  describe("MSW filter parsing", () => {
    it("returns all products when no filter is applied", () => {
      const result = applyWhereClause([...mockProducts], {});
      expect(result.length).toBe(mockProducts.length);
    });

    it("filters by status with _and structure (as used by usePublicProducts)", () => {
      const where = {
        _and: [{ status: { _eq: "ACTIVE" } }],
      };

      const result = applyWhereClause([...mockProducts], where);
      expect(result.every((p: Product) => p.status === "ACTIVE")).toBe(true);
    });

    it("filters by category within _and structure", () => {
      const where = {
        _and: [{ status: { _eq: "ACTIVE" } }, { category: { _eq: "clothing" } }],
      };

      const result = applyWhereClause([...mockProducts], where);
      expect(result.every((p: Product) => p.category === "clothing")).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("filters by name search with _or structure", () => {
      const where = {
        _and: [
          { status: { _eq: "ACTIVE" } },
          {
            _or: [{ name: { _ilike: "%hoodie%" } }, { description_en: { _ilike: "%hoodie%" } }],
          },
        ],
      };

      const result = applyWhereClause([...mockProducts], where);
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.every(
          (p: Product) =>
            p.name.toLowerCase().includes("hoodie") || (p.description_en?.toLowerCase().includes("hoodie") ?? false),
        ),
      ).toBe(true);
    });

    it("combines category and search filters", () => {
      const where = {
        _and: [
          { status: { _eq: "ACTIVE" } },
          { category: { _eq: "clothing" } },
          {
            _or: [{ name: { _ilike: "%shirt%" } }, { description_en: { _ilike: "%shirt%" } }],
          },
        ],
      };

      const result = applyWhereClause([...mockProducts], where);
      expect(result.every((p: Product) => p.category === "clothing")).toBe(true);
    });
  });

  describe("stock calculation", () => {
    it("products with variants should use variant stock sum", () => {
      const productWithVariants = mockProducts.find((p) => p.variants && p.variants.length > 0);
      expect(productWithVariants).toBeDefined();

      const variantStock = productWithVariants!.variants!.reduce((sum, v) => sum + v.stock, 0);
      expect(variantStock).toBeGreaterThan(0);
    });

    it("products without variants should use product.stock", () => {
      const productWithoutVariants = mockProducts.find(
        (p) => (!p.variants || p.variants.length === 0) && (p.stock ?? 0) > 0,
      );
      expect(productWithoutVariants).toBeDefined();
      expect(productWithoutVariants!.stock).toBeGreaterThan(0);
    });

    it("out of stock product without variants has stock = 0", () => {
      // Create a test product without variants and stock = 0
      const outOfStockProduct: Product = {
        id: "test-oos",
        name: "Out of Stock",
        slug: "out-of-stock",
        priceMinor: 1000,
        currency: "GBP",
        status: "ACTIVE",
        stock: 0,
        variants: [],
      };

      const hasVariants = outOfStockProduct.variants && outOfStockProduct.variants.length > 0;
      const totalStock = hasVariants
        ? outOfStockProduct.variants!.reduce((sum, v) => sum + v.stock, 0)
        : (outOfStockProduct.stock ?? 0);

      expect(totalStock).toBe(0);
    });

    it("product with stock but no variants should show as in stock", () => {
      const productWithStock: Product = {
        id: "test-in-stock",
        name: "In Stock",
        slug: "in-stock",
        priceMinor: 1000,
        currency: "GBP",
        status: "ACTIVE",
        stock: 10,
        variants: [],
      };

      const hasVariants = productWithStock.variants && productWithStock.variants.length > 0;
      const totalStock = hasVariants
        ? productWithStock.variants!.reduce((sum, v) => sum + v.stock, 0)
        : (productWithStock.stock ?? 0);

      expect(totalStock).toBe(10);
    });
  });
});
