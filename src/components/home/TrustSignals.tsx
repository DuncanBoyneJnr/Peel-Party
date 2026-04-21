import { Truck, Shield, Star, Clock, Headphones, Repeat } from "lucide-react";

const signals = [
  { icon: Truck, title: "Free UK Delivery", body: "On all orders over £50." },
  { icon: Clock, title: "48hr Express", body: "Fast dispatch on most orders." },
  { icon: Shield, title: "Quality Guarantee", body: "Not happy? We'll reprint, free." },
  { icon: Headphones, title: "Human Support", body: "Real people, quick responses." },
  { icon: Repeat, title: "Easy Reorders", body: "Reorder previous designs in seconds." },
  { icon: Star, title: "5-Star Rated", body: "Trusted by 5,000+ customers." },
];

const reviews = [
  {
    name: "Sarah M.",
    role: "Small business owner",
    body: "The quality blew me away. My logo stickers looked incredible and the turnaround was super fast. Will definitely order again.",
    rating: 5,
  },
  {
    name: "James T.",
    role: "Event organiser",
    body: "Ordered 500 keyrings for our conference. Arrived on time, looked amazing, and the team were incredibly helpful throughout.",
    rating: 5,
  },
  {
    name: "Priya K.",
    role: "Wedding planner",
    body: "Custom mugs for a hen do — every single guest commented on how beautiful they were. Seamless experience from start to finish.",
    rating: 5,
  },
];

export default function TrustSignals() {
  return (
    <section className="bg-[#f9f7f4]">
      {/* USP strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {signals.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl border border-[#e5e1d8] flex items-center justify-center shadow-sm">
                <Icon size={20} className="text-[#ef8733]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111111]">{title}</p>
                <p className="text-xs text-[#6b7280] mt-0.5">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="border-t border-[#e5e1d8] py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-2">Customer Reviews</p>
          <h2 className="font-display font-800 text-4xl text-[#111111]">Loved by customers</h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="#ef8733">
                <path d="M10 1l2.5 5.5H18l-4.5 4 1.5 6L10 13.5 5 16.5l1.5-6L2 6.5h5.5z"/>
              </svg>
            ))}
            <span className="text-sm font-semibold text-[#6b7280] ml-1">4.9 from 500+ reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.name} className="bg-white rounded-2xl p-6 border border-[#e5e1d8] shadow-sm">
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill="#ef8733">
                    <path d="M10 1l2.5 5.5H18l-4.5 4 1.5 6L10 13.5 5 16.5l1.5-6L2 6.5h5.5z"/>
                  </svg>
                ))}
              </div>
              <p className="text-sm text-[#111111] leading-relaxed mb-4">"{r.body}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#ef8733] rounded-full flex items-center justify-center text-white font-display font-700 text-sm">
                  {r.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111111]">{r.name}</p>
                  <p className="text-xs text-[#6b7280]">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
