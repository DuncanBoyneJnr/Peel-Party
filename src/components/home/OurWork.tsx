import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const items = [
  {
    src: "/mugs-gallery.jpeg",
    label: "Mugs",
    caption: "F1, personalised & pop culture",
    span: "col-span-1 row-span-2",
  },
  {
    src: "/f1-merch.jpeg",
    label: "F1 Merch",
    caption: "Coasters, keyrings & mugs",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/Coasters.jpeg",
    label: "Coasters",
    caption: "Cork-backed photo coasters",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/tote-bags.jpeg",
    label: "Tote Bags",
    caption: "Full sublimation print",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/misc-2.jpeg",
    label: "Personalised Gifts",
    caption: "Cups, bags & more",
    span: "col-span-1 row-span-1",
  },
];

export default function OurWork() {
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

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 grid-rows-2 gap-3 h-[520px] sm:h-[600px] lg:h-[680px]">
        {/* Large left tile */}
        <div className="relative col-span-1 row-span-2 rounded-2xl overflow-hidden group">
          <Image
            src={items[0].src}
            alt={items[0].label}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <span className="inline-block bg-[#ef8733] text-white text-xs font-semibold px-3 py-1 rounded-full mb-1">
              {items[0].label}
            </span>
            <p className="text-white text-sm font-medium">{items[0].caption}</p>
          </div>
        </div>

        {/* Top right two tiles */}
        {[items[1], items[2]].map((item) => (
          <div key={item.src} className="relative rounded-2xl overflow-hidden group">
            <Image
              src={item.src}
              alt={item.label}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className="inline-block bg-[#ef8733] text-white text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1">
                {item.label}
              </span>
              <p className="text-white text-xs">{item.caption}</p>
            </div>
          </div>
        ))}

        {/* Bottom right two tiles */}
        {[items[3], items[4]].map((item) => (
          <div key={item.src} className="relative rounded-2xl overflow-hidden group">
            <Image
              src={item.src}
              alt={item.label}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className="inline-block bg-[#ef8733] text-white text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1">
                {item.label}
              </span>
              <p className="text-white text-xs">{item.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom strip — product type tags */}
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
