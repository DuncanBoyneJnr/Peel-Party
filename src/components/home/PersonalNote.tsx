import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";

export default function PersonalNote() {
  return (
    <section className="py-16 bg-[#fff7ed]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-[#ef8733]/15 text-[#ef8733] text-sm font-semibold px-4 py-2 rounded-full mb-6">
          <Sparkles size={14} />
          A note from Emma
        </div>

        <p className="text-[#444444] text-lg leading-relaxed">
          You&rsquo;re welcome to upload your own logos and designs, or I can help with ideas
          and tweaks — just send your theme, colours, and what you&rsquo;ve got in mind.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 h-11 px-6 bg-[#ef8733] text-white rounded-full font-semibold text-sm hover:bg-[#ea7316] transition-colors"
          >
            <MessageCircle size={16} /> Get in Touch
          </Link>
          <Link
            href="/custom-order"
            className="inline-flex items-center gap-2 h-11 px-6 border-2 border-[#111111] text-[#111111] rounded-full font-semibold text-sm hover:bg-[#111111] hover:text-white transition-colors"
          >
            Request a Quote
          </Link>
        </div>
      </div>
    </section>
  );
}
