import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProducts } from "@/lib/server-data";
import { formatPrice } from "@/lib/utils";

export default function AlsoViewed() {
  const products = getProducts().filter((p) => p.inStock).slice(0, 8);

  return (
    <section className="py-16 bg-[#f9f7f4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-2">Popular right now</p>
            <h2 className="font-display font-800 text-3xl text-[#111111]">Others Also Viewed</h2>
          </div>
          <Link href="/shop" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#ef8733] hover:gap-3 transition-all">
            Shop all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 scrollbar-hide snap-x snap-mandatory">
          {products.map((product) => {
            const isQuote = product.orderType === "request-quote";
            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group flex-none w-52 snap-start bg-white rounded-2xl border border-[#e5e1d8] hover:border-[#ef8733] hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="bg-[#f0ede8] aspect-square flex items-center justify-center relative">
                  <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
                    <rect width="64" height="64" rx="8" fill="#e5e1d8"/>
                    <path d="M20 44L28 32L36 40L42 34L52 44H20Z" fill="#d1c8bc"/>
                    <circle cx="26" cy="26" r="4" fill="#d1c8bc"/>
                  </svg>
                  {product.badge && (
                    <span className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 bg-[#ef8733] text-white rounded-full">
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-[#ef8733] uppercase tracking-wide mb-0.5">{product.category}</p>
                  <p className="text-sm font-display font-700 text-[#111111] leading-snug line-clamp-2 group-hover:text-[#ef8733] transition-colors mb-2">
                    {product.name}
                  </p>
                  {isQuote ? (
                    <p className="text-xs font-semibold text-[#6b7280]">Price on request</p>
                  ) : (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-[#111111]">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-[#6b7280] line-through">{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
