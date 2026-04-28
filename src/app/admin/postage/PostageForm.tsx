"use client";

import { useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import { PostageSettings } from "@/lib/types";

interface Props { initialSettings: PostageSettings }

const inputClass = "w-full h-10 px-3 rounded-xl border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors bg-white";
const labelClass = "block text-sm font-semibold text-[#111111] mb-1.5";

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e5e1d8] p-6">
      <h2 className="font-display font-700 text-lg text-[#111111] mb-1">{title}</h2>
      {subtitle && <p className="text-[#6b7280] text-sm mb-5">{subtitle}</p>}
      <div className="grid sm:grid-cols-2 gap-4 mt-4">{children}</div>
    </div>
  );
}

export default function PostageForm({ initialSettings }: Props) {
  const [form, setForm] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(field: keyof PostageSettings, value: number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/postage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      <Section
        title="Standard Postage"
        subtitle="These rates are shown to customers in their basket and applied to every order at checkout."
      >
        <div>
          <label className={labelClass}>Flat Postage Rate (£)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className={inputClass}
            value={form.flatRate}
            onChange={(e) => update("flatRate", Number(e.target.value))}
            placeholder="3.95"
          />
          <p className="text-xs text-[#6b7280] mt-1.5">Charged on all orders that don't qualify for free postage.</p>
        </div>
        <div>
          <label className={labelClass}>Free Postage Threshold (£)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className={inputClass}
            value={form.freeThreshold}
            onChange={(e) => update("freeThreshold", Number(e.target.value))}
            placeholder="50.00"
          />
          <p className="text-xs text-[#6b7280] mt-1.5">Orders at or above this value get free postage. Set to 0 to disable.</p>
        </div>
      </Section>

      <div className="bg-[#f9f7f4] rounded-2xl border border-[#e5e1d8] p-5 text-sm text-[#6b7280]">
        <p className="font-semibold text-[#111111] mb-1">Current rates summary</p>
        <p>
          Orders under £{Number(form.freeThreshold).toFixed(2)}: <span className="font-medium text-[#111111]">£{Number(form.flatRate).toFixed(2)} postage</span>
        </p>
        {form.freeThreshold > 0 && (
          <p>
            Orders £{Number(form.freeThreshold).toFixed(2)} and over: <span className="font-medium text-emerald-600">Free postage</span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 h-11 px-6 bg-[#ef8733] text-white rounded-xl font-semibold text-sm hover:bg-[#ea7316] transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Save size={16} /> {loading ? "Saving…" : "Save Postage Settings"}
        </button>
        {saved && (
          <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
            <CheckCircle2 size={16} /> Saved!
          </div>
        )}
      </div>
    </form>
  );
}
