"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, ArrowLeft, CreditCard, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";

type Step = "details" | "payment" | "success";

export default function CheckoutPage() {
  const { state, subtotal, clearCart } = useCart();
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address1: "", address2: "", city: "", postcode: "", country: "GB",
    cardName: "", cardNumber: "", expiry: "", cvv: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const shipping = subtotal > 50 ? 0 : 3.95;
  const total = subtotal + shipping;

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO: integrate Stripe payment intent here
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    clearCart();
    setStep("success");
  }

  if (step === "success") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center py-20">
        <div className="w-20 h-20 bg-[#fff7ed] rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-[#ef8733]" />
        </div>
        <h1 className="font-display font-800 text-3xl text-[#111111] mb-3">Order Placed!</h1>
        <p className="text-[#6b7280] text-lg max-w-md mb-8">
          Thanks for your order. You'll receive a confirmation email shortly with your order details and production timeline.
        </p>
        <Link href="/shop">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
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
            {["details", "payment"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s ? "bg-[#ef8733] text-white" : i < ["details", "payment"].indexOf(step) ? "bg-emerald-500 text-white" : "bg-[#e5e1d8] text-[#6b7280]"
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
                  <Lock size={16} className="text-[#ef8733]" /> Payment Details
                </legend>
                <p className="text-sm text-[#6b7280] mt-2 mb-4">
                  Your payment is secured by Stripe. We never store your card details.
                </p>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={labelClass}>Name on Card *</label>
                    <input required className={inputClass} value={form.cardName} onChange={(e) => update("cardName", e.target.value)} placeholder="Jane Smith" />
                  </div>
                  <div>
                    <label className={labelClass}>Card Number *</label>
                    <div className="relative">
                      <input required className={`${inputClass} pr-12`} value={form.cardNumber} onChange={(e) => update("cardNumber", e.target.value)} placeholder="1234 5678 9012 3456" maxLength={19} />
                      <CreditCard size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Expiry *</label>
                      <input required className={inputClass} value={form.expiry} onChange={(e) => update("expiry", e.target.value)} placeholder="MM / YY" maxLength={7} />
                    </div>
                    <div>
                      <label className={labelClass}>CVV *</label>
                      <input required className={inputClass} value={form.cvv} onChange={(e) => update("cvv", e.target.value)} placeholder="123" maxLength={4} type="password" />
                    </div>
                  </div>
                </div>
              </fieldset>

              <div className="flex flex-col gap-3">
                <Button type="submit" size="lg" fullWidth loading={loading}>
                  <Lock size={16} /> Pay {formatPrice(total)}
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
                  <span className="font-semibold text-[#111111] shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-[#e5e1d8] pt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-[#6b7280]">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#6b7280]">
                <span>Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
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
