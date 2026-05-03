import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    slug: "stickers",
    title: "Stickers",
    description: "Die-cut, kiss-cut, holographic & sheet stickers. Any shape, any size, any finish.",
    colour: "#ef8733",
    lightColour: "#fff7ed",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#ef8733" fillOpacity="0.15"/>
        <path d="M24 12L27.5 20H36L29.5 25.5L32 34L24 29.5L16 34L18.5 25.5L12 20H20.5L24 12Z" fill="#ef8733"/>
      </svg>
    ),
  },
  {
    slug: "mugs",
    title: "Mugs",
    description: "Personalised photo mugs and branded business mugs, printed to order.",
    colour: "#111111",
    lightColour: "#f9f7f4",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#111111" fillOpacity="0.08"/>
        <rect x="10" y="14" width="22" height="22" rx="3" fill="#111111" fillOpacity="0.15" stroke="#111111" strokeWidth="2"/>
        <path d="M32 18h3a4 4 0 0 1 0 8h-3" stroke="#111111" strokeWidth="2" strokeLinecap="round"/>
        <line x1="15" y1="36" x2="27" y2="36" stroke="#111111" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    slug: "keyrings",
    title: "Keyrings",
    description: "Available in acrylic or MDF only. Cut to any shape, bulk-friendly.",
    colour: "#ef8733",
    lightColour: "#fff7ed",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#ef8733" fillOpacity="0.15"/>
        <circle cx="20" cy="22" r="8" stroke="#ef8733" strokeWidth="2.5" fill="none"/>
        <circle cx="20" cy="22" r="3" fill="#ef8733"/>
        <path d="M28 22h8l-2 6" stroke="#ef8733" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    slug: "coasters",
    title: "Coasters",
    description: "Personalised photo and design coasters. Perfect for gifts, weddings, and home décor.",
    colour: "#6366f1",
    lightColour: "#eef2ff",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#6366f1" fillOpacity="0.15"/>
        <circle cx="24" cy="24" r="12" stroke="#6366f1" strokeWidth="2.5" fill="none"/>
        <circle cx="24" cy="24" r="6" stroke="#6366f1" strokeWidth="2" fill="none"/>
        <circle cx="24" cy="24" r="2" fill="#6366f1"/>
      </svg>
    ),
  },
  {
    slug: "magnets",
    title: "Magnets",
    description: "Custom printed magnets. Great for fridges, lockers, and promotional use.",
    colour: "#10b981",
    lightColour: "#ecfdf5",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#10b981" fillOpacity="0.15"/>
        <path d="M16 14h4v12a4 4 0 0 0 8 0V14h4v12a8 8 0 0 1-16 0V14Z" fill="#10b981" fillOpacity="0.3" stroke="#10b981" strokeWidth="2" strokeLinejoin="round"/>
        <line x1="14" y1="14" x2="20" y2="14" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="28" y1="14" x2="34" y2="14" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    slug: "tshirts",
    title: "T-Shirts",
    description: "Custom printed t-shirts. Any design, any colour — perfect for events, teams, and gifts.",
    colour: "#8b5cf6",
    lightColour: "#f5f3ff",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#8b5cf6" fillOpacity="0.15"/>
        <path d="M14 16l6-4h8l6 4-4 4v14H18V20l-4-4Z" fill="#8b5cf6" fillOpacity="0.25" stroke="#8b5cf6" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M14 16l-4 6h6" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M34 16l4 6h-6" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    slug: "bookmarks",
    title: "Bookmarks",
    description: "Personalised bookmarks. A thoughtful gift for readers, events, and giveaways.",
    colour: "#f43f5e",
    lightColour: "#fff1f2",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#f43f5e" fillOpacity="0.15"/>
        <path d="M16 10h16v28l-8-6-8 6V10Z" fill="#f43f5e" fillOpacity="0.25" stroke="#f43f5e" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="font-display font-800 text-4xl text-[#111111] mb-3">Shop by Category</h2>
        <p className="text-[#6b7280] text-lg max-w-xl mx-auto">
          Whether you need one or ten thousand — we've got you covered.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/shop/${cat.slug}`}
            className="group relative flex flex-col p-8 rounded-2xl border border-[#e5e1d8] hover:border-transparent hover:shadow-xl transition-all duration-300 overflow-hidden"
            style={{ backgroundColor: cat.lightColour }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(135deg, ${cat.colour}08 0%, ${cat.colour}18 100%)` }}
            />
            <div className="relative">
              {cat.icon}
              <h3 className="font-display font-700 text-2xl text-[#111111] mt-5 mb-2">{cat.title}</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed mb-6">{cat.description}</p>
              <div
                className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                style={{ color: cat.colour }}
              >
                Shop {cat.title}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
