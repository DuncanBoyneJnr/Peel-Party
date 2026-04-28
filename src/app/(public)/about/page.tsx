import { Metadata } from "next";
import Link from "next/link";
import { Heart, Award, Users } from "lucide-react";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Us | Peel & Party Co.",
  description: "Hi, I'm Emma — the heart behind Peel & Party Co. Creating personalised pieces for celebrations big and small for over seven years.",
};

const values = [
  { icon: Heart, title: "Made with care", body: "Every order gets personal attention. I check every proof before it goes to print." },
  { icon: Award, title: "Quality first", body: "I only use premium materials. If it's not right, I'll reprint it — no questions asked." },
  { icon: Users, title: "Built for people", body: "Whether you're planning a birthday party or a boardroom meeting, you get the same great service." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#f9f7f4] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-3">Our Story</p>
          <h1 className="font-display font-800 text-5xl text-[#111111] mb-6">
            Hi, I&apos;m Emma —<br />
            <span className="text-[#ef8733]">the heart behind the brand.</span>
          </h1>
          <p className="text-[#6b7280] text-xl leading-relaxed max-w-2xl mx-auto">
            Creating personalised pieces for celebrations big and small — for over seven years and counting.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex flex-col gap-6 text-[#6b7280] text-lg leading-relaxed">
          <p>
            What started as a simple way to make my daughter&apos;s birthday parties extra special quickly grew into something much bigger. For over seven years, I&apos;ve been designing and creating personalised pieces for family, friends — and to be honest, for all their celebrations. From banners, stickers and coasters to mugs, keyrings and sweet bags, and all the thoughtful details that bring an event together.
          </p>
          <p>
            Along the way, I realised that personalisation isn&apos;t just for children&apos;s parties. It has the power to elevate any occasion. Whether it&apos;s a birthday celebration, a wedding, a corporate event, or even a boardroom meeting, I believe every moment can be made more engaging, memorable, and uniquely yours with the right finishing touches.
          </p>
          <p>
            Today, I create bespoke products that blend creativity with a professional finish — helping individuals and businesses turn their ideas into something both meaningful and impactful. From fun, colourful party pieces to polished branded items for corporate settings, every order is approached with the same level of care, attention to detail, and passion.
          </p>
          <p>
            At the heart of it all is a simple goal: to turn any event into something personal, stylish, and unforgettable. I want my customers to feel heard, understood, and genuinely supported throughout the process. Every idea, vision, or small detail you have matters to me. I take the time to listen closely and work with you to bring what you&apos;re imagining to life — turning it into something real, thoughtful, and personal.
          </p>
          <p className="text-[#111111] font-medium">
            Thank you for being here and supporting my journey — it truly means the world.
          </p>
          <p className="font-display font-700 text-2xl text-[#ef8733]">Emma x</p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#111111] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-2">What drives me</p>
            <h2 className="font-display font-800 text-4xl text-white">My values</h2>
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

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="p-8 bg-[#f9f7f4] rounded-2xl border border-[#e5e1d8] text-center">
          <h2 className="font-display font-700 text-2xl text-[#111111] mb-3">Ready to create something special?</h2>
          <p className="text-[#6b7280] mb-6">Whether you need party pieces or polished branded items, let&apos;s bring your vision to life.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/shop"><Button>Browse Products</Button></Link>
            <Link href="/custom-order"><Button variant="secondary">Request a Quote</Button></Link>
          </div>
        </div>
      </section>
    </>
  );
}
