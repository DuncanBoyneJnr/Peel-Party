"use client";

import { useState, useMemo } from "react";
import { Save, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Product } from "@/lib/types";
import { CostSettings, ProductCostOverride } from "@/lib/server-data";

interface Props {
  products: Product[];
  initialSettings: CostSettings;
}

function p(pence: number) {
  return (pence / 100).toFixed(2);
}

function computeCosts(product: Product, settings: CostSettings) {
  const ov = settings.productOverrides[product.id] ?? {};
  const stockCost = ov.stockCostPence ?? settings.stockCostPence;
  const inkCost = ov.inkCostPence ?? settings.inkCostPence;
  const postage = ov.postagePence ?? settings.postagePence;
  const mins = ov.minutesToMake ?? settings.minutesToMake;
  const labourCost = Math.round((mins / 60) * settings.hourlyRatePence);
  const totalCost = stockCost + inkCost + postage + labourCost;
  const profit = product.price - totalCost;
  const margin = product.price > 0 ? (profit / product.price) * 100 : 0;
  return { stockCost, inkCost, postage, labourCost, totalCost, profit, margin };
}

const inputCls =
  "w-full h-10 px-3 rounded-xl border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors bg-white";

function StatCard({
  label,
  value,
  sub,
  good,
}: {
  label: string;
  value: string;
  sub: string;
  good?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e5e1d8] p-4">
      <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">{label}</p>
      <p
        className={`font-display font-800 text-2xl ${
          good === undefined ? "text-[#111111]" : good ? "text-emerald-600" : "text-amber-500"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-[#6b7280] mt-0.5">{sub}</p>
    </div>
  );
}

function LabelField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#111111] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function OverrideField({
  label,
  placeholder,
  value,
  onChange,
  step = "0.01",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#6b7280] mb-1">{label}</label>
      <input
        type="number"
        step={step}
        min="0"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-3 rounded-lg border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors bg-white placeholder:text-[#9ca3af]"
      />
    </div>
  );
}

export default function CostsAdmin({ products, initialSettings }: Props) {
  const [settings, setSettings] = useState<CostSettings>(initialSettings);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateGlobal(field: keyof Omit<CostSettings, "productOverrides">, value: number) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  function updateOverride(
    productId: string,
    field: keyof ProductCostOverride,
    value: number | undefined
  ) {
    setSettings((prev) => {
      const ov = { ...prev.productOverrides };
      if (value === undefined) {
        const updated = { ...ov[productId] };
        delete updated[field];
        if (Object.keys(updated).length === 0) {
          delete ov[productId];
        } else {
          ov[productId] = updated;
        }
      } else {
        ov[productId] = { ...ov[productId], [field]: value };
      }
      return { ...prev, productOverrides: ov };
    });
  }

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

  const productData = useMemo(
    () => products.map((pr) => ({ ...pr, costs: computeCosts(pr, settings) })),
    [products, settings]
  );

  const avgMargin =
    productData.length
      ? productData.reduce((sum, pr) => sum + pr.costs.margin, 0) / productData.length
      : 0;
  const aboveTargetCount = productData.filter(
    (pr) => pr.costs.margin >= settings.targetProfitPercent
  ).length;

  return (
    <div className="max-w-5xl flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Avg Margin"
          value={`${avgMargin.toFixed(1)}%`}
          sub="across all products"
          good={avgMargin >= settings.targetProfitPercent}
        />
        <StatCard
          label="On Target"
          value={`${aboveTargetCount} / ${productData.length}`}
          sub="products"
          good={aboveTargetCount === productData.length}
        />
        <StatCard
          label="Hourly Rate"
          value={`£${p(settings.hourlyRatePence)}`}
          sub="your labour rate"
        />
        <StatCard
          label="Default Postage"
          value={`£${p(settings.postagePence)}`}
          sub="per order"
        />
      </div>

      {/* Global defaults */}
      <div className="bg-white rounded-2xl border border-[#e5e1d8] p-6">
        <h2 className="font-display font-700 text-lg text-[#111111] mb-5">Global Defaults</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <LabelField label="Stock / Material per unit (£)">
            <input
              type="number"
              step="0.01"
              min="0"
              className={inputCls}
              value={p(settings.stockCostPence)}
              onChange={(e) =>
                updateGlobal(
                  "stockCostPence",
                  Math.round(parseFloat(e.target.value || "0") * 100)
                )
              }
            />
          </LabelField>
          <LabelField label="Ink per unit (£)">
            <input
              type="number"
              step="0.01"
              min="0"
              className={inputCls}
              value={p(settings.inkCostPence)}
              onChange={(e) =>
                updateGlobal(
                  "inkCostPence",
                  Math.round(parseFloat(e.target.value || "0") * 100)
                )
              }
            />
          </LabelField>
          <LabelField label="Postage per order (£)">
            <input
              type="number"
              step="0.01"
              min="0"
              className={inputCls}
              value={p(settings.postagePence)}
              onChange={(e) =>
                updateGlobal(
                  "postagePence",
                  Math.round(parseFloat(e.target.value || "0") * 100)
                )
              }
            />
          </LabelField>
          <LabelField label="Hourly Rate (£)">
            <input
              type="number"
              step="0.50"
              min="0"
              className={inputCls}
              value={p(settings.hourlyRatePence)}
              onChange={(e) =>
                updateGlobal(
                  "hourlyRatePence",
                  Math.round(parseFloat(e.target.value || "0") * 100)
                )
              }
            />
          </LabelField>
          <LabelField label="Default mins to make (per unit)">
            <input
              type="number"
              step="1"
              min="1"
              className={inputCls}
              value={settings.minutesToMake}
              onChange={(e) =>
                updateGlobal("minutesToMake", parseInt(e.target.value || "1"))
              }
            />
          </LabelField>
          <LabelField label="Target Profit %">
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              className={inputCls}
              value={settings.targetProfitPercent}
              onChange={(e) =>
                updateGlobal("targetProfitPercent", parseFloat(e.target.value || "0"))
              }
            />
          </LabelField>
        </div>
      </div>

      {/* Product breakdown */}
      <div className="bg-white rounded-2xl border border-[#e5e1d8] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e5e1d8]">
          <h2 className="font-display font-700 text-lg text-[#111111]">Product Breakdown</h2>
          <p className="text-[#6b7280] text-sm mt-0.5">
            Expand a row to set per-product cost overrides. Leave blank to use the global default.
          </p>
        </div>

        <div className="divide-y divide-[#e5e1d8]">
          {productData.map((pr) => {
            const { stockCost, inkCost, labourCost, postage, totalCost, profit, margin } =
              pr.costs;
            const isExpanded = expandedId === pr.id;
            const ov = settings.productOverrides[pr.id] ?? {};
            const onTarget = margin >= settings.targetProfitPercent;
            const marginColor =
              margin < 0 ? "text-red-500" : onTarget ? "text-emerald-600" : "text-amber-500";
            const dotColor =
              margin < 0 ? "bg-red-400" : onTarget ? "bg-emerald-400" : "bg-amber-400";

            return (
              <div key={pr.id}>
                {/* Main row */}
                <button
                  type="button"
                  className="w-full px-6 py-4 flex items-center gap-4 hover:bg-[#f9f7f4] transition-colors text-left cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : pr.id)}
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#111111] truncate">{pr.name}</p>
                    <p className="text-xs text-[#6b7280] capitalize">{pr.category}</p>
                  </div>

                  {/* Cost breakdown (hidden on small screens) */}
                  <div className="hidden lg:flex items-center gap-5 text-xs text-[#6b7280]">
                    <span>Stock £{p(stockCost)}</span>
                    <span>Ink £{p(inkCost)}</span>
                    <span>Labour £{p(labourCost)}</span>
                    <span>Post £{p(postage)}</span>
                  </div>

                  {/* Prices */}
                  <div className="flex items-center gap-5 text-sm flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="font-semibold text-[#111111]">£{p(pr.price)}</p>
                      <p className="text-xs text-[#6b7280]">sale</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="font-semibold text-[#111111]">£{p(totalCost)}</p>
                      <p className="text-xs text-[#6b7280]">cost</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          profit >= 0 ? "text-[#111111]" : "text-red-500"
                        }`}
                      >
                        {profit >= 0 ? "+" : ""}£{p(Math.abs(profit))}
                      </p>
                      <p className="text-xs text-[#6b7280]">profit</p>
                    </div>
                    <div className="text-right w-14">
                      <p className={`font-bold text-base ${marginColor}`}>
                        {margin.toFixed(1)}%
                      </p>
                      <p className="text-xs text-[#6b7280]">margin</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-[#6b7280]" />
                    ) : (
                      <ChevronDown size={16} className="text-[#6b7280]" />
                    )}
                  </div>
                </button>

                {/* Expanded overrides */}
                {isExpanded && (
                  <div className="px-6 pb-5 pt-3 bg-[#f9f7f4] border-t border-[#e5e1d8]">
                    <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-3">
                      Override costs for &ldquo;{pr.name}&rdquo;
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <OverrideField
                        label="Stock / unit (£)"
                        placeholder={`Default £${p(settings.stockCostPence)}`}
                        value={
                          ov.stockCostPence !== undefined ? p(ov.stockCostPence) : ""
                        }
                        onChange={(v) =>
                          updateOverride(
                            pr.id,
                            "stockCostPence",
                            v !== "" ? Math.round(parseFloat(v) * 100) : undefined
                          )
                        }
                      />
                      <OverrideField
                        label="Ink / unit (£)"
                        placeholder={`Default £${p(settings.inkCostPence)}`}
                        value={ov.inkCostPence !== undefined ? p(ov.inkCostPence) : ""}
                        onChange={(v) =>
                          updateOverride(
                            pr.id,
                            "inkCostPence",
                            v !== "" ? Math.round(parseFloat(v) * 100) : undefined
                          )
                        }
                      />
                      <OverrideField
                        label="Mins to make"
                        placeholder={`Default ${settings.minutesToMake} min`}
                        value={
                          ov.minutesToMake !== undefined ? String(ov.minutesToMake) : ""
                        }
                        onChange={(v) =>
                          updateOverride(
                            pr.id,
                            "minutesToMake",
                            v !== "" ? parseInt(v) : undefined
                          )
                        }
                        step="1"
                      />
                      <OverrideField
                        label="Postage (£)"
                        placeholder={`Default £${p(settings.postagePence)}`}
                        value={ov.postagePence !== undefined ? p(ov.postagePence) : ""}
                        onChange={(v) =>
                          updateOverride(
                            pr.id,
                            "postagePence",
                            v !== "" ? Math.round(parseFloat(v) * 100) : undefined
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {productData.length === 0 && (
            <div className="px-6 py-12 text-center text-[#6b7280] text-sm">
              No products found. Add products first.
            </div>
          )}
        </div>
      </div>

      {/* Save bar */}
      <div className="flex items-center gap-3 pb-4">
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
