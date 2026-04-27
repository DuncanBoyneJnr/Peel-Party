"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Plus, X, Save, Upload, GripVertical } from "lucide-react";
import { Product } from "@/lib/types";

interface Props {
  product?: Product;
  isNew?: boolean;
}

const emptyProduct: Partial<Product> = {
  name: "", category: "stickers", price: 0, description: "", longDescription: "",
  options: [], supportsTextInput: false, supportsFileUpload: false,
  orderType: "buy-now", badge: "", featured: false, inStock: true,
  reviewCount: 0, rating: 5.0,
};

const inputClass = "w-full h-10 px-3 rounded-xl border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors bg-white";
const labelClass = "block text-sm font-semibold text-[#111111] mb-1.5";

export default function ProductForm({ product, isNew }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Product>>(product ?? emptyProduct);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newOptName, setNewOptName] = useState("");
  const [optionRaws, setOptionRaws] = useState<string[]>(
    (product?.options ?? []).map((o) => o.values.join(", "))
  );
  const [uploadingImages, setUploadingImages] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploadingImages(true);
    const urls: string[] = [];
    for (const file of acceptedFiles) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const { src } = await res.json();
      if (src) urls.push(src);
    }
    update("images", [...(form.images ?? []), ...urls]);
    setUploadingImages(false);
  }, [form.images]); // eslint-disable-line react-hooks/exhaustive-deps

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"] },
    multiple: true,
  });

  function removeImage(url: string) {
    update("images", (form.images ?? []).filter((u) => u !== url));
  }

  function moveImage(from: number, to: number) {
    const imgs = [...(form.images ?? [])];
    const [moved] = imgs.splice(from, 1);
    imgs.splice(to, 0, moved);
    update("images", imgs);
  }

  function update(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addOption() {
    if (!newOptName.trim()) return;
    update("options", [...(form.options ?? []), { name: newOptName.trim(), values: [] }]);
    setOptionRaws((prev) => [...prev, ""]);
    setNewOptName("");
  }

  function updateOptionRaw(idx: number, raw: string) {
    setOptionRaws((prev) => prev.map((v, i) => (i === idx ? raw : v)));
  }

  function commitOptionValues(idx: number, raw: string) {
    const opts = [...(form.options ?? [])];
    opts[idx] = { ...opts[idx], values: raw.split(",").map((v) => v.trim()).filter(Boolean) };
    update("options", opts);
  }

  function removeOption(idx: number) {
    const opts = [...(form.options ?? [])];
    opts.splice(idx, 1);
    update("options", opts);
    setOptionRaws((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const url = isNew ? "/api/admin/products" : `/api/admin/products/${product!.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      if (!res.ok) throw new Error("Save failed");
      router.push("/admin/products");
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
        <h2 className="font-display font-700 text-lg text-[#111111] mb-5">Basic Info</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Product Name *</label>
            <input required className={inputClass} value={form.name ?? ""} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Custom Die-Cut Stickers" />
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <select required className={inputClass} value={form.category} onChange={(e) => update("category", e.target.value)}>
              <option value="stickers">Stickers</option>
              <option value="mugs">Mugs</option>
              <option value="keyrings">Keyrings</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Price (£) <span className="text-[#6b7280] font-normal">— use 0 for "on request"</span></label>
            <input type="number" min={0} step="0.01" className={inputClass} value={form.price ?? 0} onChange={(e) => update("price", e.target.value)} placeholder="14.99" />
          </div>
          <div>
            <label className={labelClass}>Order Type *</label>
            <select className={inputClass} value={form.orderType} onChange={(e) => update("orderType", e.target.value)}>
              <option value="buy-now">Buy Now</option>
              <option value="request-quote">Request a Quote</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Badge <span className="text-[#6b7280] font-normal">(optional)</span></label>
            <input className={inputClass} value={form.badge ?? ""} onChange={(e) => update("badge", e.target.value)} placeholder="e.g. Best Seller, Sale, New" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Short Description *</label>
            <input required className={inputClass} value={form.description ?? ""} onChange={(e) => update("description", e.target.value)} placeholder="One-line product summary" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Full Description</label>
            <textarea rows={4} className="w-full px-3 py-2.5 rounded-xl border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors resize-none bg-white" value={form.longDescription ?? ""} onChange={(e) => update("longDescription", e.target.value)} placeholder="Detailed description shown on the product page" />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-[#f0ede8]">
          {[
            { key: "featured", label: "Featured on homepage" },
            { key: "inStock", label: "In stock" },
            { key: "supportsTextInput", label: "Allow custom text" },
            { key: "supportsFileUpload", label: "Allow file upload" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={!!form[key as keyof Product]}
                onChange={(e) => update(key, e.target.checked)}
                className="w-4 h-4 accent-[#ef8733]"
              />
              <span className="text-sm text-[#111111]">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl border border-[#e5e1d8] p-6">
        <h2 className="font-display font-700 text-lg text-[#111111] mb-1">Product Images</h2>
        <p className="text-sm text-[#6b7280] mb-5">
          First image is the main product photo. Drag to reorder.
        </p>

        {/* Existing images */}
        {(form.images ?? []).length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
            {(form.images ?? []).map((url, i) => (
              <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-[#e5e1d8]">
                <Image src={url} alt={`Product image ${i + 1}`} fill className="object-cover" sizes="160px" />
                {/* Primary badge */}
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 text-[10px] font-semibold bg-[#ef8733] text-white px-1.5 py-0.5 rounded-md">
                    Main
                  </span>
                )}
                {/* Controls */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(i, i - 1)}
                      title="Move left"
                      className="h-7 w-7 bg-white rounded-lg flex items-center justify-center text-[#111111] hover:bg-[#ef8733] hover:text-white transition-colors cursor-pointer"
                    >
                      <GripVertical size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    title="Remove"
                    className="h-7 w-7 bg-white rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-[#ef8733] bg-orange-50"
              : "border-[#e5e1d8] hover:border-[#ef8733] hover:bg-[#fdf9f5]"
          }`}
        >
          <input {...getInputProps()} />
          <Upload size={24} className={`mx-auto mb-2 ${isDragActive ? "text-[#ef8733]" : "text-[#9ca3af]"}`} />
          {uploadingImages ? (
            <p className="text-sm font-medium text-[#ef8733]">Uploading…</p>
          ) : isDragActive ? (
            <p className="text-sm font-medium text-[#ef8733]">Drop images here</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-[#111111]">Drop images here or click to browse</p>
              <p className="text-xs text-[#6b7280] mt-1">JPG, PNG, WebP, GIF — multiple files supported</p>
            </>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="bg-white rounded-2xl border border-[#e5e1d8] p-6">
        <h2 className="font-display font-700 text-lg text-[#111111] mb-1">Product Options</h2>
        <p className="text-sm text-[#6b7280] mb-5">e.g. Size, Finish, Quantity. Values are comma-separated.</p>

        <div className="flex flex-col gap-3 mb-4">
          {(form.options ?? []).map((opt, i) => (
            <div key={i} className="flex gap-3 items-start p-4 bg-[#f9f7f4] rounded-xl border border-[#e5e1d8]">
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#111111] mb-1.5">{opt.name}</p>
                <input
                  className={inputClass}
                  value={optionRaws[i] ?? opt.values.join(", ")}
                  onChange={(e) => updateOptionRaw(i, e.target.value)}
                  onBlur={(e) => commitOptionValues(i, e.target.value)}
                  placeholder="Value 1, Value 2, Value 3"
                />
              </div>
              <button type="button" onClick={() => removeOption(i)} className="mt-7 text-[#d1c8bc] hover:text-red-500 transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={newOptName}
            onChange={(e) => setNewOptName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOption(); } }}
            placeholder="New option name (e.g. Size)"
            className="flex-1 h-10 px-3 rounded-xl border-2 border-dashed border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors bg-white"
          />
          <button
            type="button"
            onClick={addOption}
            className="h-10 px-4 bg-[#f0ede8] text-[#111111] rounded-xl text-sm font-semibold hover:bg-[#e5e1d8] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={14} /> Add
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
          <Save size={16} /> {loading ? "Saving…" : isNew ? "Create Product" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="h-11 px-6 bg-[#f0ede8] text-[#111111] rounded-xl font-semibold text-sm hover:bg-[#e5e1d8] transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
