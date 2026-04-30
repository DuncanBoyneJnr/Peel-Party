"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Tag, ToggleLeft, ToggleRight } from "lucide-react";
import { PromoCode } from "@/lib/types";

interface Props { initialCodes: PromoCode[] }

const inputCls = "w-full h-10 px-3 rounded-xl border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors bg-white";
const labelCls = "block text-sm font-semibold text-[#111111] mb-1.5";

const emptyForm = {
  code: "",
  discountType: "percent" as "percent" | "fixed",
  discountValue: "",
  active: true,
  expiresAt: "",
  usageLimit: "",
  minOrderPence: "",
};

export default function PromoCodesAdmin({ initialCodes }: Props) {
  const [codes, setCodes] = useState<PromoCode[]>(initialCodes);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function updateForm(field: keyof typeof emptyForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim()) { setError("Code is required."); return; }
    if (!form.discountValue || Number(form.discountValue) <= 0) { setError("Discount value must be greater than 0."); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/promo-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: form.discountType === "fixed"
          ? Math.round(parseFloat(form.discountValue) * 100)
          : parseFloat(form.discountValue),
        active: form.active,
        expiresAt: form.expiresAt || undefined,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
        minOrderPence: form.minOrderPence ? Math.round(parseFloat(form.minOrderPence) * 100) : undefined,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Failed to create code."); return; }
    setCodes((prev) => [...prev, data]);
    setForm(emptyForm);
    setShowForm(false);
    flashSaved();
  }

  async function toggleActive(code: PromoCode) {
    const res = await fetch(`/api/admin/promo-codes/${code.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !code.active }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCodes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    }
  }

  async function deleteCode(id: string) {
    if (!confirm("Delete this promo code?")) return;
    await fetch(`/api/admin/promo-codes/${id}`, { method: "DELETE" });
    setCodes((prev) => prev.filter((c) => c.id !== id));
  }

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function formatDiscount(code: PromoCode) {
    return code.discountType === "percent"
      ? `${code.discountValue}% off`
      : `£${(code.discountValue / 100).toFixed(2)} off`;
  }

  function formatExpiry(code: PromoCode) {
    if (!code.expiresAt) return "—";
    const d = new Date(code.expiresAt);
    const isExpired = d < new Date();
    return (
      <span className={isExpired ? "text-red-500" : "text-[#6b7280]"}>
        {d.toLocaleDateString("en-GB")}
        {isExpired && " (expired)"}
      </span>
    );
  }

  return (
    <div className="max-w-5xl flex flex-col gap-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
              <CheckCircle2 size={16} /> Saved!
            </div>
          )}
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setError(""); setForm(emptyForm); }}
          className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#111111] text-white rounded-xl text-sm font-semibold hover:bg-[#222] transition-colors cursor-pointer"
        >
          <Plus size={14} /> New Code
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#e5e1d8] p-6">
          <h2 className="font-display font-700 text-lg text-[#111111] mb-5">New Promo Code</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Code *</label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER20"
                  className={`${inputCls} uppercase`}
                  value={form.code}
                  onChange={(e) => updateForm("code", e.target.value.toUpperCase())}
                />
              </div>

              <div>
                <label className={labelCls}>Discount Type</label>
                <select
                  className={inputCls}
                  value={form.discountType}
                  onChange={(e) => updateForm("discountType", e.target.value)}
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed amount (£)</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>
                  {form.discountType === "percent" ? "Discount %" : "Discount (£)"} *
                </label>
                <input
                  type="number"
                  min="0"
                  step={form.discountType === "percent" ? "1" : "0.01"}
                  max={form.discountType === "percent" ? "100" : undefined}
                  placeholder={form.discountType === "percent" ? "20" : "5.00"}
                  className={inputCls}
                  value={form.discountValue}
                  onChange={(e) => updateForm("discountValue", e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Expiry Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.expiresAt}
                  onChange={(e) => updateForm("expiresAt", e.target.value)}
                />
                <p className="text-xs text-[#6b7280] mt-1">Leave blank for no expiry</p>
              </div>

              <div>
                <label className={labelCls}>Usage Limit</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 100"
                  className={inputCls}
                  value={form.usageLimit}
                  onChange={(e) => updateForm("usageLimit", e.target.value)}
                />
                <p className="text-xs text-[#6b7280] mt-1">Leave blank for unlimited</p>
              </div>

              <div>
                <label className={labelCls}>Min. Order Value (£)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 20.00"
                  className={inputCls}
                  value={form.minOrderPence}
                  onChange={(e) => updateForm("minOrderPence", e.target.value)}
                />
                <p className="text-xs text-[#6b7280] mt-1">Leave blank for no minimum</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => updateForm("active", e.target.checked)}
                  className="w-4 h-4 rounded accent-[#ef8733]"
                />
                <span className="text-sm font-medium text-[#111111]">Active (code can be used immediately)</span>
              </label>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 h-10 px-5 bg-[#ef8733] text-white rounded-xl text-sm font-semibold hover:bg-[#ea7316] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Creating…" : "Create Code"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(""); }}
                className="h-10 px-5 border-2 border-[#e5e1d8] rounded-xl text-sm font-semibold text-[#6b7280] hover:border-[#111111] hover:text-[#111111] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Codes table */}
      <div className="bg-white rounded-2xl border border-[#e5e1d8] overflow-hidden">
        {codes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="w-14 h-14 bg-[#f9f7f4] rounded-full flex items-center justify-center">
              <Tag size={24} className="text-[#d1c8bc]" />
            </div>
            <div>
              <p className="font-semibold text-[#111111]">No promo codes yet</p>
              <p className="text-sm text-[#6b7280] mt-1">Click &ldquo;New Code&rdquo; to create your first discount code.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e1d8] bg-[#f9f7f4]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Discount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Expiry</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Usage</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Min. Order</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Active</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ede8]">
                {codes.map((code) => (
                  <tr key={code.id} className={`hover:bg-[#faf9f7] transition-colors ${!code.active ? "opacity-50" : ""}`}>
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-semibold text-[#111111] bg-[#f9f7f4] px-2 py-0.5 rounded-lg text-sm">
                        {code.code}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-[#111111]">{formatDiscount(code)}</td>
                    <td className="px-4 py-3.5">{formatExpiry(code)}</td>
                    <td className="px-4 py-3.5 text-[#6b7280]">
                      {code.usageCount}
                      {code.usageLimit ? ` / ${code.usageLimit}` : " uses"}
                    </td>
                    <td className="px-4 py-3.5 text-[#6b7280]">
                      {code.minOrderPence ? `£${(code.minOrderPence / 100).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => toggleActive(code)}
                        className="cursor-pointer transition-colors"
                        aria-label={code.active ? "Deactivate" : "Activate"}
                      >
                        {code.active
                          ? <ToggleRight size={22} className="text-emerald-500" />
                          : <ToggleLeft size={22} className="text-[#d1c8bc]" />
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => deleteCode(code.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#d1c8bc] hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                        aria-label="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
