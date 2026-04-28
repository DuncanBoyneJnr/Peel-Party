import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getGallery } from "@/lib/server-data";

export default async function OurWork() {
  const allItems = await getGallery();
  const items = allItems.slice(0, 5);

  if (items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-2">
            Real work, real customers
          </p>
          <h2 className="font-display font-800 text-4xl text-[#111111]">
            Here's what we can make
          </h2>
          <p className="text-[#6b7280] mt-2 max-w-lg">
            From F1 fan merch to birthday party kits — if you can imagine it, we can print it.
          </p>
        </div>
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#ef8733] hover:gap-3 transition-all whitespace-nowrap"
        >
          View full gallery <ArrowRight size={14} />
        </Link>
      </div>

      {/* Grid — mosaic layout for 5 items, simpler grid for fewer */}
      {items.length >= 5 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 grid-rows-2 gap-3 h-[520px] sm:h-[600px] lg:h-[680px]">
          {/* Large left tile */}
          <Tile item={items[0]} className="col-span-1 row-span-2" large />
          {/* Top right two */}
          <Tile item={items[1]} />
          <Tile item={items[2]} />
          {/* Bottom right two */}
          <Tile item={items[3]} />
          <Tile item={items[4]} />
        </div>
      ) : (
        <div className={`grid gap-3 h-64 sm:h-80 ${items.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {items.map((item) => (
            <Tile key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Bottom strip */}
      <div className="mt-6 flex flex-wrap gap-2 items-center">
        <span className="text-sm text-[#6b7280] font-medium mr-1">We also make:</span>
        {[
          "T-shirts", "Hoodies", "Tumblers", "Water Bottles", "Keyrings",
          "Party Bags", "Cake Toppers", "Room Signs", "Pet Bowls",
          "Christmas Items", "Easter Gifts", "Event Packs",
        ].map((tag) => (
          <span
            key={tag}
            className="px-3 py-1.5 text-xs font-medium bg-[#f9f7f4] border border-[#e5e1d8] rounded-full text-[#111111]"
          >
            {tag}
          </span>
        ))}
        <Link
          href="/custom-order"
          className="px-3 py-1.5 text-xs font-semibold bg-[#ef8733] text-white rounded-full hover:bg-[#ea7316] transition-colors"
        >
          + Request anything →
        </Link>
      </div>
    </section>
  );
}

function Tile({
  item,
  className = "",
  large = false,
}: {
  item: { src: string; title: string; category: string };
  className?: string;
  large?: boolean;
}) {
  return (
    <div className={`relative rounded-2xl overflow-hidden group ${className}`}>
      <Image
        src={item.src}
        alt={item.title}
        fill
        sizes="(max-width: 768px) 50vw, 33vw"
        className="object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className={`absolute left-3 ${large ? "bottom-4" : "bottom-3"}`}>
        <span className={`inline-block bg-[#ef8733] text-white font-semibold px-3 py-0.5 rounded-full mb-1 ${large ? "text-xs" : "text-xs"}`}>
          {item.category}
        </span>
        <p className={`text-white font-medium ${large ? "text-sm" : "text-xs"}`}>{item.title}</p>
      </div>
    </div>
  );
}
