export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { getBundles } from "@/lib/server-data";
import { formatPrice } from "@/lib/utils";
import BundleDeleteButton from "./BundleDeleteButton";

export default function BundlesPage() {
  const bundles = getBundles();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-800 text-3xl text-[#111111]">Bundles</h1>
          <p className="text-[#6b7280] mt-1">Curated product sets shown on the homepage</p>
        </div>
        <Link
          href="/admin/bundles/new"
          className="inline-flex items-center gap-2 h-10 px-5 bg-[#ef8733] text-white rounded-xl text-sm font-semibold hover:bg-[#ea7316] transition-colors"
        >
          <Plus size={16} /> New Bundle
        </Link>
      </div>

      {bundles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-[#e5e1d8]">
          <Package size={40} className="text-[#d1c8bc] mb-4" />
          <p className="font-display font-700 text-lg text-[#111111] mb-1">No bundles yet</p>
          <p className="text-sm text-[#6b7280] mb-6">Create your first bundle to show it on the homepage.</p>
          <Link href="/admin/bundles/new" className="inline-flex items-center gap-2 h-10 px-5 bg-[#ef8733] text-white rounded-xl text-sm font-semibold hover:bg-[#ea7316] transition-colors">
            <Plus size={16} /> Create Bundle
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {bundles.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-[#e5e1d8] p-5 flex items-start gap-5">
              <div className="w-12 h-12 bg-[#f9f7f4] rounded-xl flex items-center justify-center text-2xl shrink-0">
                {b.emoji || "📦"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-display font-700 text-[#111111]">{b.name}</p>
                  {b.badge && <span className="text-xs font-semibold px-2 py-0.5 bg-[#ef8733]/10 text-[#ef8733] rounded-full">{b.badge}</span>}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {b.active ? "Active" : "Hidden"}
                  </span>
                  {b.featured && <span className="text-xs font-semibold px-2 py-0.5 bg-[#111111]/10 text-[#111111] rounded-full">Featured</span>}
                </div>
                <p className="text-sm text-[#6b7280] mb-2 line-clamp-1">{b.tagline}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-semibold text-[#111111]">{formatPrice(b.price)}</span>
                  <span className="text-[#6b7280]">{b.items.length} items included</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/bundles/${b.id}`}
                  className="h-9 px-4 text-sm font-semibold border-2 border-[#e5e1d8] rounded-xl hover:border-[#ef8733] hover:text-[#ef8733] transition-colors inline-flex items-center"
                >
                  Edit
                </Link>
                <BundleDeleteButton id={b.id} name={b.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
