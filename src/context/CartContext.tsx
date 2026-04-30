"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import { CartItem, CartState, Product, AppliedPromo } from "@/lib/types";

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QTY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR" }
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "APPLY_PROMO"; payload: AppliedPromo }
  | { type: "REMOVE_PROMO" };

const initialState: CartState = {
  items: [],
  isOpen: false,
  appliedPromo: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          isOpen: true,
          items: state.items.map((i) =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        };
      }
      return { ...state, isOpen: true, items: [...state.items, action.payload] };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };
    case "UPDATE_QTY":
      return {
        ...state,
        items: state.items.map((i) => {
          if (i.id !== action.payload.id) return i;
          const newQty = action.payload.quantity;
          // For matrix-priced products product.price is 0, so keep the original linePrice.
          const newLinePrice = i.product.price > 0 ? i.product.price * newQty : i.linePrice;
          return { ...i, quantity: newQty, linePrice: newLinePrice };
        }),
      };
    case "CLEAR":
      return { ...state, items: [], appliedPromo: null };
    case "OPEN":
      return { ...state, isOpen: true };
    case "CLOSE":
      return { ...state, isOpen: false };
    case "APPLY_PROMO":
      return { ...state, appliedPromo: action.payload };
    case "REMOVE_PROMO":
      return { ...state, appliedPromo: null };
    default:
      return state;
  }
}

interface CartContextValue {
  state: CartState;
  addItem: (product: Product, options: Record<string, string>, qty?: number, text?: string, artwork?: string, linePrice?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  applyPromo: (promo: AppliedPromo) => void;
  removePromo: () => void;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = useCallback(
    (product: Product, options: Record<string, string>, qty = 1, text?: string, artwork?: string, linePrice?: number) => {
      const id = `${product.id}-${Object.values(options).join("-")}-${text ?? ""}`;
      const resolvedLinePrice = linePrice ?? product.price * qty;
      dispatch({
        type: "ADD_ITEM",
        payload: { id, product, quantity: qty, linePrice: resolvedLinePrice, selectedOptions: options, customText: text, artworkUrl: artwork },
      });
    },
    []
  );

  const removeItem = useCallback((id: string) => dispatch({ type: "REMOVE_ITEM", payload: id }), []);
  const updateQty = useCallback((id: string, quantity: number) => dispatch({ type: "UPDATE_QTY", payload: { id, quantity } }), []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const openCart = useCallback(() => dispatch({ type: "OPEN" }), []);
  const closeCart = useCallback(() => dispatch({ type: "CLOSE" }), []);
  const applyPromo = useCallback((promo: AppliedPromo) => dispatch({ type: "APPLY_PROMO", payload: promo }), []);
  const removePromo = useCallback(() => dispatch({ type: "REMOVE_PROMO" }), []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.linePrice, 0);

  const discountAmount = state.appliedPromo
    ? state.appliedPromo.discountType === "percent"
      ? Math.round(subtotal * state.appliedPromo.discountValue) / 100
      : Math.min(state.appliedPromo.discountValue / 100, subtotal)
    : 0;

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQty, clearCart, openCart, closeCart, applyPromo, removePromo, totalItems, subtotal, discountAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
