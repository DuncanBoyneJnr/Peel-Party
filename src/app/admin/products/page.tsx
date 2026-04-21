import Link from "next/link";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { getProducts } from "@/lib/server-data";
import { formatPrice } from "@/lib/utils";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  const products = getProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-800 text-3xl text-[#111111]">Products</h1>
          <p className="text-[#6b7280] mt-1">{products.length} products in your catalogue</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 h-10 px-4 bg-[#ef8733] text-white rounded-xl text-sm font-semibold hover:bg-[#ea7316] transition-colors"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e1d8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e1d8] bg-[#f9f7f4]">
                {["Product", "Category", "Price", "Type", "Featured", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-[#f0ede8] last:border-0 hover:bg-[#fafafa] transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-[#111111]">{p.name}</p>
                      {p.badge && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#ef8733] mt-0.5">
                          <Tag size={10} /> {p.badge}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 capitalize text-[#111111]">{p.category}</td>
                  <td className="px-5 py-4 font-medium text-[#111111]">
                    {p.price === 0 ? <span className="text-[#6b7280]">On request</span> : formatPrice(p.price)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      p.orderType === "buy-now"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-[#fff7ed] text-[#ef8733]"
                    }`}>
                      {p.orderType === "buy-now" ? "Buy Now" : "Quote"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block w-5 h-5 rounded-full text-center text-xs leading-5 font-bold ${
                      p.featured ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
                    }`}>
                      {p.featured ? "✓" : "–"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="inline-flex items-center gap-1.5 h-8 px-3 bg-[#f0ede8] text-[#111111] rounded-lg text-xs font-semibold hover:bg-[#e5e1d8] transition-colors"
                      >
                        <Pencil size={12} /> Edit
                      </Link>
                      <DeleteButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
