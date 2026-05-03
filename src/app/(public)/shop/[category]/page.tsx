export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductsByCategory } from "@/lib/server-data";
import { categoryMeta } from "@/lib/data";
import { Category } from "@/lib/types";
import ProductCard from "@/components/ui/ProductCard";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const meta = categoryMeta[category as Category];
  if (!meta) return {};
  return { title: meta.title, description: meta.description };
}

export function generateStaticParams() {
  return [
    { category: "stickers" },
    { category: "vinyl" },
    { category: "mugs" },
    { category: "keyrings" },
    { category: "coasters" },
    { category: "magnets" },
    { category: "tshirts" },
    { category: "bookmarks" },
  ];
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;

  if (!["stickers", "vinyl", "mugs", "keyrings", "coasters", "magnets", "tshirts", "bookmarks"].includes(category)) notFound();

  const meta = categoryMeta[category as Category];
  const categoryProducts = await getProductsByCategory(category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <nav className="flex items-center gap-2 text-sm text-[#6b7280] mb-8">
        <Link href="/" className="hover:text-[#ef8733] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#ef8733] transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-[#111111] font-medium">{meta.title}</span>
      </nav>

      <div className="mb-10">
        <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-1">{meta.title}</p>
        <h1 className="font-display font-800 text-4xl sm:text-5xl text-[#111111] mb-3">{meta.title}</h1>
        <p className="text-[#6b7280] text-lg max-w-xl">{meta.description}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {[
          { label: "All Products", href: "/shop" },
          { label: "Stickers", href: "/shop/stickers" },
          { label: "Vinyl", href: "/shop/vinyl" },
          { label: "Mugs", href: "/shop/mugs" },
          { label: "Keyrings", href: "/shop/keyrings" },
          { label: "Coasters", href: "/shop/coasters" },
          { label: "Magnets", href: "/shop/magnets" },
          { label: "T-Shirts", href: "/shop/tshirts" },
          { label: "Bookmarks", href: "/shop/bookmarks" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              item.href === `/shop/${category}`
                ? "bg-[#ef8733] border-[#ef8733] text-white"
                : "border-[#e5e1d8] text-[#111111] hover:border-[#ef8733] hover:text-[#ef8733]"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {categoryProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#6b7280]">No products found in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="mt-16 p-8 bg-[#111111] rounded-2xl text-center">
        <h2 className="font-display font-700 text-2xl text-white mb-2">Need something bespoke?</h2>
        <p className="text-gray-400 mb-5">Custom shapes, sizes, finishes — we'll quote you fast.</p>
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
