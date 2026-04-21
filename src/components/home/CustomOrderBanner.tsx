import Link from "next/link";
import { Building2, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";

const benefits = [
  "Bulk discounts from 25 units",
  "Artwork review before print",
  "Dedicated account support",
  "Fast turnaround — from 48 hours",
  "Fully branded packaging available",
  "Samples available on request",
];

export default function CustomOrderBanner() {
  return (
    <section className="bg-[#111111] py-20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ef8733]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#ef8733]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#ef8733]/20 text-[#ef8733] text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Building2 size={14} />
              Businesses & Bulk Orders
            </div>
            <h2 className="font-display font-800 text-4xl lg:text-5xl text-white leading-tight mb-4">
              Need something
              <span className="text-[#ef8733]"> custom?</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              From corporate branded merchandise to wedding favours — we handle everything from artwork review through to delivery. Tell us what you need and we'll quote within 24 hours.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/custom-order">
                <Button size="lg">
                  Request a Free Quote <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#111111]">
                  Talk to Us
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: benefits grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b) => (
              <div key={b} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <CheckCircle2 size={18} className="text-[#ef8733] mt-0.5 shrink-0" />
                <p className="text-sm text-gray-300">{b}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Who it's for */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 text-center mb-6">
            Trusted by
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {["Small Businesses", "Event Planners", "Sports Clubs", "Schools & Charities", "Wedding & Celebrations", "Market Traders"].map(
              (label) => (
                <div key={label} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 rounded-full border border-white/10">
                  <Users size={14} className="text-[#ef8733]" />
                  <span className="text-sm text-gray-300">{label}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
