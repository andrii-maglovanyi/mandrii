"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useReducer, useState } from "react";

import { ClothingAgeGroup, ClothingGender, ClothingSize } from "~/lib/constants/options/CLOTHING";

/** Variant selection for clothing items */
export interface CartItemVariant {
  ageGroup: ClothingAgeGroup;
  color?: string;
  gender: ClothingGender;
  size: ClothingSize;
}

type CartAction =
  | { payload: { id: string; quantity: number }; type: "SET_QUANTITY" }
  | { payload: { id: string }; type: "REMOVE_ITEM" }
  | { payload: CartItem; type: "ADD_ITEM" }
  | { payload: CartState; type: "HYDRATE" }
  | { type: "CLEAR" };

interface CartItem {
  currency: string;
  id: string;
  image?: string;
  name: string;
  priceMinor: number;
  quantity: number;
  slug: string;
  /** Available stock for this item/variant - used to cap quantities */
  stock?: number;
  variant?: CartItemVariant;
}

interface CartState {
  items: CartItem[];
}

const STORAGE_KEY = "mndr.cart";

/**
 * Generate a unique cart item ID that includes variant info.
 * This ensures same product with different variants are separate line items.
 */
export const getCartItemId = (productId: string, variant?: CartItemVariant): string => {
  if (!variant) return productId;
  const colorPart = variant.color ? `::${variant.color}` : "";
  return `${productId}::${variant.gender}::${variant.ageGroup}::${variant.size}${colorPart}`;
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const newItem = action.payload;

      const existing = state.items.find((item) => item.id === newItem.id);
      if (existing) {
        // Cap quantity at available stock
        const maxStock = newItem.stock ?? Infinity;
        const newQuantity = Math.min(existing.quantity + newItem.quantity, maxStock);
        return {
          items: state.items.map((item) =>
            item.id === newItem.id ? { ...item, quantity: newQuantity, stock: newItem.stock } : item,
          ),
        };
      }
      // For new items, ensure quantity doesn't exceed stock
      const cappedQuantity = newItem.stock ? Math.min(newItem.quantity, newItem.stock) : newItem.quantity;
      return { items: [...state.items, { ...newItem, quantity: cappedQuantity }] };
    }
    case "CLEAR":
      return { items: [] };
    case "HYDRATE":
      return action.payload;
    case "REMOVE_ITEM":
      return { items: state.items.filter((item) => item.id !== action.payload.id) };
    case "SET_QUANTITY": {
      const item = state.items.find((i) => i.id === action.payload.id);
      const maxStock = item?.stock ?? Infinity;
      const cappedQuantity = Math.min(action.payload.quantity, maxStock);
      return {
        items: state.items
          .map((item) => (item.id === action.payload.id ? { ...item, quantity: cappedQuantity } : item))
          .filter((item) => item.quantity > 0),
      };
    }
    default:
      return state;
  }
};

const CartContext = createContext<{
  addItem: (item: CartItem) => void;
  clear: () => void;
  /** Dismiss the currency mismatch warning */
  clearCurrencyWarning: () => void;
  /** Current cart currency (from first item), or undefined if cart is empty */
  currency: string | undefined;
  /** True if items were removed on load due to currency mismatch */
  currencyMismatchWarning: boolean;
  items: CartItem[];
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  totalMinor: number;
} | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [currencyMismatchWarning, setCurrencyMismatchWarning] = useState(false);

  // Hydrate from localStorage once on mount, cleansing mixed currencies.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartState;
        // Cleanse: keep only items matching the first item's currency
        const primaryCurrency = parsed.items[0]?.currency;
        if (primaryCurrency) {
          const validItems = parsed.items.filter((item) => item.currency === primaryCurrency);
          const hadMismatch = validItems.length < parsed.items.length;
          if (hadMismatch) {
            setCurrencyMismatchWarning(true);
          }
          dispatch({ payload: { items: validItems }, type: "HYDRATE" });
        } else {
          dispatch({ payload: parsed, type: "HYDRATE" });
        }
      }
    } catch {
      // ignore invalid storage
    }
  }, []);

  // Persist whenever items change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage might be unavailable, fail silently
    }
  }, [state]);

  const totals = useMemo(() => {
    // Currency is undefined if cart is empty, otherwise from first item
    const currency = state.items[0]?.currency;
    const totalMinor = state.items.reduce((sum, item) => sum + item.priceMinor * item.quantity, 0);
    return { currency, totalMinor };
  }, [state.items]);

  const value = useMemo(
    () => ({
      addItem: (item: CartItem) => dispatch({ payload: item, type: "ADD_ITEM" }),
      clear: () => dispatch({ type: "CLEAR" }),
      clearCurrencyWarning: () => setCurrencyMismatchWarning(false),
      currency: totals.currency,
      currencyMismatchWarning,
      items: state.items,
      removeItem: (id: string) => dispatch({ payload: { id }, type: "REMOVE_ITEM" }),
      setQuantity: (id: string, quantity: number) => dispatch({ payload: { id, quantity }, type: "SET_QUANTITY" }),
      totalMinor: totals.totalMinor,
    }),
    [state.items, totals.currency, totals.totalMinor, currencyMismatchWarning],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
