import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CartProvider, getCartItemId, useCart } from "./CartContext";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    clear: () => {
      store = {};
    },
    getItem: (key: string) => store[key] || null,
    removeItem: (key: string) => {
      delete store[key];
    },
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("CartContext", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => <CartProvider>{children}</CartProvider>;

  const createCartItem = (overrides = {}) => ({
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

  describe("getCartItemId", () => {
    it("returns product ID for items without variant", () => {
      expect(getCartItemId("prod-1")).toBe("prod-1");
    });

    it("includes variant details in ID", () => {
      const variant = { ageGroup: "adult" as const, gender: "unisex" as const, size: "m" as const };
      const id = getCartItemId("prod-1", variant);
      expect(id).toBe("prod-1::unisex::adult::m");
    });

    it("includes color in ID when present", () => {
      const variant = { ageGroup: "adult" as const, color: "navy", gender: "unisex" as const, size: "m" as const };
      const id = getCartItemId("prod-1", variant);
      expect(id).toBe("prod-1::unisex::adult::m::navy");
    });
  });

  describe("addItem", () => {
    it("adds new item to empty cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(createCartItem());
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].name).toBe("Test Product");
    });

    it("increments quantity when adding same item", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(createCartItem({ quantity: 2 }));
      });

      act(() => {
        result.current.addItem(createCartItem({ quantity: 3 }));
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(5);
    });

    it("caps quantity at stock limit when adding item", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      // Add item with stock of 3
      act(() => {
        result.current.addItem(createCartItem({ quantity: 5, stock: 3 }));
      });

      // Quantity should be capped at 3
      expect(result.current.items[0].quantity).toBe(3);
    });

    it("caps quantity at stock limit when incrementing existing item", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      // Add 2 items (stock is 3)
      act(() => {
        result.current.addItem(createCartItem({ quantity: 2, stock: 3 }));
      });

      expect(result.current.items[0].quantity).toBe(2);

      // Try to add 5 more - should cap at stock of 3
      act(() => {
        result.current.addItem(createCartItem({ quantity: 5, stock: 3 }));
      });

      expect(result.current.items[0].quantity).toBe(3);
    });

    it("allows unlimited quantity when stock is not specified", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      // Add item without stock limit
      act(() => {
        result.current.addItem(createCartItem({ quantity: 100, stock: undefined }));
      });

      expect(result.current.items[0].quantity).toBe(100);
    });
  });

  describe("setQuantity", () => {
    it("updates item quantity", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(createCartItem());
      });

      act(() => {
        result.current.setQuantity("prod-1", 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
    });

    it("caps quantity at stock limit", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      // Add item with stock of 3
      act(() => {
        result.current.addItem(createCartItem({ stock: 3 }));
      });

      // Try to set quantity to 10 - should cap at 3
      act(() => {
        result.current.setQuantity("prod-1", 10);
      });

      expect(result.current.items[0].quantity).toBe(3);
    });

    it("removes item when quantity set to 0", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(createCartItem());
      });

      expect(result.current.items).toHaveLength(1);

      act(() => {
        result.current.setQuantity("prod-1", 0);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it("removes item when quantity set to negative", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(createCartItem());
      });

      act(() => {
        result.current.setQuantity("prod-1", -1);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe("removeItem", () => {
    it("removes item from cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(createCartItem());
      });

      expect(result.current.items).toHaveLength(1);

      act(() => {
        result.current.removeItem("prod-1");
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe("clear", () => {
    it("removes all items from cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(createCartItem({ id: "prod-1" }));
        result.current.addItem(createCartItem({ id: "prod-2", name: "Product 2" }));
      });

      expect(result.current.items).toHaveLength(2);

      act(() => {
        result.current.clear();
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe("currency", () => {
    it("returns undefined when cart is empty", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.currency).toBeUndefined();
    });

    it("returns currency from first item", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(createCartItem({ currency: "EUR" }));
      });

      expect(result.current.currency).toBe("EUR");
    });
  });

  describe("totalMinor", () => {
    it("returns 0 for empty cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.totalMinor).toBe(0);
    });

    it("calculates total for single item", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(createCartItem({ priceMinor: 2500, quantity: 2 }));
      });

      expect(result.current.totalMinor).toBe(5000); // 2500 * 2
    });

    it("calculates total for multiple items", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(createCartItem({ id: "prod-1", priceMinor: 1000, quantity: 2 }));
        result.current.addItem(createCartItem({ id: "prod-2", priceMinor: 500, quantity: 3 }));
      });

      expect(result.current.totalMinor).toBe(3500); // (1000 * 2) + (500 * 3)
    });
  });

  describe("stock capping edge cases", () => {
    it("handles stock of 1 (single item limit)", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(createCartItem({ quantity: 5, stock: 1 }));
      });

      expect(result.current.items[0].quantity).toBe(1);

      // Try adding more - should stay at 1
      act(() => {
        result.current.addItem(createCartItem({ quantity: 1, stock: 1 }));
      });

      expect(result.current.items[0].quantity).toBe(1);
    });

    it("handles stock of 0 (out of stock item) - allows adding but UI should prevent", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      // Note: Stock of 0 uses falsy check in ternary, so it doesn't cap.
      // The UI layer (ProductView) should prevent adding out-of-stock items.
      // This documents current behavior - stock of 0 doesn't cap quantity.
      act(() => {
        result.current.addItem(createCartItem({ quantity: 1, stock: 0 }));
      });

      expect(result.current.items[0].quantity).toBe(1);
      expect(result.current.items[0].stock).toBe(0);
    });

    it("updates stock limit when adding same item with different stock", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      // Add with stock 10
      act(() => {
        result.current.addItem(createCartItem({ quantity: 5, stock: 10 }));
      });

      expect(result.current.items[0].quantity).toBe(5);

      // Add again with updated stock of 3 - should cap at 3
      act(() => {
        result.current.addItem(createCartItem({ quantity: 2, stock: 3 }));
      });

      expect(result.current.items[0].quantity).toBe(3);
      expect(result.current.items[0].stock).toBe(3);
    });
  });

  describe("currency mismatch on hydration", () => {
    it("removes items with different currency on hydration", async () => {
      // Pre-populate localStorage with mixed-currency items
      const mixedCurrencyCart = {
        items: [
          createCartItem({ currency: "GBP", id: "prod-1", name: "GBP Item" }),
          createCartItem({ currency: "USD", id: "prod-2", name: "USD Item" }),
          createCartItem({ currency: "GBP", id: "prod-3", name: "Another GBP Item" }),
        ],
      };
      localStorageMock.setItem("mndr.cart", JSON.stringify(mixedCurrencyCart));

      const { result } = renderHook(() => useCart(), { wrapper });

      // Wait for hydration effect to run
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should only keep GBP items (first currency encountered)
      expect(result.current.items).toHaveLength(2);
      expect(result.current.items.every((item) => item.currency === "GBP")).toBe(true);
      expect(result.current.currencyMismatchWarning).toBe(true);
    });

    it("does not show warning when all items have same currency", async () => {
      const sameCurrencyCart = {
        items: [
          createCartItem({ currency: "EUR", id: "prod-1", name: "EUR Item 1" }),
          createCartItem({ currency: "EUR", id: "prod-2", name: "EUR Item 2" }),
        ],
      };
      localStorageMock.setItem("mndr.cart", JSON.stringify(sameCurrencyCart));

      const { result } = renderHook(() => useCart(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.currencyMismatchWarning).toBe(false);
    });

    it("can dismiss currency mismatch warning", async () => {
      const mixedCurrencyCart = {
        items: [createCartItem({ currency: "GBP", id: "prod-1" }), createCartItem({ currency: "USD", id: "prod-2" })],
      };
      localStorageMock.setItem("mndr.cart", JSON.stringify(mixedCurrencyCart));

      const { result } = renderHook(() => useCart(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.currencyMismatchWarning).toBe(true);

      act(() => {
        result.current.clearCurrencyWarning();
      });

      expect(result.current.currencyMismatchWarning).toBe(false);
    });

    it("hydrates empty cart without warning", async () => {
      localStorageMock.setItem("mndr.cart", JSON.stringify({ items: [] }));

      const { result } = renderHook(() => useCart(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.currencyMismatchWarning).toBe(false);
    });

    it("keeps first currency encountered and removes all others", async () => {
      const mixedCurrencyCart = {
        items: [
          createCartItem({ currency: "USD", id: "prod-1" }),
          createCartItem({ currency: "EUR", id: "prod-2" }),
          createCartItem({ currency: "GBP", id: "prod-3" }),
          createCartItem({ currency: "USD", id: "prod-4" }),
        ],
      };
      localStorageMock.setItem("mndr.cart", JSON.stringify(mixedCurrencyCart));

      const { result } = renderHook(() => useCart(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should only keep USD items (first currency)
      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[0].id).toBe("prod-1");
      expect(result.current.items[1].id).toBe("prod-4");
      expect(result.current.currency).toBe("USD");
    });
  });
});
