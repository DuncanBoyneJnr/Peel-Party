"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function BundleDeleteButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    await fetch(`/api/admin/bundles/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#6b7280]">Delete "{name}"?</span>
        <button onClick={handleDelete} className="h-9 px-3 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors cursor-pointer">Yes</button>
        <button onClick={() => setConfirming(false)} className="h-9 px-3 text-sm font-semibold bg-[#f0ede8] text-[#111111] rounded-xl hover:bg-[#e5e1d8] transition-colors cursor-pointer">No</button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="h-9 w-9 flex items-center justify-center text-[#d1c8bc] hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer">
      <Trash2 size={16} />
    </button>
  );
}
