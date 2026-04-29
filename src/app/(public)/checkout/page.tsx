"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { PostageSettings } from "@/lib/types";

type Step = "details" | "payment";

const defaultPostage: PostageSettings = { flatRate: 3.95, freeThreshold: 50 };

export default function CheckoutPage() {
  const { state, subtotal, clearCart } = useCart();
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [postage, setPostage] = useState<PostageSettings>(defaultPostage);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address1: "", address2: "", city: "", postcode: "",
  });

  useEffect(() => {
    fetch("/api/postage")
      .then((r) => r.json())
      .then((data: PostageSettings) => setPostage(data))
      .catch(() => {/* keep defaults */});
  }, []);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const shippingCost =
    postage.freeThreshold > 0 && subtotal >= postage.freeThreshold
      ? 0
      : postage.flatRate;
  const total = subtotal + shippingCost;

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: state.items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            selectedOptions: i.selectedOptions,
          })),
          customer: { ...form },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!data.url) {
        alert("Could not create payment session. Please try again.");
        setLoading(false);
        return;
      }

      clearCart();
      window.location.href = data.url;
    } catch {
      alert("Could not connect to payment service. Please try again.");
      setLoading(false);
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center py-20">
        <h1 className="font-display font-800 text-3xl text-[#111111] mb-3">Your cart is empty</h1>
        <p className="text-[#6b7280] mb-6">Add some products before checking out.</p>
        <Link href="/shop"><Button>Browse Products</Button></Link>
      </div>
    );
  }

  const inputClass = "w-full h-11 px-4 rounded-xl border-2 border-[#e5e1d8] text-sm focus:outline-none focus:border-[#ef8733] transition-colors";
  const labelClass = "block text-sm font-semibold text-[#111111] mb-1.5";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#ef8733] transition-colors mb-4">
          <ArrowLeft size={14} /> Continue Shopping
        </Link>
        <h1 className="font-display font-800 text-3xl text-[#111111]">Checkout</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left: Form */}
        <div className="lg:col-span-2">
          {/* Progress */}
          <div className="flex items-center gap-4 mb-8">
            {(["details", "payment"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s ? "bg-[#ef8733] text-white" : i < (["details", "payment"] as Step[]).indexOf(step) ? "bg-emerald-500 text-white" : "bg-[#e5e1d8] text-[#6b7280]"
                }`}>
                  {i + 1}
                </div>
                <span className={`text-sm font-medium capitalize ${step === s ? "text-[#111111]" : "text-[#6b7280]"}`}>{s}</span>
                {i < 1 && <div className="w-8 h-px bg-[#e5e1d8]" />}
              </div>
            ))}
          </div>

          {step === "details" && (
            <form onSubmit={(e) => { e.preventDefault(); setStep("payment"); }} className="flex flex-col gap-6">
              <fieldset className="border border-[#e5e1d8] rounded-2xl p-6">
                <legend className="font-display font-700 text-lg text-[#111111] px-2">Contact</legend>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input required className={inputClass} value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Jane" />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input required className={inputClass} value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Smith" />
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input required type="email" className={inputClass} value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@example.com" />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input type="tel" className={inputClass} value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="07700 900000" />
                  </div>
                </div>
              </fieldset>

              <fieldset className="border border-[#e5e1d8] rounded-2xl p-6">
                <legend className="font-display font-700 text-lg text-[#111111] px-2">Shipping Address</legend>
                <div className="flex flex-col gap-4 mt-4">
                  <div>
                    <label className={labelClass}>Address Line 1 *</label>
                    <input required className={inputClass} value={form.address1} onChange={(e) => update("address1", e.target.value)} placeholder="123 High Street" />
                  </div>
                  <div>
                    <label className={labelClass}>Address Line 2</label>
                    <input className={inputClass} value={form.address2} onChange={(e) => update("address2", e.target.value)} placeholder="Flat B" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>City *</label>
                      <input required className={inputClass} value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="London" />
                    </div>
                    <div>
                      <label className={labelClass}>Postcode *</label>
                      <input required className={inputClass} value={form.postcode} onChange={(e) => update("postcode", e.target.value)} placeholder="SW1A 1AA" />
                    </div>
                  </div>
                </div>
              </fieldset>

              <Button type="submit" size="lg" fullWidth>Continue to Payment</Button>
            </form>
          )}

          {step === "payment" && (
            <form onSubmit={handlePayment} className="flex flex-col gap-6">
              <fieldset className="border border-[#e5e1d8] rounded-2xl p-6">
                <legend className="font-display font-700 text-lg text-[#111111] px-2 flex items-center gap-2">
                  <Lock size={16} className="text-[#ef8733]" /> Secure Payment
                </legend>
                <p className="text-sm text-[#6b7280] mt-3 mb-2">
                  You&apos;ll be taken to a secure payment page to complete your order. We never see or store your card details.
                </p>
                <div className="mt-4 p-4 bg-[#f9f7f4] rounded-xl border border-[#e5e1d8] text-sm">
                  <p className="font-semibold text-[#111111] mb-1">Delivering to</p>
                  <p className="text-[#6b7280]">{form.firstName} {form.lastName}</p>
                  <p className="text-[#6b7280]">{form.address1}{form.address2 ? `, ${form.address2}` : ""}, {form.city}, {form.postcode}</p>
                </div>
              </fieldset>

              <div className="flex flex-col gap-3">
                <Button type="submit" size="lg" fullWidth loading={loading}>
                  <Lock size={16} /> Pay {formatPrice(total)} Securely
                </Button>
                <button type="button" onClick={() => setStep("details")} className="text-sm text-[#6b7280] hover:text-[#111111] cursor-pointer transition-colors">
                  ← Back to details
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-1">
          <div className="bg-[#f9f7f4] rounded-2xl border border-[#e5e1d8] p-6 sticky top-24">
            <h2 className="font-display font-700 text-lg text-[#111111] mb-4">Order Summary</h2>
            <ul className="flex flex-col gap-3 mb-4">
              {state.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#111111] truncate">{item.product.name}</p>
                    <p className="text-[#6b7280] text-xs">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-[#111111] shrink-0">{formatPrice(item.linePrice)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-[#e5e1d8] pt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-[#6b7280]">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#6b7280]">
                <span>Postage</span>
                <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between font-display font-700 text-lg text-[#111111] mt-2 pt-2 border-t border-[#e5e1d8]">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
