"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What file formats do you accept for artwork?",
    a: "We accept PNG, JPG, SVG, PDF, Adobe Illustrator (.ai), and EPS files. For the best print quality, we recommend vector files (SVG, AI, EPS) at 300 DPI or higher.",
  },
  {
    q: "How long does production take?",
    a: "Standard orders are dispatched within 3–5 business days. Express 48-hour dispatch is available for most products. Custom quotes may require additional time depending on complexity and quantity.",
  },
  {
    q: "Can I get a sample before placing a bulk order?",
    a: "Yes! We offer samples for most products. Contact us via the Custom Order form and we'll discuss sample options. Sample costs are usually credited against your bulk order.",
  },
  {
    q: "What is your minimum order quantity?",
    a: "Many of our products have no minimum order — you can order just 1. Bulk-only products (like branded mugs) typically start at 24 units. Check each product page for details.",
  },
  {
    q: "Do you ship outside the UK?",
    a: "Currently we ship to the UK and Ireland. International shipping for large orders can be arranged — contact us to discuss.",
  },
  {
    q: "What is your returns policy?",
    a: "Because our products are custom-made, we don't accept returns unless the product is defective or differs from your approved proof. If there's an issue, we'll reprint at no charge.",
  },
  {
    q: "Can I see a proof before printing?",
    a: "Absolutely. For all custom orders and quote requests, we'll send a digital proof for your approval before we start production. No surprises.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#e5e1d8] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left gap-4 cursor-pointer"
        aria-expanded={open}
      >
        <span className="font-semibold text-[#111111] text-sm sm:text-base">{q}</span>
        <ChevronDown
          size={18}
          className={cn("text-[#6b7280] shrink-0 transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="pb-5 -mt-1">
          <p className="text-sm text-[#6b7280] leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
      <div className="text-center mb-12">
        <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-2">FAQ</p>
        <h2 className="font-display font-800 text-4xl text-[#111111]">Frequently asked questions</h2>
      </div>
      <div className="bg-white rounded-2xl border border-[#e5e1d8] px-6">
        {faqs.map((item) => (
          <FAQItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </section>
  );
}
