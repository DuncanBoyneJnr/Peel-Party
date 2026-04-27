"use client";

import { useState, useMemo } from "react";
import { Save, CheckCircle2, Plus, Trash2, Calculator, Layers, Settings2 } from "lucide-react";
import { Product, ProductType } from "@/lib/types";
import { CostSettings, MaterialType, ProductCostConfig, StandardSize } from "@/lib/server-data";
import { calcRunCosts, calcStickersPerSheet } from "@/lib/pricing";

interface Props {
  products: Product[];
  initialSettings: CostSettings;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const CM_PER_INCH = 2.54;

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  sticker: "Sticker Sheet",
  cup: "Cup / Mug",
  tshirt: "T-Shirt",
  other: "Other (per unit)",
};

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
          orange
            ? "text-[#ef8733] text-base"
            : green
            ? "text-emerald-600"
            : "text-[#111111]"
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
  const [activeTab, setActiveTab] = useState<"pricing" | "materials">("pricing");

  // Calculator state
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

  // ── Materials ─────────────────────────────────────────────────────────────

  function addMaterial() {
    const mat: MaterialType = {
      id: `mat_${Date.now()}`,
      name: "",
      productType: "sticker",
      costPencePerSheet: 0,
      costPencePerUnit: 0,
    };
    setSettings((prev) => ({ ...prev, materials: [...prev.materials, mat] }));
  }

  function updateMaterial(id: string, field: keyof MaterialType, value: string | number) {
    setSettings((prev) => ({
      ...prev,
      materials: prev.materials.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    }));
  }

  function deleteMaterial(id: string) {
    setSettings((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.id !== id),
      productConfigs: Object.fromEntries(
        Object.entries(prev.productConfigs).map(([pid, cfg]) => [
          pid,
          { ...cfg, materialIds: (cfg.materialIds ?? []).filter((mid) => mid !== id) },
        ])
      ),
    }));
  }

  // ── Standard sizes ────────────────────────────────────────────────────────

  function addStandardSize() {
    const s: StandardSize = { id: `sz_${Date.now()}`, name: "", widthCm: 0, heightCm: 0 };
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

  // ── Product configs ───────────────────────────────────────────────────────

  function getConfig(productId: string): ProductCostConfig {
    return (
      settings.productConfigs[productId] ?? {
        productType: "sticker",
        batchSize: 10,
        batchMinutes: 5,
      }
    );
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
  const calcConfig = calcProductId
    ? (calcProduct?.costConfig ?? getConfig(calcProductId))
    : null;
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

      {/* Tab bar */}
      <div className="flex gap-1 bg-[#f0ede8] p-1 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("pricing")}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "pricing"
              ? "bg-white text-[#111111] shadow-sm"
              : "text-[#6b7280] hover:text-[#111111]"
          }`}
        >
          <Settings2 size={15} /> Pricing Setup
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("materials")}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "materials"
              ? "bg-white text-[#111111] shadow-sm"
              : "text-[#6b7280] hover:text-[#111111]"
          }`}
        >
          <Layers size={15} /> Materials
          {settings.materials.length > 0 && (
            <span className="ml-0.5 bg-[#ef8733] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {settings.materials.length}
            </span>
          )}
        </button>
      </div>

      {/* ── PRICING SETUP TAB ── */}
      {activeTab === "pricing" && (
        <>
          {/* 1. Global Settings */}
          <SectionCard
            title="Global Settings"
            subtitle="Defaults applied to all products unless overridden on a product."
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Hourly Rate (£)</Label>
                <input
                  type="number" step="0.50" min="0"
                  className={inputCls}
                  value={fmt(settings.hourlyRatePence)}
                  onChange={(e) =>
                    updateGlobal("hourlyRatePence", Math.round(parseFloat(e.target.value || "0") * 100))
                  }
                />
                <p className="text-xs text-[#6b7280] mt-1">Pro-rata labour cost</p>
              </div>
              <div>
                <Label>Target Profit %</Label>
                <input
                  type="number" step="1" min="0" max="99"
                  className={inputCls}
                  value={settings.targetProfitPercent}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value || "0");
                    updateGlobal("targetProfitPercent", v);
                    setCalcProfitPct(v);
                  }}
                />
              </div>
              <div>
                <Label>Default Postage / order (£)</Label>
                <input
                  type="number" step="0.01" min="0"
                  className={inputCls}
                  value={fmt(settings.defaultPostagePence)}
                  onChange={(e) =>
                    updateGlobal("defaultPostagePence", Math.round(parseFloat(e.target.value || "0") * 100))
                  }
                />
              </div>
              <div>
                <Label>Default Ink / unit (£)</Label>
                <input
                  type="number" step="0.01" min="0"
                  className={inputCls}
                  value={fmt(settings.defaultInkCostPence)}
                  onChange={(e) =>
                    updateGlobal("defaultInkCostPence", Math.round(parseFloat(e.target.value || "0") * 100))
                  }
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#e5e1d8]">
              <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-3">
                Printable Sheet Size
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Sheet Width (cm)</Label>
                  <input
                    type="number" step="0.01" min="0"
                    className={inputCls}
                    value={settings.sheetWidthCm.toFixed(2)}
                    onChange={(e) => updateGlobal("sheetWidthCm", parseFloat(e.target.value || "0"))}
                  />
                </div>
                <div>
                  <Label>Sheet Height (cm)</Label>
                  <input
                    type="number" step="0.01" min="0"
                    className={inputCls}
                    value={settings.sheetHeightCm.toFixed(2)}
                    onChange={(e) => updateGlobal("sheetHeightCm", parseFloat(e.target.value || "0"))}
                  />
                </div>
                <div>
                  <Label>Sheet Width (in)</Label>
                  <input
                    type="number" step="0.001" min="0"
                    className={inputCls}
                    value={(settings.sheetWidthCm / CM_PER_INCH).toFixed(3)}
                    onChange={(e) =>
                      updateGlobal("sheetWidthCm", parseFloat(e.target.value || "0") * CM_PER_INCH)
                    }
                  />
                </div>
                <div>
                  <Label>Sheet Height (in)</Label>
                  <input
                    type="number" step="0.001" min="0"
                    className={inputCls}
                    value={(settings.sheetHeightCm / CM_PER_INCH).toFixed(3)}
                    onChange={(e) =>
                      updateGlobal("sheetHeightCm", parseFloat(e.target.value || "0") * CM_PER_INCH)
                    }
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 2. Standard Sizes */}
          <SectionCard
            title="Standard Sizes"
            subtitle="Define the sizes you offer for sticker products. These auto-sync onto products in the Product admin."
            action={
              <button
                type="button"
                onClick={addStandardSize}
                className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#111111] text-white rounded-xl text-sm font-semibold hover:bg-[#222] transition-colors cursor-pointer shrink-0"
              >
                <Plus size={14} /> Add Size
              </button>
            }
          >
            <div className="mb-4 flex items-center gap-4">
              <label className="text-sm font-semibold text-[#111111]">Max order quantity</label>
              <input
                type="number" step="1" min="1"
                className="h-9 w-28 px-2.5 rounded-lg border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors bg-white"
                value={settings.maxOrderQty}
                onChange={(e) => updateGlobal("maxOrderQty", parseInt(e.target.value || "1000"))}
              />
              <span className="text-xs text-[#6b7280]">Above this → customer sent to quote</span>
            </div>

            {settings.standardSizes.length === 0 ? (
              <p className="text-sm text-[#6b7280] py-6 text-center border-2 border-dashed border-[#e5e1d8] rounded-xl">
                No sizes yet. Click &ldquo;Add Size&rdquo; to get started.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-[1fr_90px_90px_90px_90px_70px_40px] gap-2 px-1 mb-1">
                  <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Name</span>
                  <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">H (cm)</span>
                  <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">W (cm)</span>
                  <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">H (in)</span>
                  <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">W (in)</span>
                  <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">/sheet</span>
                  <span />
                </div>
                {settings.standardSizes.map((size) => {
                  const perSheet = calcStickersPerSheet(size.widthCm, size.heightCm, settings.sheetWidthCm, settings.sheetHeightCm);
                  return (
                    <div key={size.id} className="grid grid-cols-[1fr_90px_90px_90px_90px_70px_40px] gap-2 items-center">
                      <input
                        type="text" placeholder="e.g. 3×3 cm, A6, Small"
                        className={cellInputCls}
                        value={size.name}
                        onChange={(e) => updateStandardSize(size.id, "name", e.target.value)}
                      />
                      <input
                        type="number" step="0.01" min="0" placeholder="0.00"
                        className={`${dimInputCls} w-full`}
                        value={size.heightCm || ""}
                        onChange={(e) => updateStandardSize(size.id, "heightCm", parseFloat(e.target.value || "0"))}
                      />
                      <input
                        type="number" step="0.01" min="0" placeholder="0.00"
                        className={`${dimInputCls} w-full`}
                        value={size.widthCm || ""}
                        onChange={(e) => updateStandardSize(size.id, "widthCm", parseFloat(e.target.value || "0"))}
                      />
                      <input
                        type="number" step="0.001" min="0" placeholder="0.000"
                        className={`${dimInputCls} w-full`}
                        value={size.heightCm ? (size.heightCm / CM_PER_INCH).toFixed(3) : ""}
                        onChange={(e) =>
                          updateStandardSize(size.id, "heightCm", parseFloat(e.target.value || "0") * CM_PER_INCH)
                        }
                      />
                      <input
                        type="number" step="0.001" min="0" placeholder="0.000"
                        className={`${dimInputCls} w-full`}
                        value={size.widthCm ? (size.widthCm / CM_PER_INCH).toFixed(3) : ""}
                        onChange={(e) =>
                          updateStandardSize(size.id, "widthCm", parseFloat(e.target.value || "0") * CM_PER_INCH)
                        }
                      />
                      <span className={`text-sm font-semibold text-center ${perSheet > 0 ? "text-[#111111]" : "text-[#d1d5db]"}`}>
                        {perSheet > 0 ? perSheet : "—"}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteStandardSize(size.id)}
                        className="h-9 w-9 flex items-center justify-center rounded-lg text-[#6b7280] hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* 3. Production Run Calculator */}
          <SectionCard
            title="Production Run Calculator"
            subtitle="Select a product and quantity to get a full cost and pricing breakdown."
            action={<Calculator size={20} className="text-[#ef8733] mt-0.5" />}
          >
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div>
                <Label>Product</Label>
                <select
                  className={inputCls}
                  value={calcProductId}
                  onChange={(e) => { setCalcProductId(e.target.value); setCalcSizeName(""); }}
                >
                  <option value="">Select a product…</option>
                  {products.map((pr) => (
                    <option key={pr.id} value={pr.id}>{pr.name}</option>
                  ))}
                </select>
              </div>
              {calcProduct?.sizeVariants?.length ? (
                <div>
                  <Label>Size</Label>
                  <select
                    className={inputCls}
                    value={calcSizeName}
                    onChange={(e) => setCalcSizeName(e.target.value)}
                  >
                    <option value="">— any (use cost config dims) —</option>
                    {calcProduct.sizeVariants.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} · {v.stickersPerSheet}/sheet
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              <div>
                <Label>Quantity</Label>
                <input
                  type="number" step="1" min="1"
                  className={inputCls}
                  value={calcQty}
                  onChange={(e) => setCalcQty(Math.max(1, parseInt(e.target.value || "1")))}
                />
              </div>
              <div>
                <Label>Profit %</Label>
                <input
                  type="number" step="1" min="0" max="99"
                  className={inputCls}
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
                    label={
                      calcResult.isSticker
                        ? `Materials${calcMaterialNames ? ` (${calcMaterialNames})` : " (none set)"}${calcResult.perSheet > 0 ? ` · ${calcResult.sheetsNeeded} sheet${calcResult.sheetsNeeded !== 1 ? "s" : ""}` : ""}`
                        : `Materials${calcMaterialNames ? ` (${calcMaterialNames})` : " (none set)"} · ${calcQty} units`
                    }
                    value={`£${fmt(calcResult.materialCost)}`}
                  />
                  <CostRow label="Ink" value={`£${fmt(calcResult.inkCost)}`} />
                  <CostRow
                    label={`Labour — ${fmtTime(calcResult.labourMinutes)}`}
                    value={`£${fmt(calcResult.labourCost)}`}
                  />
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
                    <CostRow
                      label="Sell for (order total)"
                      value={`£${fmt(calcResult.suggestedPrice)}`}
                      bold
                      orange
                    />
                  </div>
                  <CostRow
                    label={`Per unit (÷ ${calcQty})`}
                    value={`£${fmt(calcResult.pricePerUnit)}`}
                  />
                  <div className="mt-2 p-3 bg-white rounded-lg border border-[#e5e1d8]">
                    {calcResult.isSticker && calcResult.perSheet > 0 && (
                      <p className="text-xs text-[#6b7280]">
                        Sheet layout:{" "}
                        <span className="font-medium text-[#111111]">
                          {calcResult.perSheet} stickers/sheet
                        </span>
                        {" · "}
                        <span className="font-medium text-[#111111]">
                          {calcResult.sheetsNeeded} sheet{calcResult.sheetsNeeded !== 1 ? "s" : ""}
                        </span>{" "}
                        needed
                      </p>
                    )}
                    {calcResult.isSticker && calcResult.perSheet === 0 && (
                      <p className="text-xs text-[#6b7280]">
                        Set sticker dimensions in the product&apos;s Cost Setup, or select a size above.
                      </p>
                    )}
                    <p className="text-xs text-[#6b7280] mt-1">
                      Labour:{" "}
                      <span className="font-medium text-[#111111]">
                        {fmtTime(calcResult.labourMinutes)}
                      </span>{" "}
                      at £{fmt(settings.hourlyRatePence)}/hr ={" "}
                      <span className="font-medium text-[#111111]">
                        £{fmt(calcResult.labourCost)}
                      </span>
                    </p>
                    {calcConfig && (
                      <p className="text-xs text-[#6b7280] mt-1">
                        Rate: {calcConfig.batchSize} units every {calcConfig.batchMinutes} min
                        {" · "}
                        {Math.ceil(calcQty / calcConfig.batchSize)} batch
                        {Math.ceil(calcQty / calcConfig.batchSize) !== 1 ? "es" : ""}
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
        </>
      )}

      {/* ── MATERIALS TAB ── */}
      {activeTab === "materials" && (
        <SectionCard
          title="Materials"
          subtitle="Define every material used in production. Sticker-type materials are costed per A4 sheet; all others are costed per unit."
          action={
            <button
              type="button"
              onClick={addMaterial}
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#111111] text-white rounded-xl text-sm font-semibold hover:bg-[#222] transition-colors cursor-pointer shrink-0"
            >
              <Plus size={14} /> Add Material
            </button>
          }
        >
          {settings.materials.length === 0 ? (
            <p className="text-sm text-[#6b7280] py-6 text-center border-2 border-dashed border-[#e5e1d8] rounded-xl">
              No materials yet. Click &ldquo;Add Material&rdquo; to get started.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-[1fr_160px_160px_40px] gap-3 px-1 mb-1">
                <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                  Material Name
                </span>
                <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                  Product Type
                </span>
                <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                  Cost (£)
                </span>
                <span />
              </div>
              {settings.materials.map((mat) => {
                const matIsSticker = !mat.productType || mat.productType === "sticker";
                return (
                  <div
                    key={mat.id}
                    className="grid grid-cols-[1fr_160px_160px_40px] gap-3 items-center"
                  >
                    <input
                      type="text"
                      placeholder="e.g. Holographic Sheet, Blank Mug, White T-Shirt…"
                      className={cellInputCls}
                      value={mat.name}
                      onChange={(e) => updateMaterial(mat.id, "name", e.target.value)}
                    />
                    <select
                      className={cellInputCls}
                      value={mat.productType ?? "sticker"}
                      onChange={(e) =>
                        updateMaterial(mat.id, "productType", e.target.value as ProductType)
                      }
                    >
                      {(Object.keys(PRODUCT_TYPE_LABELS) as ProductType[]).map((t) => (
                        <option key={t} value={t}>
                          {PRODUCT_TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                    <div className="relative">
                      <input
                        type="number" step="0.01" min="0" placeholder="0.00"
                        className={cellInputCls}
                        value={fmt(matIsSticker ? mat.costPencePerSheet : mat.costPencePerUnit)}
                        onChange={(e) =>
                          updateMaterial(
                            mat.id,
                            matIsSticker ? "costPencePerSheet" : "costPencePerUnit",
                            Math.round(parseFloat(e.target.value || "0") * 100)
                          )
                        }
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#9ca3af] pointer-events-none">
                        {matIsSticker ? "/sheet" : "/unit"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteMaterial(mat.id)}
                      className="h-9 w-9 flex items-center justify-center rounded-lg text-[#6b7280] hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-[#e5e1d8]">
            <p className="text-xs text-[#6b7280]">
              <strong className="text-[#111111]">Sticker Sheet</strong> — cost per A4 sheet of material (e.g. vinyl paper, holo laminate).
              The calculator divides stickers-per-sheet into quantity to find how many sheets are needed.
              <br />
              <strong className="text-[#111111]">Cup / Mug, T-Shirt, Other</strong> — cost per blank unit.
            </p>
          </div>
        </SectionCard>
      )}

      {/* ── Save ── */}
      <div className="flex items-center gap-3 pb-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 h-11 px-6 bg-[#ef8733] text-white rounded-xl font-semibold text-sm hover:bg-[#ea7316] transition-colors disabled:opacity-50 cursor-pointer"
        >
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
