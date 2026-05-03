"use client";

import { useState, useMemo } from "react";
import { Save, CheckCircle2, Plus, Trash2, Calculator } from "lucide-react";
import { Product, VolumeDiscountTier } from "@/lib/types";
import { CostSettings, ProductCostConfig, StandardSize, StandardColour } from "@/lib/server-data";
import { calcRunCosts, calcStickersPerSheet } from "@/lib/pricing";

interface Props {
  products: Product[];
  initialSettings: CostSettings;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const CM_PER_INCH = 2.54;

function fmt(pence: number) {
  return (pence / 100).toFixed(2);
}

function fmtTime(minutes: number) {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputCls =
  "w-full h-10 px-3 rounded-xl border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors bg-white";
const cellInputCls =
  "w-full h-9 px-2.5 rounded-lg border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors bg-white";
const dimInputCls =
  "h-9 px-2.5 rounded-lg border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors bg-white";

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e5e1d8] p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="font-display font-700 text-lg text-[#111111]">{title}</h2>
          {subtitle && <p className="text-[#6b7280] text-sm mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-[#111111] mb-1.5">{children}</label>
  );
}

function CostRow({
  label,
  value,
  bold,
  green,
  orange,
}: {
  label: string;
  value: string;
  bold?: boolean;
  green?: boolean;
  orange?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? "font-semibold text-[#111111]" : "text-[#6b7280]"}`}>
        {label}
      </span>
      <span
        className={`text-sm font-semibold ${
          orange ? "text-[#ef8733] text-base" : green ? "text-emerald-600" : "text-[#111111]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CostsAdmin({ products, initialSettings }: Props) {
  const [settings, setSettings] = useState<CostSettings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [sizeCategory, setSizeCategory] = useState("stickers");
  const [calcProductId, setCalcProductId] = useState("");
  const [calcSizeName, setCalcSizeName] = useState("");
  const [calcQty, setCalcQty] = useState(100);
  const [calcProfitPct, setCalcProfitPct] = useState(initialSettings.targetProfitPercent);

  // ── Global settings ───────────────────────────────────────────────────────

  function updateGlobal<K extends keyof Omit<CostSettings, "materials" | "productConfigs">>(
    field: K,
    value: CostSettings[K]
  ) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  // ── Standard sizes ────────────────────────────────────────────────────────

  const SHEET_CATEGORIES = ["stickers", "vinyl", "coasters", "magnets", "bookmarks"];
  const SIZE_CATEGORY_LABELS: Record<string, string> = {
    stickers: "Stickers", vinyl: "Vinyl", mugs: "Mugs", keyrings: "Keyrings",
    coasters: "Coasters", magnets: "Magnets", tshirts: "T-Shirts", bookmarks: "Bookmarks",
  };
  const isSheetCategory = SHEET_CATEGORIES.includes(sizeCategory);
  const filteredSizes = settings.standardSizes.filter((s) => s.category === sizeCategory);

  function addStandardSize() {
    const s: StandardSize = {
      id: `sz_${Date.now()}`, name: "", category: sizeCategory,
      ...(isSheetCategory ? { widthCm: 0, heightCm: 0 } : {}),
    };
    setSettings((prev) => ({ ...prev, standardSizes: [...prev.standardSizes, s] }));
  }

  function updateStandardSize(id: string, field: keyof StandardSize, value: string | number) {
    setSettings((prev) => ({
      ...prev,
      standardSizes: prev.standardSizes.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }));
  }

  function deleteStandardSize(id: string) {
    setSettings((prev) => ({ ...prev, standardSizes: prev.standardSizes.filter((s) => s.id !== id) }));
  }

  // ── Standard colours ──────────────────────────────────────────────────────

  function addStandardColour() {
    const c: StandardColour = { id: `col_${Date.now()}`, name: "" };
    setSettings((prev) => ({ ...prev, standardColours: [...(prev.standardColours ?? []), c] }));
  }

  function updateStandardColour(id: string, name: string) {
    setSettings((prev) => ({
      ...prev,
      standardColours: prev.standardColours.map((c) => (c.id === id ? { ...c, name } : c)),
    }));
  }

  function deleteStandardColour(id: string) {
    setSettings((prev) => ({ ...prev, standardColours: prev.standardColours.filter((c) => c.id !== id) }));
  }

  // ── Volume discounts ──────────────────────────────────────────────────────

  function addVolumeDiscount() {
    const tier: VolumeDiscountTier = { minQty: 2, discountPercent: 5 };
    setSettings((prev) => ({ ...prev, volumeDiscounts: [...(prev.volumeDiscounts ?? []), tier] }));
  }

  function updateVolumeDiscount(index: number, field: keyof VolumeDiscountTier, value: number) {
    setSettings((prev) => {
      const updated = [...(prev.volumeDiscounts ?? [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, volumeDiscounts: updated };
    });
  }

  function deleteVolumeDiscount(index: number) {
    setSettings((prev) => ({
      ...prev,
      volumeDiscounts: (prev.volumeDiscounts ?? []).filter((_, i) => i !== index),
    }));
  }

  // ── Product configs ───────────────────────────────────────────────────────

  function getConfig(productId: string): ProductCostConfig {
    return settings.productConfigs[productId] ?? { productType: "sticker", batchSize: 10, batchMinutes: 5 };
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    setLoading(true);
    await fetch("/api/admin/costs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  // ── Calculator ────────────────────────────────────────────────────────────

  const calcProduct = products.find((p) => p.id === calcProductId);
  const calcConfig = calcProductId ? (calcProduct?.costConfig ?? getConfig(calcProductId)) : null;
  const calcSizeVariant = calcProduct?.sizeVariants?.find((v) => v.name === calcSizeName) ?? undefined;
  const calcResult = useMemo(() => {
    if (!calcConfig || calcQty < 1) return null;
    return calcRunCosts(calcConfig, settings, calcQty, calcProfitPct, calcSizeVariant);
  }, [calcConfig, settings, calcQty, calcProfitPct, calcSizeVariant]);

  const calcMaterialNames = (calcConfig?.materialIds ?? [])
    .map((id) => settings.materials.find((m) => m.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl flex flex-col gap-6">

      {/* 1. Global Settings */}
      <SectionCard
        title="Global Settings"
        subtitle="Defaults applied to all products unless overridden on a product."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label>Hourly Rate (£)</Label>
            <input type="number" step="0.50" min="0" className={inputCls}
              value={fmt(settings.hourlyRatePence)}
              onChange={(e) => updateGlobal("hourlyRatePence", Math.round(parseFloat(e.target.value || "0") * 100))}
            />
            <p className="text-xs text-[#6b7280] mt-1">Pro-rata labour cost</p>
          </div>
          <div>
            <Label>Target Profit %</Label>
            <input type="number" step="1" min="0" max="999" className={inputCls}
              value={settings.targetProfitPercent}
              onChange={(e) => { const v = parseFloat(e.target.value || "0"); updateGlobal("targetProfitPercent", v); setCalcProfitPct(v); }}
            />
          </div>
          <div>
            <Label>Default Postage / order (£)</Label>
            <input type="number" step="0.01" min="0" className={inputCls}
              value={fmt(settings.defaultPostagePence)}
              onChange={(e) => updateGlobal("defaultPostagePence", Math.round(parseFloat(e.target.value || "0") * 100))}
            />
          </div>
          <div>
            <Label>Default Ink / sheet — stickers (£)</Label>
            <input type="number" step="0.01" min="0" className={inputCls}
              value={fmt(settings.defaultInkCostPence)}
              onChange={(e) => updateGlobal("defaultInkCostPence", Math.round(parseFloat(e.target.value || "0") * 100))}
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#e5e1d8]">
          <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-3">Printable Sheet / Roll Sizes</p>
          <div className="flex flex-col gap-4">
            {(
              [
                { label: "Sticker Sheet",    wKey: "sheetWidthCm",        hKey: "sheetHeightCm"        },
                { label: "Permanent Vinyl",  wKey: "vinylWidthCm",        hKey: "vinylHeightCm"        },
                { label: "Heat Vinyl",       wKey: "heatVinylWidthCm",    hKey: "heatVinylHeightCm"    },
                { label: "Heat Transfers",   wKey: "heatTransferWidthCm", hKey: "heatTransferHeightCm" },
              ] as const
            ).map(({ label, wKey, hKey }) => (
              <div key={label}>
                <p className="text-xs font-medium text-[#111111] mb-2">{label}</p>
                <div className="grid sm:grid-cols-4 gap-3">
                  <div>
                    <Label>Width (cm)</Label>
                    <input type="number" step="0.01" min="0" className={inputCls}
                      value={settings[wKey].toFixed(2)}
                      onChange={(e) => updateGlobal(wKey, parseFloat(e.target.value || "0"))}
                    />
                  </div>
                  <div>
                    <Label>Height (cm)</Label>
                    <input type="number" step="0.01" min="0" className={inputCls}
                      value={settings[hKey].toFixed(2)}
                      onChange={(e) => updateGlobal(hKey, parseFloat(e.target.value || "0"))}
                    />
                  </div>
                  <div>
                    <Label>Width (in)</Label>
                    <input type="number" step="0.001" min="0" className={inputCls}
                      value={(settings[wKey] / CM_PER_INCH).toFixed(3)}
                      onChange={(e) => updateGlobal(wKey, parseFloat(e.target.value || "0") * CM_PER_INCH)}
                    />
                  </div>
                  <div>
                    <Label>Height (in)</Label>
                    <input type="number" step="0.001" min="0" className={inputCls}
                      value={(settings[hKey] / CM_PER_INCH).toFixed(3)}
                      onChange={(e) => updateGlobal(hKey, parseFloat(e.target.value || "0") * CM_PER_INCH)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* 2. Standard Sizes */}
      <SectionCard
        title="Standard Sizes"
        subtitle="Define the sizes you offer per product type. Sheet-based products (stickers, coasters, etc.) store dimensions for cost calculations. Other products store named options that sync onto the product as a Size option."
        action={
          <button type="button" onClick={addStandardSize}
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#111111] text-white rounded-xl text-sm font-semibold hover:bg-[#222] transition-colors cursor-pointer shrink-0">
            <Plus size={14} /> Add Size
          </button>
        }
      >
        <div className="mb-4 flex items-center gap-4">
          <label className="text-sm font-semibold text-[#111111]">Max order quantity</label>
          <input type="number" step="1" min="1"
            className="h-9 w-28 px-2.5 rounded-lg border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors bg-white"
            value={settings.maxOrderQty}
            onChange={(e) => updateGlobal("maxOrderQty", parseInt(e.target.value || "1000"))}
          />
          <span className="text-xs text-[#6b7280]">Above this → customer sent to quote</span>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {Object.entries(SIZE_CATEGORY_LABELS).map(([val, label]) => {
            const count = settings.standardSizes.filter((s) => s.category === val).length;
            return (
              <button key={val} type="button" onClick={() => setSizeCategory(val)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  sizeCategory === val
                    ? "bg-[#ef8733] text-white"
                    : "bg-[#f0ede8] text-[#111111] hover:bg-[#e5e1d8]"
                }`}>
                {label} {count > 0 && <span className="opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>

        {filteredSizes.length === 0 ? (
          <p className="text-sm text-[#6b7280] py-6 text-center border-2 border-dashed border-[#e5e1d8] rounded-xl">
            No {SIZE_CATEGORY_LABELS[sizeCategory]} sizes yet. Click &ldquo;Add Size&rdquo; to get started.
          </p>
        ) : isSheetCategory ? (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[1fr_80px_80px_80px_80px_58px_58px_58px_58px_40px] gap-2 px-1 mb-1">
              <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Name</span>
              <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">H (cm)</span>
              <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">W (cm)</span>
              <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">H (in)</span>
              <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">W (in)</span>
              <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider text-center leading-tight">/sheet</span>
              <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider text-center leading-tight">Vinyl</span>
              <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider text-center leading-tight">H.Vinyl</span>
              <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider text-center leading-tight">H.Xfer</span>
              <span />
            </div>
            {filteredSizes.map((size) => {
              const perSticker = calcStickersPerSheet(size.widthCm, size.heightCm, settings.sheetWidthCm, settings.sheetHeightCm);
              const perVinyl   = calcStickersPerSheet(size.widthCm, size.heightCm, settings.vinylWidthCm, settings.vinylHeightCm);
              const perHVinyl  = calcStickersPerSheet(size.widthCm, size.heightCm, settings.heatVinylWidthCm, settings.heatVinylHeightCm);
              const perHXfer   = calcStickersPerSheet(size.widthCm, size.heightCm, settings.heatTransferWidthCm, settings.heatTransferHeightCm);
              return (
                <div key={size.id} className="grid grid-cols-[1fr_80px_80px_80px_80px_58px_58px_58px_58px_40px] gap-2 items-center">
                  <input type="text" placeholder="e.g. 3×3 cm, A6, Small" className={cellInputCls}
                    value={size.name} onChange={(e) => updateStandardSize(size.id, "name", e.target.value)} />
                  <input type="number" step="0.01" min="0" placeholder="0.00" className={`${dimInputCls} w-full`}
                    value={size.heightCm || ""}
                    onChange={(e) => updateStandardSize(size.id, "heightCm", parseFloat(e.target.value || "0"))} />
                  <input type="number" step="0.01" min="0" placeholder="0.00" className={`${dimInputCls} w-full`}
                    value={size.widthCm || ""}
                    onChange={(e) => updateStandardSize(size.id, "widthCm", parseFloat(e.target.value || "0"))} />
                  <input type="number" step="0.001" min="0" placeholder="0.000" className={`${dimInputCls} w-full`}
                    value={size.heightCm ? (size.heightCm / CM_PER_INCH).toFixed(3) : ""}
                    onChange={(e) => updateStandardSize(size.id, "heightCm", parseFloat(e.target.value || "0") * CM_PER_INCH)} />
                  <input type="number" step="0.001" min="0" placeholder="0.000" className={`${dimInputCls} w-full`}
                    value={size.widthCm ? (size.widthCm / CM_PER_INCH).toFixed(3) : ""}
                    onChange={(e) => updateStandardSize(size.id, "widthCm", parseFloat(e.target.value || "0") * CM_PER_INCH)} />
                  {[perSticker, perVinyl, perHVinyl, perHXfer].map((n, i) => (
                    <span key={i} className={`text-sm font-semibold text-center ${n > 0 ? "text-[#111111]" : "text-[#d1d5db]"}`}>
                      {n > 0 ? n : "—"}
                    </span>
                  ))}
                  <button type="button" onClick={() => deleteStandardSize(size.id)}
                    className="h-9 w-9 flex items-center justify-center rounded-lg text-[#6b7280] hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer">
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-[#6b7280] mb-1">
              These names will appear as the <strong>Size</strong> option on {SIZE_CATEGORY_LABELS[sizeCategory]} products when you click &ldquo;Sync Options&rdquo; in the product editor.
            </p>
            {filteredSizes.map((size) => (
              <div key={size.id} className="grid grid-cols-[1fr_40px] gap-2 items-center">
                <input type="text" placeholder={`e.g. ${sizeCategory === "tshirts" ? "S, M, L, XL" : sizeCategory === "mugs" ? "11oz, 15oz" : "Small, Medium, Large"}`}
                  className={cellInputCls} value={size.name}
                  onChange={(e) => updateStandardSize(size.id, "name", e.target.value)} />
                <button type="button" onClick={() => deleteStandardSize(size.id)}
                  className="h-9 w-9 flex items-center justify-center rounded-lg text-[#6b7280] hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* 3. Standard Colours */}
      <SectionCard
        title="Standard Colours"
        subtitle="Define your available t-shirt and vinyl colour palette. Use 'Sync Colours' in the product editor to apply them."
        action={
          <button type="button" onClick={addStandardColour}
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#ef8733] text-white rounded-xl text-sm font-semibold hover:bg-[#ea7316] transition-colors cursor-pointer">
            <Plus size={15} /> Add Colour
          </button>
        }
      >
        {(settings.standardColours ?? []).length === 0 ? (
          <p className="text-sm text-[#6b7280] py-6 text-center border-2 border-dashed border-[#e5e1d8] rounded-xl">
            No colours yet. Click &ldquo;Add Colour&rdquo; to build your palette.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {(settings.standardColours ?? []).map((c) => (
              <div key={c.id} className="grid grid-cols-[1fr_40px] gap-2 items-center">
                <input type="text" placeholder="e.g. White, Black, Navy Blue, Red"
                  className={cellInputCls} value={c.name}
                  onChange={(e) => updateStandardColour(c.id, e.target.value)} />
                <button type="button" onClick={() => deleteStandardColour(c.id)}
                  className="h-9 w-9 flex items-center justify-center rounded-lg text-[#6b7280] hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* 4. Production Run Calculator */}
      <SectionCard
        title="Production Run Calculator"
        subtitle="Select a product and quantity to get a full cost and pricing breakdown."
        action={<Calculator size={20} className="text-[#ef8733] mt-0.5" />}
      >
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div>
            <Label>Product</Label>
            <select className={inputCls} value={calcProductId}
              onChange={(e) => { setCalcProductId(e.target.value); setCalcSizeName(""); }}>
              <option value="">Select a product…</option>
              {products.map((pr) => <option key={pr.id} value={pr.id}>{pr.name}</option>)}
            </select>
          </div>
          {calcProduct?.sizeVariants?.length ? (
            <div>
              <Label>Size</Label>
              <select className={inputCls} value={calcSizeName} onChange={(e) => setCalcSizeName(e.target.value)}>
                <option value="">— any (use cost config dims) —</option>
                {calcProduct.sizeVariants.map((v) => (
                  <option key={v.name} value={v.name}>{v.name} · {v.stickersPerSheet}/sheet</option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <Label>Quantity</Label>
            <input type="number" step="1" min="1" className={inputCls}
              value={calcQty}
              onChange={(e) => setCalcQty(Math.max(1, parseInt(e.target.value || "1")))}
            />
          </div>
          <div>
            <Label>Profit %</Label>
            <input type="number" step="1" min="0" max="999" className={inputCls}
              value={calcProfitPct}
              onChange={(e) => setCalcProfitPct(parseFloat(e.target.value || "0"))}
            />
          </div>
        </div>

        {calcResult ? (
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-[#f9f7f4] rounded-xl p-5 flex flex-col gap-2.5">
              <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">
                Cost Breakdown — {calcQty} units
              </p>
              <CostRow
                label={`Materials${calcMaterialNames ? ` (${calcMaterialNames})` : " (none set)"}${calcResult.isSticker && calcResult.perSheet > 0 ? ` · ${calcResult.sheetsNeeded} sheet${calcResult.sheetsNeeded !== 1 ? "s" : ""}` : ""}`}
                value={`£${fmt(calcResult.materialCost)}`}
              />
              <CostRow label="Ink" value={`£${fmt(calcResult.inkCost)}`} />
              <CostRow label={`Labour — ${fmtTime(calcResult.labourMinutes)}`} value={`£${fmt(calcResult.labourCost)}`} />
              <CostRow label="Postage" value={`£${fmt(calcResult.postageCost)}`} />
              <div className="border-t border-[#e5e1d8] pt-2.5">
                <CostRow label="Total Cost" value={`£${fmt(calcResult.totalCost)}`} bold />
              </div>
            </div>

            <div className="bg-[#f9f7f4] rounded-xl p-5 flex flex-col gap-2.5">
              <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">
                Suggested Pricing — {calcProfitPct}% margin
              </p>
              <CostRow label="Total Cost" value={`£${fmt(calcResult.totalCost)}`} />
              <CostRow label="Profit" value={`+£${fmt(calcResult.profit)}`} green />
              <div className="border-t border-[#e5e1d8] pt-2.5">
                <CostRow label="Sell for (order total)" value={`£${fmt(calcResult.suggestedPrice)}`} bold orange />
              </div>
              <CostRow label={`Per unit (÷ ${calcQty})`} value={`£${fmt(calcResult.pricePerUnit)}`} />
              <div className="mt-2 p-3 bg-white rounded-lg border border-[#e5e1d8]">
                {calcResult.isSticker && calcResult.perSheet > 0 && (
                  <p className="text-xs text-[#6b7280]">
                    {calcProduct?.costConfig?.productType === "sticker-sheet"
                      ? <><span className="font-medium text-[#111111]">{calcResult.perSheet} sheets/page</span>{" · "}<span className="font-medium text-[#111111]">{calcResult.sheetsNeeded} page{calcResult.sheetsNeeded !== 1 ? "s" : ""}</span> needed</>
                      : <><span className="font-medium text-[#111111]">{calcResult.perSheet} stickers/sheet</span>{" · "}<span className="font-medium text-[#111111]">{calcResult.sheetsNeeded} sheet{calcResult.sheetsNeeded !== 1 ? "s" : ""}</span> needed</>
                    }
                  </p>
                )}
                {calcResult.isSticker && calcResult.perSheet === 0 && (
                  <p className="text-xs text-[#6b7280]">
                    {calcProduct?.costConfig?.productType === "sticker-sheet"
                      ? "Set Sheets per page in the product’s Cost Setup."
                      : "Set sticker dimensions in the product’s Cost Setup, or select a size above."}
                  </p>
                )}
                <p className="text-xs text-[#6b7280] mt-1">
                  Labour: <span className="font-medium text-[#111111]">{fmtTime(calcResult.labourMinutes)}</span> at £{fmt(settings.hourlyRatePence)}/hr = <span className="font-medium text-[#111111]">£{fmt(calcResult.labourCost)}</span>
                </p>
                {calcConfig && (
                  <p className="text-xs text-[#6b7280] mt-1">
                    Rate: {calcConfig.batchSize} units every {calcConfig.batchMinutes} min · {Math.ceil(calcQty / calcConfig.batchSize)} batch{Math.ceil(calcQty / calcConfig.batchSize) !== 1 ? "es" : ""}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-[#e5e1d8] rounded-xl text-[#6b7280] text-sm">
            {calcProductId
              ? "Configure batch size and batch time on the product's edit page, then return here."
              : "Select a product and enter a quantity to see the full breakdown."}
          </div>
        )}
      </SectionCard>

      {/* Volume Discounts */}
      <SectionCard
        title="Volume Discounts"
        subtitle="Automatic % discount when customers buy more of the same product. Applies to products without sheet-based tiered pricing."
        action={
          <button
            type="button"
            onClick={addVolumeDiscount}
            className="inline-flex items-center gap-1.5 h-8 px-3 bg-[#111111] text-white rounded-xl text-xs font-semibold hover:bg-[#222] transition-colors cursor-pointer"
          >
            <Plus size={13} /> Add Tier
          </button>
        }
      >
        {(settings.volumeDiscounts ?? []).length === 0 ? (
          <p className="text-sm text-[#6b7280] py-4 text-center border-2 border-dashed border-[#e5e1d8] rounded-xl">
            No volume discounts set. Click &ldquo;Add Tier&rdquo; to create one.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {(settings.volumeDiscounts ?? [])
              .slice()
              .sort((a, b) => a.minQty - b.minQty)
              .map((tier, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#f9f7f4] rounded-xl">
                  <span className="text-sm text-[#6b7280] shrink-0">Buy</span>
                  <input
                    type="number" min="2" step="1"
                    value={tier.minQty}
                    onChange={(e) => updateVolumeDiscount(i, "minQty", parseInt(e.target.value || "2"))}
                    className={`${dimInputCls} w-20`}
                  />
                  <span className="text-sm text-[#6b7280] shrink-0">or more →</span>
                  <input
                    type="number" min="1" step="1" max="99"
                    value={tier.discountPercent}
                    onChange={(e) => updateVolumeDiscount(i, "discountPercent", parseFloat(e.target.value || "0"))}
                    className={`${dimInputCls} w-20`}
                  />
                  <span className="text-sm text-[#6b7280] shrink-0">% off</span>
                  <button
                    type="button"
                    onClick={() => deleteVolumeDiscount(i)}
                    className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-[#d1c8bc] hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
          </div>
        )}
      </SectionCard>

      {/* Save */}
      <div className="flex items-center gap-3 pb-6">
        <button type="button" onClick={handleSave} disabled={loading}
          className="inline-flex items-center gap-2 h-11 px-6 bg-[#ef8733] text-white rounded-xl font-semibold text-sm hover:bg-[#ea7316] transition-colors disabled:opacity-50 cursor-pointer">
          <Save size={16} /> {loading ? "Saving…" : "Save All"}
        </button>
        {saved && (
          <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
            <CheckCircle2 size={16} /> Saved!
          </div>
        )}
      </div>
    </div>
  );
}
