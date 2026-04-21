"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Upload, Pencil, Trash2, X, Save, Plus } from "lucide-react";
import { GalleryItem } from "@/lib/server-data";

interface Props { initialItems: GalleryItem[] }

const inputClass = "w-full h-9 px-3 rounded-lg border border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors bg-white";

export default function GalleryAdmin({ initialItems }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(initialItems);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<GalleryItem>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // Upload new photo
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);
    const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const { src } = await uploadRes.json();

    const newItem: Partial<GalleryItem> = {
      src, category: "General", title: file.name.replace(/\.[^.]+$/, ""),
      description: "", tags: [],
    };
    const res = await fetch("/api/admin/gallery", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    const created = await res.json();
    setItems((prev) => [...prev, created]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  // Start editing
  function startEdit(item: GalleryItem) {
    setEditingId(item.id);
    setEditForm({ ...item, tags: [...item.tags] });
  }

  // Save edits
  async function saveEdit(id: string) {
    setSavingId(id);
    const res = await fetch(`/api/admin/gallery/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const updated = await res.json();
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    setEditingId(null);
    setSavingId(null);
  }

  // Delete
  async function deleteItem(id: string) {
    if (!confirm("Delete this gallery item?")) return;
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateTag(raw: string) {
    setEditForm((prev) => ({ ...prev, tags: raw.split(",").map((t) => t.trim()).filter(Boolean) }));
  }

  return (
    <div>
      {/* Upload zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className="flex flex-col items-center justify-center gap-3 p-10 mb-8 bg-white rounded-2xl border-2 border-dashed border-[#e5e1d8] cursor-pointer hover:border-[#ef8733] hover:bg-[#fff7ed] transition-colors"
      >
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        <div className="w-12 h-12 bg-[#ef8733]/10 rounded-xl flex items-center justify-center">
          <Upload size={22} className={uploading ? "text-[#ef8733] animate-bounce" : "text-[#ef8733]"} />
        </div>
        <div className="text-center">
          <p className="font-semibold text-[#111111]">{uploading ? "Uploading…" : "Click to upload a photo"}</p>
          <p className="text-sm text-[#6b7280] mt-0.5">JPG, PNG, GIF, WebP — any size</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-[#e5e1d8] overflow-hidden">
            {/* Image */}
            <div className="relative aspect-[4/3] bg-[#f9f7f4]">
              <Image src={item.src} alt={item.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
              <div className="absolute top-2 left-2">
                <span className="inline-block bg-[#ef8733] text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {item.category}
                </span>
              </div>
            </div>

            {/* Info / edit */}
            <div className="p-4">
              {editingId === item.id ? (
                <div className="flex flex-col gap-2">
                  <input value={editForm.title ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} placeholder="Title" className={inputClass} />
                  <input value={editForm.category ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))} placeholder="Category" className={inputClass} />
                  <textarea value={editForm.description ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2} className="w-full px-3 py-2 rounded-lg border border-[#e5e1d8] text-sm resize-none focus:outline-none focus:border-[#ef8733] bg-white" />
                  <input value={(editForm.tags ?? []).join(", ")} onChange={(e) => updateTag(e.target.value)} placeholder="Tags (comma-separated)" className={inputClass} />
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => saveEdit(item.id)} disabled={savingId === item.id} className="flex items-center gap-1.5 h-8 px-3 bg-[#ef8733] text-white rounded-lg text-xs font-semibold hover:bg-[#ea7316] transition-colors cursor-pointer disabled:opacity-50">
                      <Save size={12} /> {savingId === item.id ? "Saving…" : "Save"}
                    </button>
                    <button onClick={() => setEditingId(null)} className="flex items-center gap-1.5 h-8 px-3 bg-[#f0ede8] text-[#111111] rounded-lg text-xs font-semibold hover:bg-[#e5e1d8] transition-colors cursor-pointer">
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-semibold text-[#111111] text-sm truncate">{item.title}</p>
                  <p className="text-xs text-[#6b7280] mt-0.5 line-clamp-2">{item.description || <span className="italic">No description</span>}</p>
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-[#f0ede8] text-[#111111] rounded-full text-xs">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[#f0ede8]">
                    <button onClick={() => startEdit(item)} className="flex items-center gap-1.5 h-7 px-3 bg-[#f0ede8] text-[#111111] rounded-lg text-xs font-semibold hover:bg-[#e5e1d8] transition-colors cursor-pointer">
                      <Pencil size={11} /> Edit
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="flex items-center gap-1.5 h-7 px-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer">
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
