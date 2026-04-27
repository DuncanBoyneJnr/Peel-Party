"use client";

import { useState, useMemo } from "react";
import { Save, CheckCircle2, Plus, Trash2, Calculator } from "lucide-react";
import { Product } from "@/lib/types";
import { CostSettings, MaterialType, ProductCostConfig, ProductType } from "@/lib/server-data";

interface Props {
  products: Product[];
  initialSettings: CostSettings;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

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

function calcStickersPerSheet(
  widthCm: number | undefined,
  heightCm: number | undefined,
  sheetW: number,
  sheetH: number
): number {
  if (!widthCm || !heightCm) return 0;
  const normal = Math.floor(sheetW / widthCm) * Math.floor(sheetH / heightCm);
  const rotated = Math.floor(sheetW / heightCm) * Math.floor(sheetH / widthCm);
  return Math.max(normal, rotated, 0);
}

function fmtTime(minutes: number) {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function calcRunCosts(
  config: ProductCostConfig,
  settings: CostSettings,
  quantity: number,
  profitPct: number
) {
  const material = settings.materials.find((m) => m.id === config.materialId);
  const isSticker = !config.productType || config.productType === "sticker";
  const perSheet = isSticker
    ? calcStickersPerSheet(config.widthCm, config.heightCm, settings.sheetWidthCm, settings.sheetHeightCm)
    : 0;
  const sheetsNeeded = perSheet > 0 ? Math.ceil(quantity / perSheet) : 0;
  const materialCost = material
    ? isSticker
      ? sheetsNeeded * material.costPencePerSheet
      : quantity * material.costPencePerUnit
    : 0;
  const inkCost = quantity * (config.inkCostPence ?? settings.defaultInkCostPence);
  const batches = config.batchSize > 0 ? Math.ceil(quantity / config.batchSize) : 0;
  const labourMinutes = batches * config.batchMinutes;
  const labourCost = Math.round((labourMinutes / 60) * settings.hourlyRatePence);
  const postageCost = config.postagePence ?? settings.defaultPostagePence;
  const totalCost = materialCost + inkCost + labourCost + postageCost;
  const suggestedPrice =
    profitPct < 100
      ? Math.round(totalCost / (1 - profitPct / 100))
      : totalCost * 2;
  const profit = suggestedPrice - totalCost;
  const pricePerUnit = quantity > 0 ? Math.round(suggestedPrice / quantity) : 0;
  return {
    isSticker,
    perSheet,
    sheetsNeeded,
    materialCost,
    inkCost,
    labourMinutes,
    labourCost,
    postageCost,
    totalCost,
    profit,
    suggestedPrice,
    pricePerUnit,
  };
}

// ── Shared styles ────────────────────────────────────────────────────────────

const inputCls =
  "w-full h-10 px-3 rounded-xl border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors bg-white";
const cellInputCls =
  "w-full h-9 px-2.5 rounded-lg border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors bg-white";

// ── Sub-components ───────────────────────────────────────────────────────────

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

// ── Dimension cell — keeps cm and inches in sync ──────────────────────────────

function DimPair({
  valueCm,
  disabled,
  onChangeCm,
}: {
  valueCm: number | undefined;
  disabled?: boolean;
  onChangeCm: (cm: number | undefined) => void;
}) {
  // Local string state lets the user type freely; we only push to parent on change
  const [cmStr, setCmStr] = useState(valueCm ? valueCm.toFixed(2) : "");
  const [inStr, setInStr] = useState(valueCm ? (valueCm / CM_PER_INCH).toFixed(3) : "");

  // Keep displays in sync when external state changes (e.g. on load)
  const extCm = valueCm ? valueCm.toFixed(2) : "";
  const extIn = valueCm ? (valueCm / CM_PER_INCH).toFixed(3) : "";

  function handleCmChange(raw: string) {
    setCmStr(raw);
    const n = parseFloat(raw);
    if (!isNaN(n) && n > 0) {
      setInStr((n / CM_PER_INCH).toFixed(3));
      onChangeCm(n);
    } else if (raw === "" || raw === "0") {
      setInStr("");
      onChangeCm(undefined);
    }
  }

  function handleInChange(raw: string) {
    setInStr(raw);
    const n = parseFloat(raw);
    if (!isNaN(n) && n > 0) {
      const cm = n * CM_PER_INCH;
      setCmStr(cm.toFixed(2));
      onChangeCm(cm);
    } else if (raw === "" || raw === "0") {
      setCmStr("");
      onChangeCm(undefined);
    }
  }

  // Sync from parent when first mounted or externally reset
  const prevExt = useMemo(() => extCm, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (extCm !== prevExt && extCm !== cmStr) {
    setCmStr(extCm);
    setInStr(extIn);
  }

  const dimCls = `${cellInputCls} w-28${disabled ? " opacity-40 cursor-not-allowed" : ""}`;

  return (
    <>
      <td className="px-2 py-2.5">
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          disabled={disabled}
          className={dimCls}
          value={cmStr}
          onChange={(e) => handleCmChange(e.target.value)}
        />
      </td>
      <td className="px-2 py-2.5">
        <input
          type="number"
          step="0.001"
          min="0"
          placeholder="0.000"
          disabled={disabled}
          className={dimCls}
          value={inStr}
          onChange={(e) => handleInChange(e.target.value)}
        />
      </td>
    </>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function CostsAdmin({ products, initialSettings }: Props) {
  const [settings, setSettings] = useState<CostSettings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Calculator state
  const [calcProductId, setCalcProductId] = useState("");
  const [calcQty, setCalcQty] = useState(100);
  const [calcProfitPct, setCalcProfitPct] = useState(initialSettings.targetProfitPercent);

  // ── Global settings ────────────────────────────────────────────────────────

  function updateGlobal<K extends keyof Omit<CostSettings, "materials" | "productConfigs">>(
    field: K,
    value: CostSettings[K]
  ) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  // ── Materials ──────────────────────────────────────────────────────────────

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
          cfg.materialId === id ? { ...cfg, materialId: undefined } : cfg,
        ])
      ),
    }));
  }

  // ── Product configs ────────────────────────────────────────────────────────

  function getConfig(productId: string): ProductCostConfig {
    return (
      settings.productConfigs[productId] ?? {
        productType: "sticker",
        batchSize: 10,
        batchMinutes: 5,
      }
    );
  }

  function updateConfig(
    productId: string,
    field: keyof ProductCostConfig,
    value: string | number | undefined
  ) {
    setSettings((prev) => ({
      ...prev,
      productConfigs: {
        ...prev.productConfigs,
        [productId]: { ...getConfig(productId), [field]: value },
      },
    }));
  }

  // ── Save ───────────────────────────────────────────────────────────────────

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

  // ── Calculator ─────────────────────────────────────────────────────────────

  const calcConfig = calcProductId ? getConfig(calcProductId) : null;
  const calcResult = useMemo(() => {
    if (!calcConfig || calcQty < 1) return null;
    return calcRunCosts(calcConfig, settings, calcQty, calcProfitPct);
  }, [calcConfig, settings, calcQty, calcProfitPct]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl flex flex-col gap-6">

      {/* ── 1. Global Settings ── */}
      <SectionCard
        title="Global Settings"
        subtitle="Defaults applied to all products unless overridden below."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label>Hourly Rate (£)</Label>
            <input
              type="number"
              step="0.50"
              min="0"
              className={inputCls}
              value={fmt(settings.hourlyRatePence)}
              onChange={(e) =>
                updateGlobal(
                  "hourlyRatePence",
                  Math.round(parseFloat(e.target.value || "0") * 100)
                )
              }
            />
            <p className="text-xs text-[#6b7280] mt-1">Pro-rata labour cost</p>
          </div>
          <div>
            <Label>Target Profit %</Label>
            <input
              type="number"
              step="1"
              min="0"
              max="99"
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
              type="number"
              step="0.01"
              min="0"
              className={inputCls}
              value={fmt(settings.defaultPostagePence)}
              onChange={(e) =>
                updateGlobal(
                  "defaultPostagePence",
                  Math.round(parseFloat(e.target.value || "0") * 100)
                )
              }
            />
          </div>
          <div>
            <Label>Default Ink / unit (£)</Label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={inputCls}
              value={fmt(settings.defaultInkCostPence)}
              onChange={(e) =>
                updateGlobal(
                  "defaultInkCostPence",
                  Math.round(parseFloat(e.target.value || "0") * 100)
                )
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
                type="number"
                step="0.01"
                min="0"
                className={inputCls}
                value={settings.sheetWidthCm.toFixed(2)}
                onChange={(e) =>
                  updateGlobal("sheetWidthCm", parseFloat(e.target.value || "0"))
                }
              />
            </div>
            <div>
              <Label>Sheet Height (cm)</Label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={inputCls}
                value={settings.sheetHeightCm.toFixed(2)}
                onChange={(e) =>
                  updateGlobal("sheetHeightCm", parseFloat(e.target.value || "0"))
                }
              />
            </div>
            <div>
              <Label>Sheet Width (in)</Label>
              <input
                type="number"
                step="0.001"
                min="0"
                className={inputCls}
                value={(settings.sheetWidthCm / CM_PER_INCH).toFixed(3)}
                onChange={(e) =>
                  updateGlobal(
                    "sheetWidthCm",
                    parseFloat(e.target.value || "0") * CM_PER_INCH
                  )
                }
              />
            </div>
            <div>
              <Label>Sheet Height (in)</Label>
              <input
                type="number"
                step="0.001"
                min="0"
                className={inputCls}
                value={(settings.sheetHeightCm / CM_PER_INCH).toFixed(3)}
                onChange={(e) =>
                  updateGlobal(
                    "sheetHeightCm",
                    parseFloat(e.target.value || "0") * CM_PER_INCH
                  )
                }
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── 2. Materials ── */}
      <SectionCard
        title="Materials"
        subtitle="Define your materials. Set cost/sheet for sticker paper; set cost/unit for blank cups, t-shirts, etc."
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
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
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
      </SectionCard>

      {/* ── 3. Product Setup ── */}
      <div className="bg-white rounded-2xl border border-[#e5e1d8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e5e1d8]">
          <h2 className="font-display font-700 text-lg text-[#111111]">Product Setup</h2>
          <p className="text-[#6b7280] text-sm mt-0.5">
            Set the product type, material, and dimensions. Sticker dimensions sync between cm and inches automatically — type in either.
            <br />
            <span className="text-[#111111] font-medium">Batch size</span> = units per run.{" "}
            <span className="text-[#111111] font-medium">Batch time</span> = minutes per run.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e1d8] bg-[#f9f7f4]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider whitespace-nowrap">
                  Product
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider whitespace-nowrap">
                  Type
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider whitespace-nowrap">
                  Material
                </th>
                <th
                  colSpan={2}
                  className="text-center px-3 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider whitespace-nowrap"
                >
                  Height
                </th>
                <th
                  colSpan={2}
                  className="text-center px-3 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider whitespace-nowrap"
                >
                  Width
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider whitespace-nowrap">
                  /sheet
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider whitespace-nowrap">
                  Batch
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider whitespace-nowrap">
                  Mins
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider whitespace-nowrap">
                  Ink £
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider whitespace-nowrap">
                  Post £
                </th>
              </tr>
              <tr className="border-b border-[#e5e1d8] bg-[#f9f7f4]">
                <th colSpan={3} />
                <th className="px-2 pb-2 text-xs text-[#9ca3af] font-medium text-center whitespace-nowrap">cm</th>
                <th className="px-2 pb-2 text-xs text-[#9ca3af] font-medium text-center whitespace-nowrap">in</th>
                <th className="px-2 pb-2 text-xs text-[#9ca3af] font-medium text-center whitespace-nowrap">cm</th>
                <th className="px-2 pb-2 text-xs text-[#9ca3af] font-medium text-center whitespace-nowrap">in</th>
                <th colSpan={5} />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e1d8]">
              {products.map((product) => {
                const cfg = getConfig(product.id);
                const isSticker = !cfg.productType || cfg.productType === "sticker";
                const perSheet = isSticker
                  ? calcStickersPerSheet(cfg.widthCm, cfg.heightCm, settings.sheetWidthCm, settings.sheetHeightCm)
                  : 0;
                return (
                  <tr key={product.id} className="hover:bg-[#f9f7f4] transition-colors">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-[#111111] truncate max-w-[140px]">
                        {product.name}
                      </p>
                      <p className="text-xs text-[#6b7280] capitalize">{product.category}</p>
                    </td>
                    {/* Product type */}
                    <td className="px-3 py-2.5 min-w-[140px]">
                      <select
                        className={cellInputCls}
                        value={cfg.productType ?? "sticker"}
                        onChange={(e) =>
                          updateConfig(product.id, "productType", e.target.value as ProductType)
                        }
                      >
                        {(Object.keys(PRODUCT_TYPE_LABELS) as ProductType[]).map((t) => (
                          <option key={t} value={t}>
                            {PRODUCT_TYPE_LABELS[t]}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* Material */}
                    <td className="px-3 py-2.5 min-w-[140px]">
                      <select
                        className={cellInputCls}
                        value={cfg.materialId ?? ""}
                        onChange={(e) =>
                          updateConfig(product.id, "materialId", e.target.value || undefined)
                        }
                      >
                        <option value="">— none —</option>
                        {settings.materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name || "Unnamed"}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* Height cm + in (synced) */}
                    <DimPair
                      valueCm={cfg.heightCm}
                      disabled={!isSticker}
                      onChangeCm={(cm) => updateConfig(product.id, "heightCm", cm)}
                    />
                    {/* Width cm + in (synced) */}
                    <DimPair
                      valueCm={cfg.widthCm}
                      disabled={!isSticker}
                      onChangeCm={(cm) => updateConfig(product.id, "widthCm", cm)}
                    />
                    {/* Stickers per sheet */}
                    <td className="px-3 py-2.5">
                      <span
                        className={`text-sm font-semibold ${
                          perSheet > 0 ? "text-[#111111]" : "text-[#d1d5db]"
                        }`}
                      >
                        {isSticker ? (perSheet > 0 ? perSheet : "—") : "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        className={`${cellInputCls} w-16`}
                        value={cfg.batchSize}
                        onChange={(e) =>
                          updateConfig(product.id, "batchSize", parseInt(e.target.value || "1"))
                        }
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        className={`${cellInputCls} w-16`}
                        value={cfg.batchMinutes}
                        onChange={(e) =>
                          updateConfig(
                            product.id,
                            "batchMinutes",
                            parseInt(e.target.value || "1")
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={fmt(settings.defaultInkCostPence)}
                        className={`${cellInputCls} w-20`}
                        value={cfg.inkCostPence !== undefined ? fmt(cfg.inkCostPence) : ""}
                        onChange={(e) =>
                          updateConfig(
                            product.id,
                            "inkCostPence",
                            e.target.value !== ""
                              ? Math.round(parseFloat(e.target.value) * 100)
                              : undefined
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={fmt(settings.defaultPostagePence)}
                        className={`${cellInputCls} w-20`}
                        value={cfg.postagePence !== undefined ? fmt(cfg.postagePence) : ""}
                        onChange={(e) =>
                          updateConfig(
                            product.id,
                            "postagePence",
                            e.target.value !== ""
                              ? Math.round(parseFloat(e.target.value) * 100)
                              : undefined
                          )
                        }
                      />
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-6 py-10 text-center text-sm text-[#6b7280]">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Production Run Calculator ── */}
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
              onChange={(e) => setCalcProductId(e.target.value)}
            >
              <option value="">Select a product…</option>
              {products.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Quantity</Label>
            <input
              type="number"
              step="1"
              min="1"
              className={inputCls}
              value={calcQty}
              onChange={(e) => setCalcQty(Math.max(1, parseInt(e.target.value || "1")))}
            />
          </div>
          <div>
            <Label>Profit %</Label>
            <input
              type="number"
              step="1"
              min="0"
              max="99"
              className={inputCls}
              value={calcProfitPct}
              onChange={(e) => setCalcProfitPct(parseFloat(e.target.value || "0"))}
            />
          </div>
        </div>

        {calcResult ? (
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Cost breakdown */}
            <div className="bg-[#f9f7f4] rounded-xl p-5 flex flex-col gap-2.5">
              <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">
                Cost Breakdown — {calcQty} units
              </p>
              <CostRow
                label={
                  calcResult.isSticker
                    ? `Paper${calcConfig?.materialId ? ` (${settings.materials.find((m) => m.id === calcConfig?.materialId)?.name ?? ""})` : " (none set)"}${calcResult.perSheet > 0 ? ` · ${calcResult.sheetsNeeded} sheet${calcResult.sheetsNeeded !== 1 ? "s" : ""}` : ""}`
                    : `Material${calcConfig?.materialId ? ` (${settings.materials.find((m) => m.id === calcConfig?.materialId)?.name ?? ""})` : " (none set)"} · ${calcQty} units`
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

            {/* Suggested pricing */}
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
                    Paper:{" "}
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
                    Set sticker dimensions in Product Setup to calculate sheets needed.
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
              ? "Configure batch size and batch time for this product in the Product Setup table above, then re-select it here."
              : "Select a product and enter a quantity to see the full breakdown."}
          </div>
        )}
      </SectionCard>

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
