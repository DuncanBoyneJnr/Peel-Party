import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using our website and placing orders.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-display font-700 text-xl text-[#111111] mb-3">{title}</h2>
      <div className="text-[#6b7280] leading-relaxed flex flex-col gap-3">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-12">
        <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-2">Legal</p>
        <h1 className="font-display font-800 text-4xl text-[#111111] mb-3">Terms of Service</h1>
        <p className="text-[#6b7280]">Last updated: April 2025</p>
      </div>

      <Section title="About these terms">
        <p>These terms apply when you use our website or place an order with EL4 Designs. By placing an order you agree to these terms. Please read them carefully.</p>
      </Section>

      <Section title="Orders and contract">
        <p>All orders are subject to acceptance and availability. We reserve the right to decline any order. A contract is formed when we confirm your order by email.</p>
        <p>Because our products are made to order, we ask you to check all artwork, text, and options carefully before confirming. We will send a digital proof for approval before production on all custom orders.</p>
      </Section>

      <Section title="Pricing">
        <p>All prices are shown in pounds sterling (GBP) and include VAT where applicable. We reserve the right to update prices at any time; the price shown at the time of your order is the price you will be charged.</p>
      </Section>

      <Section title="Artwork and intellectual property">
        <p>By uploading artwork or supplying a design, you confirm that you own the rights to that artwork or have permission to use it, and that it does not infringe any third-party intellectual property rights. We accept no liability for orders placed using artwork that infringes copyright or trademarks.</p>
      </Section>

      <Section title="Production and dispatch">
        <p>Standard production time is 3–5 business days from proof approval. We will notify you when your order is dispatched. Delivery timescales are estimates and not guaranteed.</p>
      </Section>

      <Section title="Liability">
        <p>Our liability to you is limited to the value of your order. We are not liable for indirect or consequential losses. Nothing in these terms limits our liability for death, personal injury, or fraudulent misrepresentation.</p>
      </Section>

      <Section title="Governing law">
        <p>These terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
      </Section>

      <Section title="Contact">
        <p>Questions about these terms? <Link href="/contact" className="text-[#ef8733] hover:underline">Get in touch</Link>.</p>
      </Section>
    </div>
  );
}
