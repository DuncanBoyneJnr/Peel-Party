"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Save } from "lucide-react";
import { Bundle, BundleItem } from "@/lib/server-data";
import { Product } from "@/lib/types";

interface Props {
  bundle?: Bundle;
  isNew?: boolean;
  products?: Product[];
}

const inputClass = "w-full h-10 px-3 rounded-xl border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors bg-white";
const labelClass = "block text-sm font-semibold text-[#111111] mb-1.5";

const emptyBundle: Partial<Bundle> = {
  name: "", tagline: "", description: "", price: 0,
  badge: "", emoji: "🎁", items: [], featured: true, active: true,
};

export default function BundleForm({ bundle, isNew, products = [] }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Bundle>>(bundle ?? emptyBundle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // New item state
  const [selectedProductId, setSelectedProductId] = useState("__custom__");
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("");

  function update(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleProductSelect(productId: string) {
    setSelectedProductId(productId);
    if (productId === "__custom__") {
      setNewItemName("");
    } else {
      const product = products.find((p) => p.id === productId);
      if (product) setNewItemName(product.name);
    }
  }

  function addItem() {
    const name = selectedProductId === "__custom__" ? newItemName.trim() : (products.find((p) => p.id === selectedProductId)?.name ?? newItemName.trim());
    if (!name) return;
    const newItem: BundleItem = {
      name,
      qty: newItemQty.trim(),
      ...(selectedProductId !== "__custom__" ? { productId: selectedProductId } : {}),
    };
    update("items", [...(form.items ?? []), newItem]);
    setSelectedProductId("__custom__");
    setNewItemName("");
    setNewItemQty("");
  }

  function updateItem(idx: number, field: keyof BundleItem, value: string) {
    const items = [...(form.items ?? [])];
    items[idx] = { ...items[idx], [field]: value };
    update("items", items);
  }

  function removeItem(idx: number) {
    update("items", (form.items ?? []).filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const url = isNew ? "/api/admin/bundles" : `/api/admin/bundles/${bundle!.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price) || 0,
          originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      router.push("/admin/bundles");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

      {/* Basic info */}
      <div className="bg-white rounded-2xl border border-[#e5e1d8] p-6">
        <h2 className="font-display font-700 text-lg text-[#111111] mb-5">Bundle Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Bundle Name *</label>
            <input required className={inputClass} value={form.name ?? ""} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Birthday Party Bundle" />
          </div>
          <div>
            <label className={labelClass}>Emoji / Icon</label>
            <input className={inputClass} value={form.emoji ?? ""} onChange={(e) => update("emoji", e.target.value)} placeholder="🎉" maxLength={4} />
          </div>
          <div>
            <label className={labelClass}>Badge <span className="text-[#6b7280] font-normal">(optional)</span></label>
            <input className={inputClass} value={form.badge ?? ""} onChange={(e) => update("badge", e.target.value)} placeholder="e.g. Save £14, Best Value" />
          </div>
          <div>
            <label className={labelClass}>Price (£) *</label>
            <input required type="number" min={0} step="0.01" className={inputClass} value={form.price ?? 0} onChange={(e) => update("price", e.target.value)} placeholder="49.99" />
          </div>
          <div>
            <label className={labelClass}>Original Price (£) <span className="text-[#6b7280] font-normal">for strikethrough</span></label>
            <input type="number" min={0} step="0.01" className={inputClass} value={form.originalPrice ?? ""} onChange={(e) => update("originalPrice", e.target.value || undefined)} placeholder="64.00" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Tagline *</label>
            <input required className={inputClass} value={form.tagline ?? ""} onChange={(e) => update("tagline", e.target.value)} placeholder="e.g. Everything you need to make the party unforgettable" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea rows={3} className="w-full px-3 py-2.5 rounded-xl border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors resize-none bg-white" value={form.description ?? ""} onChange={(e) => update("description", e.target.value)} placeholder="Full description shown on the bundle card" />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-[#f0ede8]">
          {[
            { key: "featured", label: "Featured on homepage" },
            { key: "active", label: "Active (visible on site)" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={!!form[key as keyof Bundle]}
                onChange={(e) => update(key, e.target.checked)}
                className="w-4 h-4 accent-[#ef8733]"
              />
              <span className="text-sm text-[#111111]">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Items included */}
      <div className="bg-white rounded-2xl border border-[#e5e1d8] p-6">
        <h2 className="font-display font-700 text-lg text-[#111111] mb-1">What&apos;s Included</h2>
        <p className="text-sm text-[#6b7280] mb-5">Pick from your existing products or add a custom item (e.g. a balloon banner).</p>

        {/* Existing items */}
        {(form.items ?? []).length > 0 && (
          <div className="flex flex-col gap-2 mb-5">
            {(form.items ?? []).map((item, i) => {
              const linkedProduct = item.productId ? products.find((p) => p.id === item.productId) : null;
              return (
                <div key={i} className="flex gap-3 items-center p-3 bg-[#f9f7f4] rounded-xl border border-[#e5e1d8]">
                  {linkedProduct && (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-[#ef8733]/10 text-[#ef8733] rounded-full shrink-0 capitalize">
                      {linkedProduct.category}
                    </span>
                  )}
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      className={inputClass}
                      value={item.name}
                      onChange={(e) => updateItem(i, "name", e.target.value)}
                      placeholder="Item name"
                    />
                    <input
                      className={inputClass}
                      value={item.qty}
                      onChange={(e) => updateItem(i, "qty", e.target.value)}
                      placeholder="Qty (e.g. 50 stickers)"
                    />
                  </div>
                  <button type="button" onClick={() => removeItem(i)} className="text-[#d1c8bc] hover:text-red-500 transition-colors cursor-pointer shrink-0">
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add new item */}
        <div className="flex flex-col gap-2 p-4 bg-[#f9f7f4] rounded-xl border-2 border-dashed border-[#e5e1d8]">
          <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Add item</p>
          <div className="grid sm:grid-cols-2 gap-2">
            <div>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className={inputClass}
              >
                <option value="__custom__">— Custom item —</option>
                {products.length > 0 && (
                  <optgroup label="Your Products">
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.category})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
            <input
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
              placeholder="Qty / note (e.g. 50 stickers)"
              className={inputClass}
            />
          </div>
          {selectedProductId === "__custom__" && (
            <input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
              placeholder="Custom item name (e.g. Balloon Banner)"
              className={inputClass}
            />
          )}
          <button
            type="button"
            onClick={addItem}
            className="self-start h-9 px-4 bg-[#ef8733] text-white rounded-xl text-sm font-semibold hover:bg-[#ea7316] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={14} /> Add to bundle
          </button>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 h-11 px-6 bg-[#ef8733] text-white rounded-xl font-semibold text-sm hover:bg-[#ea7316] transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Save size={16} /> {loading ? "Saving…" : isNew ? "Create Bundle" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/bundles")}
          className="h-11 px-6 bg-[#f0ede8] text-[#111111] rounded-xl font-semibold text-sm hover:bg-[#e5e1d8] transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
