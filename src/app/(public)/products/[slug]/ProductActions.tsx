"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, FileText, Plus, Minus } from "lucide-react";
import { Product, ArtworkFile } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";
import FileUpload from "@/components/ui/FileUpload";

interface ProductActionsProps {
  product: Product;
  maxOrderQty?: number;
}

export default function ProductActions({ product, maxOrderQty = 1000 }: ProductActionsProps) {
  const { addItem, volumeDiscounts } = useCart();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    Object.fromEntries(product.options.map((o) => [o.name, o.values[0]]))
  );
  const [customText, setCustomText] = useState("");
  const [slotState, setSlotState] = useState<Record<string, { file: File | null; url: string | null; uploading: boolean }>>({});
  const [slotResetKey, setSlotResetKey] = useState(0);
  const [quantity, setQuantity] = useState<number | null>(null);
  const [added, setAdded] = useState(false);

  const [isCustomQty, setIsCustomQty] = useState(false);
  const [customQtyInput, setCustomQtyInput] = useState("");

  const isQuote = product.orderType === "request-quote";

  // Determine upload slots based on the selected Placement option value
  const uploadSlots = useMemo(() => {
    if (!product.supportsFileUpload) return [] as { key: string; label: string }[];
    const placement = selectedOptions["Placement"];
    if (!placement) return [{ key: "artwork", label: "Artwork" }];
    const lc = placement.toLowerCase();
    const hasFront = lc.includes("front");
    const hasBack = lc.includes("back");
    if (hasFront && hasBack) return [{ key: "front", label: "Front" }, { key: "back", label: "Back" }];
    if (hasFront) return [{ key: "front", label: "Front" }];
    if (hasBack) return [{ key: "back", label: "Back" }];
    return [{ key: "artwork", label: "Artwork" }];
  }, [product.supportsFileUpload, selectedOptions]);

  // Reset slot state when placement changes (clears uploaded files)
  useEffect(() => {
    const keys = new Set(uploadSlots.map((s) => s.key));
    setSlotState((prev) => {
      const pruned: typeof prev = {};
      for (const [k, v] of Object.entries(prev)) {
        if (keys.has(k)) pruned[k] = v;
      }
      return pruned;
    });
  }, [uploadSlots]);

  async function handleFileSelect(key: string, file: File | null) {
    setSlotState((prev) => ({ ...prev, [key]: { file, url: null, uploading: !!file } }));
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/artwork-upload", { method: "POST", body: fd });
      const data = await res.json();
      const url = res.ok && data.url ? (data.url as string) : null;
      setSlotState((prev) => ({ ...prev, [key]: { file, url, uploading: false } }));
    } catch {
      setSlotState((prev) => ({ ...prev, [key]: { file, url: null, uploading: false } }));
    }
  }

  const anyUploading = Object.values(slotState).some((s) => s.uploading);

  const selectedSizeVariant = useMemo(() => {
    if (!product.sizeVariants?.length) return null;
    return product.sizeVariants.find((v) => v.name === selectedOptions["Size"]) ?? null;
  }, [product.sizeVariants, selectedOptions]);

  const sizeKey = selectedSizeVariant?.name ?? "";
  // DTF products key the matrix by placement name; fall back to size key or "" for everything else
  const placementKey = selectedOptions["Placement"] ?? "";
  const matrixKey = product.priceMatrix?.[placementKey] !== undefined ? placementKey : sizeKey;
  const matrixTiers = product.priceMatrix?.[matrixKey] ?? [];
  const hasMatrix = matrixTiers.length > 0;

  // DTF mode: first tier carries firstItemPence/subsequentItemPence; quantity is free-form via stepper
  const isDtfMode = !!(matrixTiers[0]?.firstItemPence !== undefined && matrixTiers[0]?.subsequentItemPence !== undefined);
  const dtfFirstItemPence = matrixTiers[0]?.firstItemPence ?? 0;
  const dtfSubsequentItemPence = matrixTiers[0]?.subsequentItemPence ?? 0;

  const validQtys = hasMatrix && !isDtfMode ? matrixTiers.map((t) => t.qty) : null;
  const defaultQty = isDtfMode ? 1 : (validQtys?.[0] ?? 1);
  const effectiveQty = quantity !== null && (!validQtys || isDtfMode || validQtys.includes(quantity))
    ? quantity
    : defaultQty;

  const stickersPerSheet = selectedSizeVariant?.stickersPerSheet ?? 0;

  const legacyTiers = useMemo(() => {
    if (hasMatrix || !stickersPerSheet) return null;
    const multipliers = [1, 2, 3, 5, 10, 15, 25, 50, 100, 150, 250, 500, 1000];
    return [...new Set(
      multipliers.map((m) => m * stickersPerSheet).filter((q) => q <= maxOrderQty)
    )].sort((a, b) => a - b);
  }, [hasMatrix, stickersPerSheet, maxOrderQty]);

  // DTF mode uses a free-form stepper — no tier buttons
  const tierQtys: number[] = isDtfMode ? [] : (hasMatrix ? matrixTiers.map((t) => t.qty) : (legacyTiers ?? []));
  const showTierButtons = tierQtys.length > 1;

  // Custom qty is available for any product that shows tier buttons
  const canCustomQty = showTierButtons;

  // Compute custom quantity pricing whenever the input changes
  const customQtyData = useMemo(() => {
    if (!isCustomQty || !customQtyInput.trim()) return null;
    const raw = parseInt(customQtyInput, 10);
    if (isNaN(raw) || raw < 1) return null;

    // For sheet-based products round up to the next full sheet; otherwise use the raw qty directly
    const pricedQty = stickersPerSheet > 0 ? Math.ceil(raw / stickersPerSheet) * stickersPerSheet : raw;
    const sheetsNeeded = stickersPerSheet > 0 ? Math.ceil(raw / stickersPerSheet) : 1;

    if (pricedQty > maxOrderQty) {
      return { overMax: true as const, raw, sheetsNeeded, pricedQty };
    }

    // Exact match in price matrix
    const exact = matrixTiers.find((t) => t.qty === pricedQty);
    if (exact) {
      return { overMax: false as const, raw, sheetsNeeded, pricedQty, totalPence: exact.totalPence, unitPence: exact.unitPence };
    }

    // No exact match — extrapolate from the highest tier ≤ pricedQty
    const floorTier = [...matrixTiers].reverse().find((t) => t.qty <= pricedQty);
    if (floorTier) {
      const unitPence = Math.round(floorTier.totalPence / floorTier.qty);
      return { overMax: false as const, raw, sheetsNeeded, pricedQty, totalPence: unitPence * pricedQty, unitPence };
    }

    // Below the minimum tier — enforce the first (minimum) tier price
    const first = matrixTiers[0];
    if (first) {
      const minSheets = stickersPerSheet > 0 ? first.qty / stickersPerSheet : 1;
      return { overMax: false as const, raw, sheetsNeeded: minSheets, pricedQty: first.qty, totalPence: first.totalPence, unitPence: first.unitPence };
    }

    return null;
  }, [isCustomQty, customQtyInput, stickersPerSheet, matrixTiers, maxOrderQty]);

  // Resolve price and display qty (custom takes priority)
  const currentTier = hasMatrix
    ? (matrixTiers.find((t) => t.qty === effectiveQty) ?? matrixTiers[0])
    : null;

  // Per-option-value pricing — first option with a priceMap whose selected value has a price wins
  const optionUnitPrice = useMemo(() => {
    for (const opt of product.options) {
      if (opt.priceMap) {
        const mapped = opt.priceMap[selectedOptions[opt.name]];
        if (mapped !== undefined) return mapped;
      }
    }
    return null;
  }, [product.options, selectedOptions]);

  const unitPrice = optionUnitPrice ?? product.price;

  // Volume discount — only applies to non-matrix products with a unit price
  const activeVolumeTier = !hasMatrix && unitPrice > 0 && volumeDiscounts.length > 0
    ? [...volumeDiscounts].sort((a, b) => b.minQty - a.minQty).find((t) => effectiveQty >= t.minQty) ?? null
    : null;
  const volumeDiscountPct = activeVolumeTier?.discountPercent ?? 0;

  const dtfTotalPence = isDtfMode
    ? dtfFirstItemPence + (effectiveQty - 1) * dtfSubsequentItemPence
    : 0;

  const displayPrice = isDtfMode
    ? dtfTotalPence / 100
    : isCustomQty && customQtyData && !customQtyData.overMax
      ? customQtyData.totalPence / 100
      : currentTier
        ? currentTier.totalPence / 100
        : unitPrice * effectiveQty * (1 - volumeDiscountPct / 100);

  const displayQtyLabel = !isDtfMode && !isCustomQty && currentTier ? effectiveQty : null;

  const displayUnit = !isDtfMode && (
    isCustomQty && customQtyData && !customQtyData.overMax && customQtyData.pricedQty > 1
      ? customQtyData.unitPence / 100
      : (currentTier && effectiveQty > 1 ? currentTier.unitPence / 100 : null)
  ) || null;

  function handleOptionChange(optName: string, val: string) {
    setSelectedOptions((prev) => ({ ...prev, [optName]: val }));
    setQuantity(null);
    setIsCustomQty(false);
    setCustomQtyInput("");
    if (optName === "Placement") {
      setSlotState({});
      setSlotResetKey((k) => k + 1);
    }
  }

  function handleAddToCart() {
    const artworks: ArtworkFile[] = uploadSlots
      .flatMap((slot) => {
        const url = slotState[slot.key]?.url;
        return url ? [{ placement: slot.label, url }] : [];
      });
    const artworksArg = artworks.length ? artworks : undefined;
    if (isDtfMode) {
      addItem(product, selectedOptions, effectiveQty, customText || undefined, artworksArg, dtfTotalPence / 100);
    } else if (isCustomQty) {
      if (!customQtyData || customQtyData.overMax) return;
      addItem(product, selectedOptions, customQtyData.pricedQty, customText || undefined, artworksArg, customQtyData.totalPence / 100);
    } else {
      const linePrice = currentTier
        ? currentTier.totalPence / 100
        : unitPrice * effectiveQty * (1 - volumeDiscountPct / 100);
      addItem(product, selectedOptions, effectiveQty, customText || undefined, artworksArg, linePrice);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const addToCartDisabled = anyUploading || (isCustomQty && (!customQtyData || customQtyData.overMax || !customQtyInput.trim()));

  return (
    <div className="flex flex-col gap-5">
      {/* Price */}
      {!isQuote && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-display font-700 text-3xl text-[#111111]">
              {isCustomQty && customQtyData && !customQtyData.overMax
                ? formatPrice(displayPrice)
                : isCustomQty
                  ? "—"
                  : formatPrice(displayPrice)
              }
            </span>
            {displayUnit && (
              <span className="text-sm text-[#6b7280]">{formatPrice(displayUnit)} each</span>
            )}
            {!currentTier && !isCustomQty && !isDtfMode && volumeDiscountPct > 0 && (
              <span className="text-lg text-[#6b7280] line-through">{formatPrice(unitPrice * effectiveQty)}</span>
            )}
            {!currentTier && !isDtfMode && product.originalPrice && !isCustomQty && !activeVolumeTier && (
              <span className="text-lg text-[#6b7280] line-through">{formatPrice(product.originalPrice)}</span>
            )}
            {displayQtyLabel && (
              <span className="text-xs text-[#6b7280] bg-[#f0ede8] px-2 py-1 rounded-lg">
                for {displayQtyLabel}
              </span>
            )}
            {!currentTier && !isCustomQty && !isDtfMode && activeVolumeTier && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                {activeVolumeTier.discountPercent}% off
              </span>
            )}
          </div>
          {isDtfMode && (
            <p className="text-xs text-[#6b7280]">
              1st item {formatPrice(dtfFirstItemPence / 100)} (includes transfer postage) · each after {formatPrice(dtfSubsequentItemPence / 100)}
            </p>
          )}
          {!isDtfMode && !hasMatrix && volumeDiscounts.length > 0 && (
            <p className="text-xs text-[#6b7280]">
              {[...volumeDiscounts]
                .sort((a, b) => a.minQty - b.minQty)
                .map((t) => `${t.minQty}+: ${t.discountPercent}% off`)
                .join(" · ")}
            </p>
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
            {opt.values.map((val) => {
              const optPrice = opt.priceMap?.[val];
              return (
                <button
                  key={val}
                  onClick={() => handleOptionChange(opt.name, val)}
                  className={`px-4 py-2 text-sm rounded-full border-2 transition-all cursor-pointer ${
                    selectedOptions[opt.name] === val
                      ? "border-[#ef8733] bg-[#fff7ed] text-[#ef8733] font-semibold"
                      : "border-[#e5e1d8] text-[#111111] hover:border-[#ef8733]"
                  }`}
                >
                  {val}{optPrice !== undefined ? ` — ${formatPrice(optPrice)}` : ""}
                </button>
              );
            })}
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

      {/* File upload — one slot per placement position */}
      {uploadSlots.length > 0 && (
        <div className="flex flex-col gap-4">
          {uploadSlots.map((slot) => {
            const s = slotState[slot.key] ?? { file: null, url: null, uploading: false };
            return (
              <div key={`${slotResetKey}-${slot.key}`}>
                <FileUpload
                  onFile={(f) => handleFileSelect(slot.key, f)}
                  label={uploadSlots.length > 1 ? `${slot.label} Artwork` : "Upload Artwork (optional)"}
                />
                {s.uploading && <p className="text-xs text-[#6b7280] mt-1">Uploading…</p>}
                {s.file && !s.uploading && s.url && <p className="text-xs text-emerald-600 mt-1">{slot.label} artwork uploaded ✓</p>}
                {s.file && !s.uploading && !s.url && <p className="text-xs text-amber-600 mt-1">Upload failed — you can still add to cart</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Quantity */}
      {!isQuote && (
        <div>
          <label className="block text-sm font-semibold text-[#111111] mb-2">Quantity</label>

          {isDtfMode ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, effectiveQty - 1))}
                className="w-10 h-10 rounded-full border-2 border-[#e5e1d8] flex items-center justify-center hover:border-[#ef8733] transition-colors cursor-pointer"
              >
                <Minus size={16} />
              </button>
              <span className="text-lg font-semibold text-[#111111] w-8 text-center">{effectiveQty}</span>
              <button
                onClick={() => setQuantity(Math.min(maxOrderQty, effectiveQty + 1))}
                className="w-10 h-10 rounded-full border-2 border-[#e5e1d8] flex items-center justify-center hover:border-[#ef8733] transition-colors cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : showTierButtons ? (
            <>
              <div className="flex flex-wrap gap-2">
                {tierQtys.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setQuantity(q); setIsCustomQty(false); setCustomQtyInput(""); }}
                    className={`px-4 py-2 text-sm rounded-full border-2 transition-all cursor-pointer ${
                      !isCustomQty && effectiveQty === q
                        ? "border-[#ef8733] bg-[#fff7ed] text-[#ef8733] font-semibold"
                        : "border-[#e5e1d8] text-[#111111] hover:border-[#ef8733]"
                    }`}
                  >
                    {q}
                  </button>
                ))}
                {canCustomQty && (
                  <button
                    onClick={() => { setIsCustomQty(true); setQuantity(null); }}
                    className={`px-4 py-2 text-sm rounded-full border-2 transition-all cursor-pointer ${
                      isCustomQty
                        ? "border-[#ef8733] bg-[#fff7ed] text-[#ef8733] font-semibold"
                        : "border-[#e5e1d8] text-[#111111] hover:border-[#ef8733]"
                    }`}
                  >
                    Custom
                  </button>
                )}
              </div>

              {isCustomQty && (
                <div className="mt-3 flex flex-col gap-1.5">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      value={customQtyInput}
                      onChange={(e) => setCustomQtyInput(e.target.value)}
                      placeholder={`e.g. 30`}
                      className="w-28 h-10 px-3 rounded-xl border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors"
                      autoFocus
                    />
                    {customQtyData?.overMax && (
                      <span className="text-sm text-amber-600">
                        Exceeds max —{" "}
                        <Link href={`/custom-order?product=${product.slug}`} className="text-[#ef8733] hover:underline font-medium">
                          request a quote
                        </Link>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {!isCustomQty && selectedSizeVariant && (
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
        <Button size="lg" fullWidth onClick={handleAddToCart} disabled={addToCartDisabled}>
          {added ? (
            "✓ Added to cart!"
          ) : (
            <><ShoppingCart size={18} /> Add to Cart{!addToCartDisabled && ` — ${formatPrice(displayPrice)}`}</>
          )}
        </Button>
      )}
    </div>
  );
}
