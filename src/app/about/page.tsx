import { Metadata } from "next";
import Link from "next/link";
import { Heart, Award, Users, Leaf } from "lucide-react";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Us",
  description: "The story behind EL4 Designs — custom merchandise made with care, in the UK.",
};

const values = [
  { icon: Heart, title: "Made with care", body: "Every order gets personal attention. We check every proof before it goes to print." },
  { icon: Award, title: "Quality first", body: "We only use premium materials. If it's not right, we'll reprint it — no questions asked." },
  { icon: Users, title: "Built for people", body: "Whether you're a solo trader or a FTSE 500 company, you get the same great service." },
  { icon: Leaf, title: "Sustainably minded", body: "We use eco-friendly inks and work with suppliers who share our values." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#f9f7f4] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-3">Our Story</p>
          <h1 className="font-display font-800 text-5xl text-[#111111] mb-6">
            Custom merchandise,<br />
            <span className="text-[#ef8733]">made with love.</span>
          </h1>
          <p className="text-[#6b7280] text-xl leading-relaxed max-w-2xl mx-auto">
            EL4 Designs started as a side project born from a passion for beautiful print. Today we produce thousands of custom products every month — for businesses, individuals, and everything in between.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display font-700 text-3xl text-[#111111] mb-4">How it started</h2>
            <p className="text-[#6b7280] leading-relaxed mb-4">
              Emma started making stickers for her small Etsy shop in 2019. What began as a hobby quickly grew into something much bigger — as word spread that her quality was something different.
            </p>
            <p className="text-[#6b7280] leading-relaxed mb-4">
              By 2021, EL4 Designs had expanded into mugs and keyrings, taking on corporate clients alongside individual orders. The ethos remained the same: every product should feel special.
            </p>
            <p className="text-[#6b7280] leading-relaxed">
              Today we're a team of five, still based in the UK, still personally reviewing every proof before it goes to print.
            </p>
          </div>
          <div className="bg-[#f9f7f4] rounded-2xl aspect-square flex items-center justify-center border border-[#e5e1d8]">
            <div className="text-center text-[#6b7280]">
              <div className="text-6xl mb-3">📦</div>
              <p className="text-sm font-medium">Our studio, Birmingham UK</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#111111] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-2">What drives us</p>
            <h2 className="font-display font-800 text-4xl text-white">Our values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, body }) => (
              <div key={title} className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-[#ef8733]/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={22} className="text-[#ef8733]" />
                </div>
                <h3 className="font-display font-700 text-lg text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { stat: "2019", label: "Founded" },
            { stat: "5,000+", label: "Happy customers" },
            { stat: "50k+", label: "Products shipped" },
            { stat: "4.9★", label: "Average rating" },
          ].map((item) => (
            <div key={item.stat}>
              <p className="font-display font-800 text-4xl text-[#ef8733]">{item.stat}</p>
              <p className="text-sm text-[#6b7280] mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 p-8 bg-[#f9f7f4] rounded-2xl border border-[#e5e1d8]">
          <h2 className="font-display font-700 text-2xl text-[#111111] mb-3">Ready to work with us?</h2>
          <p className="text-[#6b7280] mb-6">Whether you need 10 stickers or 10,000 mugs, let's make something great.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/shop"><Button>Browse Products</Button></Link>
            <Link href="/custom-order"><Button variant="secondary">Request a Quote</Button></Link>
          </div>
        </div>
      </section>
    </>
  );
}
