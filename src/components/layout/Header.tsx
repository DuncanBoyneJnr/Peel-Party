"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ShoppingCart, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Shop All", href: "/shop" },
  { label: "Stickers", href: "/shop/stickers" },
  { label: "Mugs", href: "/shop/mugs" },
  { label: "Keyrings", href: "/shop/keyrings" },
  { label: "Coasters", href: "/shop/coasters" },
  { label: "Magnets", href: "/shop/magnets" },
  { label: "Our Work", href: "/gallery" },
  { label: "Custom Order", href: "/custom-order" },
  { label: "About", href: "/about" },
];

export default function Header() {
  const { totalItems, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-[#e5e1d8]"
            : "bg-white border-b border-[#e5e1d8]"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-20 gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image src="/logo.png" alt="Peel & Party Co." width={160} height={160} className="h-14 w-auto max-w-[140px]" priority />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-1 flex-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  item.label === "Custom Order"
                    ? "text-[#ef8733] font-semibold hover:bg-[#fff7ed]"
                    : "text-[#111111] hover:bg-[#f0ede8] hover:text-[#ef8733]"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#f0ede8] transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search size={18} className="text-[#111111]" />
            </button>

            <Link
              href="/contact"
              className="hidden md:inline-flex items-center h-9 px-4 text-sm font-semibold border-2 border-[#111111] rounded-full hover:bg-[#111111] hover:text-white transition-colors"
            >
              Contact
            </Link>

            <button
              onClick={openCart}
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#f0ede8] transition-colors cursor-pointer"
              aria-label={`Cart, ${totalItems} items`}
            >
              <ShoppingCart size={18} className="text-[#111111]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ef8733] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="xl:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#f0ede8] transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="xl:hidden border-t border-[#e5e1d8] bg-white px-4 pb-4">
            <nav className="flex flex-col pt-2 gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                    item.label === "Custom Order"
                      ? "text-[#ef8733] font-semibold hover:bg-[#fff7ed]"
                      : "text-[#111111] hover:bg-[#f0ede8]"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center justify-center h-11 bg-[#111111] text-white rounded-full text-sm font-semibold"
              >
                Contact Us
              </Link>
            </nav>
          </div>
        )}
      </header>
      {/* Spacer for fixed header */}
      <div className="h-20" />
    </>
  );
}
