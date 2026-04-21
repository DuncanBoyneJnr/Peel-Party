import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedProducts } from "@/lib/data";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";

export default function FeaturedBundles() {
  const featured = getFeaturedProducts().slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-2">Ready to buy</p>
          <h2 className="font-display font-800 text-4xl text-[#111111]">Featured Products</h2>
        </div>
        <Link href="/shop" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#ef8733] hover:gap-3 transition-all">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="text-center mt-10 sm:hidden">
        <Link href="/shop">
          <Button variant="outline">View All Products</Button>
        </Link>
      </div>
    </section>
  );
}
