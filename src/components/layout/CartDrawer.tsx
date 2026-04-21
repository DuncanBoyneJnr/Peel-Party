"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function CartDrawer() {
  const { state, closeCart, removeItem, updateQty, subtotal, totalItems } = useCart();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [state.isOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeCart]);

  if (!state.isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e1d8]">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#ef8733]" />
            <h2 className="font-display font-700 text-[#111111] text-lg">
              Your Cart
              {totalItems > 0 && (
                <span className="ml-2 text-sm font-semibold text-[#6b7280]">({totalItems})</span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="w-9 h-9 rounded-full hover:bg-[#f0ede8] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 bg-[#f9f7f4] rounded-full flex items-center justify-center">
                <ShoppingBag size={32} className="text-[#d1c8bc]" />
              </div>
              <div>
                <p className="font-display font-700 text-[#111111] text-lg">Your cart is empty</p>
                <p className="text-sm text-[#6b7280] mt-1">Add something to get started.</p>
              </div>
              <Button onClick={closeCart} variant="outline" size="sm">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {state.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4 border-b border-[#f0ede8] last:border-0">
                  {/* Image placeholder */}
                  <div className="w-16 h-16 bg-[#f9f7f4] rounded-xl flex items-center justify-center shrink-0">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <rect width="28" height="28" rx="4" fill="#e5e1d8"/>
                      <circle cx="10" cy="10" r="3" fill="#d1c8bc"/>
                      <path d="M6 20L10 15L14 18L18 14L22 20H6Z" fill="#d1c8bc"/>
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111111] truncate">{item.product.name}</p>
                    {Object.entries(item.selectedOptions).map(([k, v]) => (
                      <p key={k} className="text-xs text-[#6b7280]">{k}: {v}</p>
                    ))}
                    {item.customText && (
                      <p className="text-xs text-[#6b7280] truncate">Text: "{item.customText}"</p>
                    )}
                    {item.artworkFileName && (
                      <p className="text-xs text-[#ef8733]">Artwork: {item.artworkFileName}</p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                          className="w-6 h-6 rounded-full border border-[#e5e1d8] flex items-center justify-center hover:border-[#ef8733] transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full border border-[#e5e1d8] flex items-center justify-center hover:border-[#ef8733] transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-[#111111]">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[#d1c8bc] hover:text-red-500 transition-colors cursor-pointer self-start mt-1"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t border-[#e5e1d8] px-6 py-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6b7280]">Subtotal</span>
              <span className="font-display font-700 text-xl text-[#111111]">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-[#6b7280] -mt-2">Shipping calculated at checkout.</p>
            <Link href="/checkout" onClick={closeCart}>
              <Button fullWidth size="lg">Checkout</Button>
            </Link>
            <Button variant="ghost" fullWidth onClick={closeCart} className="text-sm">
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
