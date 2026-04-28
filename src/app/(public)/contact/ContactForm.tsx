"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  }

  const inputClass = "w-full h-11 px-4 rounded-xl border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors";

  if (submitted) {
    return (
      <div className="h-full min-h-64 flex flex-col items-center justify-center text-center gap-4 bg-[#f9f7f4] rounded-2xl border border-[#e5e1d8] p-10">
        <CheckCircle2 size={48} className="text-[#ef8733]" />
        <div>
          <p className="font-display font-700 text-2xl text-[#111111] mb-2">Message sent!</p>
          <p className="text-[#6b7280]">Thanks, <strong>{form.name}</strong>. We'll get back to you at {form.email} within a few hours.</p>
        </div>
        <button onClick={() => setSubmitted(false)} className="text-sm text-[#ef8733] font-semibold hover:underline cursor-pointer">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#e5e1d8] p-8 flex flex-col gap-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#111111] mb-1.5">Your Name *</label>
          <input required className={inputClass} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Jane Smith" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#111111] mb-1.5">Email Address *</label>
          <input required type="email" className={inputClass} value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@example.com" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#111111] mb-1.5">Subject *</label>
        <input required className={inputClass} value={form.subject} onChange={(e) => update("subject", e.target.value)} placeholder="What can we help with?" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#111111] mb-1.5">Message *</label>
        <textarea
          required
          rows={6}
          className="w-full px-4 py-3 rounded-xl border-2 border-[#e5e1d8] text-sm resize-none focus:outline-none focus:border-[#ef8733] transition-colors"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Tell us how we can help…"
        />
      </div>
      <Button type="submit" size="lg" loading={loading} fullWidth>
        <Send size={16} /> Send Message
      </Button>
    </form>
  );
}
