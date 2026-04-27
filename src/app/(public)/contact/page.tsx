"use client";

import { useState } from "react";
import { Mail, Phone, Clock, MapPin, Send, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ContactPage() {
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-14">
        <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-2">Get in touch</p>
        <h1 className="font-display font-800 text-4xl sm:text-5xl text-[#111111] mb-3">We'd love to hear from you</h1>
        <p className="text-[#6b7280] text-lg max-w-xl mx-auto">
          Have a question, need a quote, or just want to say hello? We're a real team and we respond quickly.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Contact info */}
        <div className="flex flex-col gap-5">
          {[
            { icon: Mail, title: "Email", body: "hello@el4designs.co.uk", sub: "We respond within 4 hours" },
            { icon: Phone, title: "Phone", body: "01234 567 890", sub: "Mon–Fri, 9am–5pm" },
            { icon: Clock, title: "Business Hours", body: "Mon–Fri: 9am–5pm", sub: "Sat: 10am–2pm (email only)" },
            { icon: MapPin, title: "Studio", body: "Birmingham, UK", sub: "Not open to the public" },
          ].map(({ icon: Icon, title, body, sub }) => (
            <div key={title} className="flex items-start gap-4 p-5 bg-[#f9f7f4] rounded-2xl border border-[#e5e1d8]">
              <div className="w-10 h-10 bg-[#ef8733]/10 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={18} className="text-[#ef8733]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111111]">{title}</p>
                <p className="text-sm text-[#111111]">{body}</p>
                <p className="text-xs text-[#6b7280] mt-0.5">{sub}</p>
              </div>
            </div>
          ))}

          <div className="p-5 bg-[#111111] rounded-2xl">
            <p className="font-display font-700 text-white text-lg mb-2">Need a quote?</p>
            <p className="text-sm text-gray-400 mb-4">Use our dedicated custom order form for bulk and bespoke orders.</p>
            <a href="/custom-order" className="inline-flex items-center h-9 px-4 bg-[#ef8733] text-white rounded-full text-sm font-semibold hover:bg-[#ea7316] transition-colors">
              Custom Order Form
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          {submitted ? (
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
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
