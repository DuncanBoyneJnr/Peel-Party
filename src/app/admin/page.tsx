import Link from "next/link";
import { Package, Images, MessageSquare, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { getProducts, getGallery, getQuotes } from "@/lib/server-data";

export const dynamic = "force-dynamic";

function StatCard({ label, value, icon: Icon, href, color }: {
  label: string; value: number | string; icon: React.ElementType; href: string; color: string;
}) {
  return (
    <Link href={href} className="bg-white rounded-2xl border border-[#e5e1d8] p-6 flex items-center gap-4 hover:border-[#ef8733] hover:shadow-md transition-all group">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-display font-800 text-[#111111]">{value}</p>
        <p className="text-sm text-[#6b7280]">{label}</p>
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const products = getProducts();
  const gallery = getGallery();
  const quotes = getQuotes().sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const newQuotes = quotes.filter((q) => q.status === "new").length;
  const recentQuotes = quotes.slice(0, 6);

  const statusIcon = { new: AlertCircle, "in-progress": Clock, responded: CheckCircle, closed: CheckCircle };
  const statusColor = { new: "#ef8733", "in-progress": "#3b82f6", responded: "#10b981", closed: "#6b7280" };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-800 text-3xl text-[#111111]">Dashboard</h1>
        <p className="text-[#6b7280] mt-1">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Products" value={products.length} icon={Package} href="/admin/products" color="#ef8733" />
        <StatCard label="Gallery Items" value={gallery.length} icon={Images} href="/admin/gallery" color="#111111" />
        <StatCard label="Total Quotes" value={quotes.length} icon={MessageSquare} href="/admin/quotes" color="#3b82f6" />
        <StatCard label="New Quotes" value={newQuotes} icon={TrendingUp} href="/admin/quotes" color="#ef8733" />
      </div>

      {/* Recent quotes */}
      <div className="bg-white rounded-2xl border border-[#e5e1d8]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e1d8]">
          <h2 className="font-display font-700 text-lg text-[#111111]">Recent Quote Requests</h2>
          <Link href="/admin/quotes" className="text-sm text-[#ef8733] font-semibold hover:underline">
            View all →
          </Link>
        </div>

        {recentQuotes.length === 0 ? (
          <div className="px-6 py-12 text-center text-[#6b7280]">
            <MessageSquare size={32} className="mx-auto mb-3 text-[#d1c8bc]" />
            <p className="font-medium">No quote requests yet</p>
            <p className="text-sm mt-1">They'll appear here when customers submit the custom order form.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f0ede8]">
                  {["Customer", "Product", "Qty", "Submitted", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentQuotes.map((q) => {
                  const Icon = statusIcon[q.status] ?? AlertCircle;
                  const color = statusColor[q.status] ?? "#6b7280";
                  return (
                    <tr key={q.id} className="border-b border-[#f9f7f4] last:border-0 hover:bg-[#f9f7f4] transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-[#111111]">{q.name}</p>
                        <p className="text-xs text-[#6b7280]">{q.email}</p>
                      </td>
                      <td className="px-6 py-4 text-[#111111]">{q.productType || "—"}</td>
                      <td className="px-6 py-4 text-[#111111]">{q.quantity || "—"}</td>
                      <td className="px-6 py-4 text-[#6b7280]">
                        {new Date(q.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ backgroundColor: `${color}18`, color }}>
                          <Icon size={12} />
                          {q.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
