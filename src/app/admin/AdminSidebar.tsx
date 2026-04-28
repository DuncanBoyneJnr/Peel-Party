"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Images, MessageSquare,
  Settings, LogOut, ExternalLink, Menu, X, Gift, TrendingUp, Layers, Truck,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Bundles", href: "/admin/bundles", icon: Gift },
  { label: "Gallery", href: "/admin/gallery", icon: Images },
  { label: "Quote Requests", href: "/admin/quotes", icon: MessageSquare },
  { label: "Costs & Profit", href: "/admin/costs", icon: TrendingUp },
  { label: "Materials", href: "/admin/materials", icon: Layers },
  { label: "Postage", href: "/admin/postage", icon: Truck },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#ef8733] rounded-lg flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L11.5 7H16.5L12.5 10.5L14 16L9 13L4 16L5.5 10.5L1.5 7H6.5L9 2Z" fill="white" />
            </svg>
          </div>
          <div>
            <p className="font-display font-700 text-white text-sm leading-none">EL4 Designs</p>
            <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {nav.map(({ label, href, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-[#ef8733] text-white shadow-sm"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 flex flex-col gap-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-all"
        >
          <ExternalLink size={17} /> View Site
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer w-full text-left"
        >
          <LogOut size={17} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-64 bg-[#111111] flex-col z-30">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#111111] border-b border-white/10 flex items-center justify-between px-4 h-14">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#ef8733] rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L11.5 7H16.5L12.5 10.5L14 16L9 13L4 16L5.5 10.5L1.5 7H6.5L9 2Z" fill="white" />
            </svg>
          </div>
          <span className="font-display font-700 text-white text-sm">Admin</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <div className="lg:hidden h-14" />

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-20 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="lg:hidden fixed top-14 left-0 bottom-0 w-64 bg-[#111111] z-20 overflow-y-auto">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
