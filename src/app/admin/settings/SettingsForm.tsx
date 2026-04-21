"use client";

import { useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import { SiteSettings } from "@/lib/server-data";

interface Props { initialSettings: SiteSettings }

const inputClass = "w-full h-10 px-3 rounded-xl border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors bg-white";
const labelClass = "block text-sm font-semibold text-[#111111] mb-1.5";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e5e1d8] p-6">
      <h2 className="font-display font-700 text-lg text-[#111111] mb-5">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

export default function SettingsForm({ initialSettings }: Props) {
  const [form, setForm] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/settings", {
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
      <Section title="Business Info">
        <Field label="Business Name">
          <input className={inputClass} value={form.businessName} onChange={(e) => update("businessName", e.target.value)} />
        </Field>
        <Field label="Tagline">
          <input className={inputClass} value={form.tagline} onChange={(e) => update("tagline", e.target.value)} />
        </Field>
        <Field label="Email">
          <input type="email" className={inputClass} value={form.email} onChange={(e) => update("email", e.target.value)} />
        </Field>
        <Field label="Phone">
          <input className={inputClass} value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </Field>
        <Field label="Address / Location">
          <input className={inputClass} value={form.address} onChange={(e) => update("address", e.target.value)} />
        </Field>
        <Field label="Free Shipping Threshold (pence)">
          <input type="number" className={inputClass} value={form.freeShippingThreshold} onChange={(e) => update("freeShippingThreshold", Number(e.target.value))} />
        </Field>
      </Section>

      <Section title="Homepage Hero">
        <Field label="Hero Headline" full>
          <input className={inputClass} value={form.heroTitle} onChange={(e) => update("heroTitle", e.target.value)} />
        </Field>
        <Field label="Hero Subtitle" full>
          <textarea rows={3} className="w-full px-3 py-2.5 rounded-xl border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors resize-none bg-white" value={form.heroSubtitle} onChange={(e) => update("heroSubtitle", e.target.value)} />
        </Field>
        <Field label="Primary CTA Button Text">
          <input className={inputClass} value={form.heroPrimaryCta} onChange={(e) => update("heroPrimaryCta", e.target.value)} />
        </Field>
        <Field label="Secondary CTA Button Text">
          <input className={inputClass} value={form.heroSecondaryCta} onChange={(e) => update("heroSecondaryCta", e.target.value)} />
        </Field>
      </Section>

      <Section title="Custom Order Section">
        <Field label="Section Title" full>
          <input className={inputClass} value={form.customOrderTitle} onChange={(e) => update("customOrderTitle", e.target.value)} />
        </Field>
        <Field label="Section Subtitle" full>
          <textarea rows={3} className="w-full px-3 py-2.5 rounded-xl border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors resize-none bg-white" value={form.customOrderSubtitle} onChange={(e) => update("customOrderSubtitle", e.target.value)} />
        </Field>
      </Section>

      <Section title="Social Links">
        {(["socialInstagram", "socialFacebook", "socialTiktok"] as const).map((key) => (
          <Field key={key} label={key.replace("social", "")}>
            <input className={inputClass} value={form[key]} onChange={(e) => update(key, e.target.value)} placeholder="https://…" />
          </Field>
        ))}
      </Section>

      <Section title="SEO / Meta">
        <Field label="Meta Title" full>
          <input className={inputClass} value={form.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} />
        </Field>
        <Field label="Meta Description" full>
          <textarea rows={2} className="w-full px-3 py-2.5 rounded-xl border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors resize-none bg-white" value={form.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} />
        </Field>
      </Section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 h-11 px-6 bg-[#ef8733] text-white rounded-xl font-semibold text-sm hover:bg-[#ea7316] transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Save size={16} /> {loading ? "Saving…" : "Save Settings"}
        </button>
        {saved && (
          <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
            <CheckCircle2 size={16} /> Settings saved!
          </div>
        )}
      </div>
    </form>
  );
}
