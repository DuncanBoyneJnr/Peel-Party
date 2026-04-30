"use client";

import { useState } from "react";
import { Order, OrderStatus } from "@/lib/types";
import { ShoppingBag, ChevronDown, ChevronUp, Trash2, Clock, CheckCircle, Truck, CreditCard, Printer, Paperclip } from "lucide-react";

interface Props { initialOrders: Order[] }

const statuses: OrderStatus[] = ["paid", "processing", "dispatched"];
const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  paid:        { label: "Paid",        color: "#10b981", icon: CreditCard },
  processing:  { label: "Processing",  color: "#3b82f6", icon: Clock },
  dispatched:  { label: "Dispatched",  color: "#6b7280", icon: Truck },
};

const fmt = (p: number) => `£${(p / 100).toFixed(2)}`;

export default function OrdersAdmin({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  async function updateStatus(id: string, status: OrderStatus) {
    await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  function printLabel(order: Order) {
    const { firstName, lastName, address1, address2, city, postcode } = order.customer;
    const html = `<!DOCTYPE html><html><head><title>Postage Label</title><style>body{font-family:sans-serif;font-size:20px;padding:40px;line-height:1.6}@media print{@page{margin:15mm}}</style></head><body><strong>${firstName} ${lastName}</strong><br>${address1}${address2 ? `<br>${address2}` : ""}<br>${city}<br>${postcode.toUpperCase()}<script>window.onload=function(){window.print();}<\/script></body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); }
  }

  async function deleteOrder(id: string) {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, { method: "DELETE" });
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${filter === "all" ? "bg-[#111111] text-white" : "bg-white border border-[#e5e1d8] text-[#111111] hover:border-[#111111]"}`}
        >
          All ({orders.length})
        </button>
        {statuses.map((s) => {
          const { label, color, icon: Icon } = statusConfig[s];
          const count = orders.filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer border ${filter === s ? "text-white border-transparent" : "bg-white border-[#e5e1d8] hover:border-current"}`}
              style={filter === s ? { backgroundColor: color, borderColor: color } : { color }}
            >
              <Icon size={13} /> {label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#e5e1d8] p-16 text-center">
          <ShoppingBag size={36} className="mx-auto mb-3 text-[#d1c8bc]" />
          <p className="font-semibold text-[#111111]">No orders yet</p>
          <p className="text-sm text-[#6b7280] mt-1">
            {filter === "all" ? "Orders will appear here after customers check out." : `No ${filter} orders right now.`}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((order) => {
          const { label, color, icon: Icon } = statusConfig[order.status];
          const isOpen = expandedId === order.id;
          const { firstName, lastName, email, phone, address1, address2, city, postcode } = order.customer;

          return (
            <div key={order.id} className="bg-white rounded-2xl border border-[#e5e1d8] overflow-hidden">
              {/* Header row */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                onClick={() => setExpandedId(isOpen ? null : order.id)}
              >
                <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-[#6b7280] mb-0.5">Customer</p>
                    <p className="text-sm font-semibold text-[#111111] truncate">{firstName} {lastName}</p>
                    <p className="text-xs text-[#6b7280] truncate">{email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6b7280] mb-0.5">Items</p>
                    <p className="text-sm text-[#111111] truncate">
                      {order.items.map((i) => i.name).join(", ") || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6b7280] mb-0.5">Total</p>
                    <p className="text-sm font-semibold text-[#111111]">{fmt(order.totalPence)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6b7280] mb-0.5">Date</p>
                    <p className="text-sm text-[#111111]">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    <Icon size={11} /> {label}
                  </span>
                  {isOpen ? <ChevronUp size={16} className="text-[#6b7280]" /> : <ChevronDown size={16} className="text-[#6b7280]" />}
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-[#f0ede8] px-5 py-5">
                  <div className="grid sm:grid-cols-2 gap-6 mb-5">
                    {/* Items breakdown */}
                    <div>
                      <p className="text-xs text-[#6b7280] font-semibold uppercase tracking-wide mb-3">Order Items</p>
                      <div className="flex flex-col gap-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#111111]">{item.name}</span>
                              <span className="text-[#111111] font-medium">{fmt(item.unitAmountPence * item.quantity)}</span>
                            </div>
                            {item.customText && (
                              <p className="text-xs text-[#6b7280] mt-0.5">Text: <span className="text-[#111111] font-medium">{item.customText}</span></p>
                            )}
                            {item.artworkUrl && (
                              <a href={item.artworkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#ef8733] hover:underline mt-0.5">
                                <Paperclip size={11} /> View artwork
                              </a>
                            )}
                          </div>
                        ))}
                        {order.postagePence > 0 && (
                          <div className="flex justify-between text-sm text-[#6b7280]">
                            <span>Postage &amp; Packaging</span>
                            <span>{fmt(order.postagePence)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-semibold border-t border-[#f0ede8] pt-2 mt-1">
                          <span>Total</span>
                          <span>{fmt(order.totalPence)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery address */}
                    <div>
                      <p className="text-xs text-[#6b7280] font-semibold uppercase tracking-wide mb-3">Delivery Address</p>
                      <div className="text-sm text-[#111111] flex flex-col gap-0.5">
                        <span>{firstName} {lastName}</span>
                        {phone && <span className="text-[#6b7280]">{phone}</span>}
                        <span>{address1}{address2 ? `, ${address2}` : ""}</span>
                        <span>{city}, {postcode}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#f0ede8]">
                    <span className="text-xs text-[#6b7280] font-medium">Status:</span>
                    {statuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(order.id, s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${order.status === s ? "text-white border-transparent" : "border-[#e5e1d8] hover:border-current"}`}
                        style={
                          order.status === s
                            ? { backgroundColor: statusConfig[s].color, borderColor: statusConfig[s].color }
                            : { color: statusConfig[s].color }
                        }
                      >
                        {statusConfig[s].label}
                      </button>
                    ))}
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ef8733] text-white rounded-full text-xs font-semibold hover:bg-[#ea7316] transition-colors"
                    >
                      Email Customer
                    </a>
                    <button
                      onClick={() => printLabel(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f9f7f4] text-[#111111] border border-[#e5e1d8] rounded-full text-xs font-semibold hover:bg-[#f0ede8] transition-colors cursor-pointer"
                    >
                      <Printer size={11} /> Print Label
                    </button>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
