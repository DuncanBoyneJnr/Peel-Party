"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ShoppingCart, FileText, Plus, Minus } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";
import FileUpload from "@/components/ui/FileUpload";

interface ProductActionsProps {
  product: Product;
  maxOrderQty?: number;
}

export default function ProductActions({ product, maxOrderQty = 1000 }: ProductActionsProps) {
  const { addItem } = useCart();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    Object.fromEntries(product.options.map((o) => [o.name, o.values[0]]))
  );
  const [customText, setCustomText] = useState("");
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [quantity, setQuantity] = useState<number | null>(null);
  const [added, setAdded] = useState(false);

  const isQuote = product.orderType === "request-quote";

  const selectedSizeVariant = useMemo(() => {
    if (!product.sizeVariants?.length) return null;
    return product.sizeVariants.find((v) => v.name === selectedOptions["Size"]) ?? null;
  }, [product.sizeVariants, selectedOptions]);

  // Price matrix tiers for the selected size (or "" for no-size products)
  const sizeKey = selectedSizeVariant?.name ?? "";
  const matrixTiers = product.priceMatrix?.[sizeKey] ?? [];
  const hasMatrix = matrixTiers.length > 0;

  // Derive the effective quantity — snap to first valid tier on size change
  const validQtys = hasMatrix ? matrixTiers.map((t) => t.qty) : null;
  const defaultQty = validQtys?.[0] ?? 1;
  const effectiveQty = quantity !== null && (!validQtys || validQtys.includes(quantity))
    ? quantity
    : defaultQty;

  // Fall back to stickersPerSheet-based tiers when no matrix (legacy path)
  const stickersPerSheet = selectedSizeVariant?.stickersPerSheet ?? 0;
  const legacyTiers = useMemo(() => {
    if (hasMatrix || !stickersPerSheet) return null;
    const multipliers = [1, 2, 3, 5, 10, 15, 25, 50, 100, 150, 250, 500, 1000];
    return [...new Set(
      multipliers.map((m) => m * stickersPerSheet).filter((q) => q <= maxOrderQty)
    )].sort((a, b) => a - b);
  }, [hasMatrix, stickersPerSheet, maxOrderQty]);

  const tierQtys: number[] = hasMatrix
    ? matrixTiers.map((t) => t.qty)
    : (legacyTiers ?? []);
  const showTierButtons = tierQtys.length > 1;

  // Price from matrix (or fallback to product.price)
  const currentTier = hasMatrix
    ? (matrixTiers.find((t) => t.qty === effectiveQty) ?? matrixTiers[0])
    : null;
  const displayPrice = currentTier ? currentTier.totalPence / 100 : product.price;
  const displayUnit = (currentTier && effectiveQty > 1) ? currentTier.unitPence / 100 : null;

  function handleAddToCart() {
    // For matrix products, displayPrice is already the tier total; for flat-price products multiply by qty.
    const linePrice = currentTier ? currentTier.totalPence / 100 : product.price * effectiveQty;
    addItem(product, selectedOptions, effectiveQty, customText || undefined, artworkFile?.name, linePrice);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Price */}
      {!isQuote && (
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="font-display font-700 text-3xl text-[#111111]">
            {formatPrice(displayPrice)}
          </span>
          {displayUnit && effectiveQty > 1 && (
            <span className="text-sm text-[#6b7280]">{formatPrice(displayUnit)} each</span>
          )}
          {!currentTier && product.originalPrice && (
            <span className="text-lg text-[#6b7280] line-through">{formatPrice(product.originalPrice)}</span>
          )}
          {currentTier && (
            <span className="text-xs text-[#6b7280] bg-[#f0ede8] px-2 py-1 rounded-lg">
              for {effectiveQty}
            </span>
          )}
        </div>
      )}

      {/* Option selectors */}
      {product.options.map((opt) => (
        <div key={opt.name}>
          <label className="block text-sm font-semibold text-[#111111] mb-2">
            {opt.name}: <span className="text-[#ef8733]">{selectedOptions[opt.name]}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {opt.values.map((val) => (
              <button
                key={val}
                onClick={() => {
                  setSelectedOptions((prev) => ({ ...prev, [opt.name]: val }));
                  setQuantity(null); // reset to default tier for new size
                }}
                className={`px-4 py-2 text-sm rounded-full border-2 transition-all cursor-pointer ${
                  selectedOptions[opt.name] === val
                    ? "border-[#ef8733] bg-[#fff7ed] text-[#ef8733] font-semibold"
                    : "border-[#e5e1d8] text-[#111111] hover:border-[#ef8733]"
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Custom text */}
      {product.supportsTextInput && (
        <div>
          <label className="block text-sm font-semibold text-[#111111] mb-2">
            Custom Text <span className="text-[#6b7280] font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Enter your text here…"
            maxLength={100}
            className="w-full h-11 px-4 rounded-xl border-2 border-[#e5e1d8] text-sm text-[#111111] placeholder:text-[#6b7280] focus:outline-none focus:border-[#ef8733] transition-colors"
          />
        </div>
      )}

      {/* File upload */}
      {product.supportsFileUpload && (
        <FileUpload onFile={setArtworkFile} label="Upload Artwork (optional)" />
      )}

      {/* Quantity */}
      {!isQuote && (
        <div>
          <label className="block text-sm font-semibold text-[#111111] mb-2">Quantity</label>

          {showTierButtons ? (
            <>
              <div className="flex flex-wrap gap-2">
                {tierQtys.map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuantity(q)}
                    className={`px-4 py-2 text-sm rounded-full border-2 transition-all cursor-pointer ${
                      effectiveQty === q
                        ? "border-[#ef8733] bg-[#fff7ed] text-[#ef8733] font-semibold"
                        : "border-[#e5e1d8] text-[#111111] hover:border-[#ef8733]"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
              {selectedSizeVariant && (
                <p className="text-xs text-[#6b7280] mt-2">
                  Quantities in multiples of {selectedSizeVariant.stickersPerSheet} (full sheets).{" "}
                  <Link href={`/custom-order?product=${product.slug}`} className="text-[#ef8733] hover:underline font-medium">
                    Need more than {maxOrderQty}?
                  </Link>
                </p>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, effectiveQty - 1))}
                className="w-10 h-10 rounded-full border-2 border-[#e5e1d8] flex items-center justify-center hover:border-[#ef8733] transition-colors cursor-pointer"
              >
                <Minus size={16} />
              </button>
              <span className="text-lg font-semibold text-[#111111] w-8 text-center">{effectiveQty}</span>
              <button
                onClick={() => setQuantity(effectiveQty + 1)}
                className="w-10 h-10 rounded-full border-2 border-[#e5e1d8] flex items-center justify-center hover:border-[#ef8733] transition-colors cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      {isQuote ? (
        <div className="flex flex-col gap-3">
          <Link href={`/custom-order?product=${product.slug}`}>
            <Button size="lg" fullWidth>
              <FileText size={18} /> Request a Quote
            </Button>
          </Link>
          <p className="text-xs text-[#6b7280] text-center">We respond within 24 hours with a full quote.</p>
        </div>
      ) : (
        <Button size="lg" fullWidth onClick={handleAddToCart}>
          {added ? (
            "✓ Added to cart!"
          ) : (
            <><ShoppingCart size={18} /> Add to Cart — {formatPrice(displayPrice)}</>
          )}
        </Button>
      )}
    </div>
  );
}
