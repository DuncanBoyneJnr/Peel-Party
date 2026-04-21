"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setLoading(false);
    setConfirming(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="h-8 px-3 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? "…" : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="h-8 px-3 bg-[#f0ede8] text-[#111111] rounded-lg text-xs font-semibold hover:bg-[#e5e1d8] transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 h-8 px-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
      title={`Delete ${name}`}
    >
      <Trash2 size={12} /> Delete
    </button>
  );
}
