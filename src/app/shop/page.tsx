import { Metadata } from "next";
import Link from "next/link";
import { products } from "@/lib/data";
import ProductCard from "@/components/ui/ProductCard";

export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse our full range of custom stickers, personalised mugs, and keyrings.",
};

const categories = [
  { label: "All", value: "all" },
  { label: "Stickers", value: "stickers" },
  { label: "Mugs", value: "mugs" },
  { label: "Keyrings", value: "keyrings" },
];

export default function ShopPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-1">Our Products</p>
        <h1 className="font-display font-800 text-4xl sm:text-5xl text-[#111111] mb-3">Shop Everything</h1>
        <p className="text-[#6b7280] text-lg max-w-xl">
          Custom-printed merchandise for any occasion. Buy instantly or request a tailored quote.
        </p>
      </div>

      {/* Category filter links */}
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={cat.value === "all" ? "/shop" : `/shop/${cat.value}`}
            className="px-4 py-2 rounded-full border border-[#e5e1d8] text-sm font-medium hover:border-[#ef8733] hover:text-[#ef8733] transition-colors"
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 p-8 bg-[#f9f7f4] rounded-2xl border border-[#e5e1d8] text-center">
        <h2 className="font-display font-700 text-2xl text-[#111111] mb-2">Can't find what you need?</h2>
        <p className="text-[#6b7280] mb-4">We do fully custom work. Tell us what you're after and we'll quote you.</p>
        <Link
          href="/custom-order"
          className="inline-flex items-center h-11 px-6 bg-[#ef8733] text-white rounded-full text-sm font-semibold hover:bg-[#ea7316] transition-colors"
        >
          Request a Custom Quote
        </Link>
      </div>
    </div>
  );
}
