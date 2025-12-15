"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useReducer, useState } from "react";

import { ClothingSize } from "~/lib/constants/options/CLOTHING";
import { Clothing_Age_Group_Enum, Clothing_Gender_Enum } from "~/types/graphql.generated";

/** Result of attempting to add an item to cart */
export type AddItemResult =
  | { currentCurrency: string; itemCurrency: string; reason: "currency_mismatch"; success: false }
  | { success: true };

/**
 * Cart item stored in client state.
 *
 * ⚠️ PRODUCTION SECURITY: priceMinor and stock are NOT authoritative.
 * These values MUST be re-validated on the server before checkout to prevent
 * client-side manipulation (e.g., localStorage tampering).
 */
export interface CartItem {
  currency: string;
  id: string;
  image?: string;
  name: string;
  /** Price in minor currency units (e.g., cents). NOT authoritative - must be server-validated. */
  priceMinor: number;
  quantity: number;
  slug: string;
  /** Available stock for this item/variant - used to cap quantities. NOT authoritative - must be server-validated. */
  stock?: number;
  variant?: CartItemVariant;
}

/** Variant selection for clothing items */
export interface CartItemVariant {
  ageGroup: Clothing_Age_Group_Enum;
  color?: string;
  gender: Clothing_Gender_Enum;
  size: ClothingSize;
}

export interface CartState {
  items: CartItem[];
}

type CartAction =
  | { payload: { id: string; quantity: number }; type: "SET_QUANTITY" }
  | { payload: { id: string }; type: "REMOVE_ITEM" }
  | { payload: CartItem; type: "ADD_ITEM" }
  | { payload: CartState; type: "HYDRATE" }
  | { type: "CLEAR_CURRENCY_WARNING" }
  | { type: "CLEAR" };

interface CartProviderProps {
  children: ReactNode;
  /**
   * Initial cart, typically provided from the server during SSR/edge rendering.
   * If provided, localStorage is treated as a guest fallback and will not overwrite this state.
   */
  initialCart?: CartState;
  /**
   * Persist to localStorage for guests/offline scenarios. Disable if the cart is fully server-backed.
   */
  persistLocally?: boolean;
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

/**
 * Keep only items that match the first currency encountered to prevent mixed-currency carts.
 * Returns the sanitized cart and whether a mismatch was detected.
 */
const sanitizeCurrency = (cart: CartState) => {
  if (!cart.items.length) {
    return { cart, warning: false };
  }

  const primaryCurrency = cart.items[0]?.currency;
  if (!primaryCurrency) {
    return { cart, warning: false };
  }

  const validItems = cart.items.filter((item) => item.currency === primaryCurrency);
  const warning = validItems.length < cart.items.length;
  return { cart: { items: validItems }, warning };
};

const CartContext = createContext<{
  /**
   * Add an item to the cart.
   * Returns success: false with reason if the item's currency doesn't match existing cart items.
   * Call clear() first if you want to switch currencies.
   */
  addItem: (item: CartItem) => AddItemResult;
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

export const CartProvider = ({ children, initialCart, persistLocally = true }: Readonly<CartProviderProps>) => {
  const { cart: sanitizedInitialCart, warning: initialWarning } = sanitizeCurrency(initialCart ?? { items: [] });
  const [state, dispatch] = useReducer(cartReducer, sanitizedInitialCart);
  const [currencyMismatchWarning, setCurrencyMismatchWarning] = useState(initialWarning);
  const [isHydrated, setIsHydrated] = useState(false);

  const shouldHydrateFromLocalStorage = persistLocally && (!initialCart || initialCart.items.length === 0);

  // Hydrate from localStorage once on mount, cleansing mixed currencies.
  useEffect(() => {
    if (!shouldHydrateFromLocalStorage) {
      setIsHydrated(true);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartState;
        const { cart: sanitizedCart, warning } = sanitizeCurrency(parsed);
        dispatch({ payload: sanitizedCart, type: "HYDRATE" });
        if (warning) setCurrencyMismatchWarning(true);
      }
    } catch {
      // ignore invalid storage
    }
    setIsHydrated(true);
  }, [shouldHydrateFromLocalStorage]);

  // Persist whenever items change, but only after hydration is complete.
  useEffect(() => {
    if (!persistLocally || !isHydrated) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage might be unavailable, fail silently
    }
  }, [state, persistLocally, isHydrated]);

  const value = useMemo(() => {
    // Calculate totals directly - currency from first item, total from sum
    const currency = state.items[0]?.currency;
    const totalMinor = state.items.reduce((sum, item) => sum + item.priceMinor * item.quantity, 0);

    return {
      addItem: (item: CartItem): AddItemResult => {
        // STRICT CURRENCY ENFORCEMENT: Reject items with mismatched currency
        // Cart must be single-currency. To switch currencies, clear the cart first.
        if (currency && item.currency !== currency) {
          console.warn(
            `[Cart] Rejected item "${item.name}" with currency ${item.currency}. ` +
              `Cart currency is ${currency}. Clear cart to switch currencies.`,
          );
          return {
            currentCurrency: currency,
            itemCurrency: item.currency,
            reason: "currency_mismatch",
            success: false,
          };
        }
        dispatch({ payload: item, type: "ADD_ITEM" });
        return { success: true };
      },
      clear: () => dispatch({ type: "CLEAR" }),
      clearCurrencyWarning: () => setCurrencyMismatchWarning(false),
      currency,
      currencyMismatchWarning,
      items: state.items,
      removeItem: (id: string) => dispatch({ payload: { id }, type: "REMOVE_ITEM" }),
      setQuantity: (id: string, quantity: number) => dispatch({ payload: { id, quantity }, type: "SET_QUANTITY" }),
      totalMinor,
    };
  }, [state.items, currencyMismatchWarning]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
