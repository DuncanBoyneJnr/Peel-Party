import Link from "next/link";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";

const links = {
  Shop: [
    { label: "All Products", href: "/shop" },
    { label: "Stickers", href: "/shop/stickers" },
    { label: "Mugs", href: "/shop/mugs" },
    { label: "Keyrings", href: "/shop/keyrings" },
    { label: "Coasters", href: "/shop/coasters" },
    { label: "Magnets", href: "/shop/magnets" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Our Work", href: "/gallery" },
    { label: "Contact", href: "/contact" },
    { label: "Custom Orders", href: "/custom-order" },
    { label: "FAQ", href: "/#faq" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Returns & Refunds", href: "/returns" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <Image src="/logo.png" alt="Peel & Party Co." width={120} height={120} className="h-16 w-auto brightness-0 invert" />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Custom merchandise made with love. Stickers, mugs, keyrings, coasters and magnets for businesses, events, and gifts — all printed to order.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="#"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#ef8733] transition-colors"
                aria-label="Instagram"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#ef8733] transition-colors"
                aria-label="Facebook"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a
                href="mailto:hello@el4designs.co.uk"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#ef8733] transition-colors"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
            </div>
            <div className="mt-4 flex flex-col gap-2 text-sm text-gray-400">
              <a href="mailto:hello@el4designs.co.uk" className="flex items-center gap-2 hover:text-[#ef8733] transition-colors">
                <Mail size={14} /> hello@el4designs.co.uk
              </a>
              <a href="tel:+441234567890" className="flex items-center gap-2 hover:text-[#ef8733] transition-colors">
                <Phone size={14} /> 01234 567 890
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">{title}</h4>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-gray-300 hover:text-[#ef8733] transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Peel & Party Co. All rights reserved.</p>
          <p>Made with ♥ in the UK</p>
        </div>
      </div>
    </footer>
  );
}
