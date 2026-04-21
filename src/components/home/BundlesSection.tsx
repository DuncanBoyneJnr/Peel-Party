import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { getBundles } from "@/lib/server-data";
import { formatPrice } from "@/lib/utils";

export default function BundlesSection() {
  const bundles = getBundles().filter((b) => b.active && b.featured);
  if (bundles.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-2">Curated sets</p>
          <h2 className="font-display font-800 text-4xl text-[#111111]">Ready-Made Bundles</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles.map((bundle) => (
          <div key={bundle.id} className="relative bg-white rounded-2xl border-2 border-[#e5e1d8] hover:border-[#ef8733] hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">
            {bundle.badge && (
              <div className="absolute top-4 right-4 text-xs font-bold px-3 py-1 bg-[#ef8733] text-white rounded-full">
                {bundle.badge}
              </div>
            )}

            {/* Header */}
            <div className="bg-[#f9f7f4] px-6 pt-8 pb-6">
              <div className="text-4xl mb-3">{bundle.emoji || "📦"}</div>
              <h3 className="font-display font-800 text-xl text-[#111111] mb-1">{bundle.name}</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">{bundle.tagline}</p>
            </div>

            {/* Items */}
            <div className="px-6 py-5 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-3">What&apos;s included</p>
              <ul className="flex flex-col gap-2">
                {bundle.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 size={15} className="text-[#ef8733] shrink-0 mt-0.5" />
                    <span className="text-[#111111]">
                      <span className="font-medium">{item.name}</span>
                      {item.qty && <span className="text-[#6b7280]"> — {item.qty}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price + CTA */}
            <div className="px-6 pb-6 pt-4 border-t border-[#e5e1d8]">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-display font-800 text-2xl text-[#111111]">{formatPrice(bundle.price)}</span>
                {bundle.originalPrice && (
                  <span className="text-sm text-[#6b7280] line-through">{formatPrice(bundle.originalPrice)}</span>
                )}
              </div>
              <Link
                href="/custom-order"
                className="flex items-center justify-center gap-2 w-full h-11 bg-[#ef8733] text-white rounded-xl text-sm font-semibold hover:bg-[#ea7316] transition-colors"
              >
                Request This Bundle <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
