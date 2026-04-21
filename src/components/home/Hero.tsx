import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f9f7f4]">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#fff7ed] to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#ef8733]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ef8733]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#ef8733]/10 text-[#ef8733] text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Sparkles size={14} />
              Custom-printed in the UK
            </div>

            <h1 className="font-display text-5xl lg:text-6xl font-800 text-[#111111] leading-tight mb-6">
              Make it
              <span className="text-[#ef8733] block">uniquely</span>
              yours.
            </h1>

            <p className="text-lg text-[#6b7280] leading-relaxed mb-8 max-w-lg">
              Premium custom stickers, mugs, and keyrings for businesses, events, and gifts.
              Upload your design and we'll handle the rest — or pick from our ready-made bundles.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/shop">
                <Button size="lg">
                  Shop All Products <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/custom-order">
                <Button variant="secondary" size="lg">
                  Request a Custom Quote
                </Button>
              </Link>
            </div>

            {/* Trust micro-signals */}
            <div className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t border-[#e5e1d8]">
              {[
                { stat: "5,000+", label: "Happy customers" },
                { stat: "48hr", label: "Express dispatch" },
                { stat: "5★", label: "Average rating" },
              ].map((item) => (
                <div key={item.stat}>
                  <p className="font-display font-700 text-2xl text-[#111111]">{item.stat}</p>
                  <p className="text-sm text-[#6b7280]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual grid */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              { label: "Stickers", colour: "#ef8733", icon: "⬡" },
              { label: "Mugs", colour: "#111111", icon: "◎" },
              { label: "Keyrings", colour: "#ef8733", icon: "◇" },
              { label: "Custom", colour: "#ea7316", icon: "✦" },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`rounded-2xl aspect-square flex flex-col items-center justify-center gap-3 text-white font-display font-700 text-xl ${
                  i === 1 ? "mt-8" : i === 3 ? "-mt-8" : ""
                }`}
                style={{ backgroundColor: item.colour }}
              >
                <span className="text-4xl">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
