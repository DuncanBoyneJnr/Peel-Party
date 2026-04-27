"use client";

import { useState } from "react";
import { Plus, Trash2, Save, CheckCircle2 } from "lucide-react";
import { MaterialType, ProductCostConfig } from "@/lib/server-data";
import { ProductType } from "@/lib/types";

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  sticker: "Sticker Sheet",
  cup: "Cup / Mug",
  tshirt: "T-Shirt",
  other: "Other (per unit)",
};

const cellInputCls =
  "w-full h-9 px-2.5 rounded-lg border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors bg-white";

function fmt(pence: number) {
  return (pence / 100).toFixed(2);
}

export default function MaterialsAdmin({ initialMaterials }: { initialMaterials: MaterialType[] }) {
  const [materials, setMaterials] = useState<MaterialType[]>(initialMaterials);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function addMaterial() {
    setMaterials((prev) => [
      ...prev,
      {
        id: `mat_${Date.now()}`,
        name: "",
        productType: "sticker",
        costPencePerSheet: 0,
        costPencePerUnit: 0,
      },
    ]);
  }

  function updateMaterial(id: string, field: keyof MaterialType, value: string | number) {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  }

  function deleteMaterial(id: string) {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleSave() {
    setLoading(true);
    await fetch("/api/admin/materials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(materials),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-4xl flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-[#e5e1d8] p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="font-display font-700 text-lg text-[#111111]">Materials</h2>
            <p className="text-[#6b7280] text-sm mt-0.5">
              Define every material used in production. Once saved, assign them to products in the Product editor.
            </p>
          </div>
          <button
            type="button"
            onClick={addMaterial}
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#111111] text-white rounded-xl text-sm font-semibold hover:bg-[#222] transition-colors cursor-pointer shrink-0"
          >
            <Plus size={14} /> Add Material
          </button>
        </div>

        {materials.length === 0 ? (
          <p className="text-sm text-[#6b7280] py-8 text-center border-2 border-dashed border-[#e5e1d8] rounded-xl">
            No materials yet. Click &ldquo;Add Material&rdquo; to get started.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[1fr_160px_160px_40px] gap-3 px-1 mb-1">
              <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Material Name</span>
              <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Product Type</span>
              <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Cost (£)</span>
              <span />
            </div>
            {materials.map((mat) => {
              const matIsSticker = !mat.productType || mat.productType === "sticker";
              return (
                <div key={mat.id} className="grid grid-cols-[1fr_160px_160px_40px] gap-3 items-center">
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
                    onChange={(e) => updateMaterial(mat.id, "productType", e.target.value as ProductType)}
                  >
                    {(Object.keys(PRODUCT_TYPE_LABELS) as ProductType[]).map((t) => (
                      <option key={t} value={t}>{PRODUCT_TYPE_LABELS[t]}</option>
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
            <strong className="text-[#111111]">Sticker Sheet</strong> — cost per A4 sheet (e.g. vinyl paper, holo laminate).
            The calculator works out how many sheets are needed from stickers-per-sheet.
            <br />
            <strong className="text-[#111111]">Cup / Mug, T-Shirt, Other</strong> — cost per blank unit.
            <br />
            <span className="text-amber-600 font-medium">After changing material costs, re-save any products that use them to refresh their pricing.</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 h-11 px-6 bg-[#ef8733] text-white rounded-xl font-semibold text-sm hover:bg-[#ea7316] transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Save size={16} /> {loading ? "Saving…" : "Save Materials"}
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
