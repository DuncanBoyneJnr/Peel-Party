export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getGallery } from "@/lib/server-data";

export const metadata: Metadata = {
  title: "Our Work — Gallery",
  description: "See what we've made for real customers — mugs, coasters, tote bags, clothing, party items, keyrings and much more.",
};

export default async function GalleryPage() {
  const gallery = await getGallery();
  const categories = ["All", ...Array.from(new Set(gallery.map((i) => i.category))).sort()];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-3">Our Work</p>
        <h1 className="font-display font-800 text-5xl text-[#111111] mb-4">
          Here's what we can make
        </h1>
        <p className="text-[#6b7280] text-xl max-w-2xl mx-auto leading-relaxed">
          Real products made for real customers. F1 fan merch, birthday party kits, personalised gifts, clothing, drinkware — if you can imagine it, we can print it.
        </p>
      </div>

      {/* Category scroll */}
      {gallery.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-12 scrollbar-hide">
          {categories.map((cat, i) => (
            <span
              key={cat}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border cursor-default ${
                i === 0
                  ? "bg-[#ef8733] border-[#ef8733] text-white"
                  : "bg-white border-[#e5e1d8] text-[#111111]"
              }`}
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* Gallery grid */}
      {gallery.length === 0 ? (
        <div className="text-center py-20 text-[#6b7280]">
          <p className="text-lg">Gallery images coming soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl overflow-hidden border border-[#e5e1d8] bg-[#f9f7f4]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-block bg-[#ef8733] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display font-700 text-lg text-[#111111] mb-1">{item.title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed mb-3">{item.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-xs font-medium bg-[#f0ede8] text-[#111111] rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-16 bg-[#111111] rounded-2xl p-10 text-center">
        <h2 className="font-display font-800 text-3xl text-white mb-3">
          Don't see exactly what you need?
        </h2>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
          This gallery is just a taste. We produce hundreds of different product types — get in touch and tell us what you're after.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/custom-order"
            className="inline-flex items-center gap-2 h-12 px-6 bg-[#ef8733] text-white rounded-full font-semibold hover:bg-[#ea7316] transition-colors"
          >
            Request a Custom Quote <ArrowRight size={16} />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 h-12 px-6 bg-white/10 text-white border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-colors"
          >
            Talk to Us
          </Link>
        </div>
      </div>
    </div>
  );
}
