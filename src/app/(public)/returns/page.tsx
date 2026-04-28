import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "Our returns and refunds policy for custom orders.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-display font-700 text-xl text-[#111111] mb-3">{title}</h2>
      <div className="text-[#6b7280] leading-relaxed flex flex-col gap-3">{children}</div>
    </div>
  );
}

export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-12">
        <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-2">Legal</p>
        <h1 className="font-display font-800 text-4xl text-[#111111] mb-3">Returns &amp; Refunds</h1>
        <p className="text-[#6b7280]">Last updated: April 2025</p>
      </div>

      <Section title="Custom-made products">
        <p>Because all our products are made to order and personalised specifically for you, we are unable to accept returns or offer refunds simply because you have changed your mind. This is consistent with your rights under the Consumer Contracts Regulations 2013, which exclude custom-made goods from the standard 14-day cancellation right.</p>
      </Section>

      <Section title="Faulty or incorrect items">
        <p>If your order arrives damaged, defective, or different from your approved proof, we will put it right at no cost to you. We will either reprint the item or issue a full refund — your choice.</p>
        <p>To report a problem, please contact us within 14 days of receiving your order and include:</p>
        <ul className="list-disc list-inside flex flex-col gap-1.5 ml-2">
          <li>Your order number</li>
          <li>A clear photo of the issue</li>
          <li>A brief description of the problem</li>
        </ul>
      </Section>

      <Section title="Proof approval">
        <p>We send a digital proof for approval before production on all custom orders. Once you approve the proof, production begins and we cannot accept changes or cancellations. Please check all artwork, spelling, and options carefully before approving.</p>
      </Section>

      <Section title="Cancellations">
        <p>If you need to cancel an order, please contact us as soon as possible. We can cancel without charge before production has started. Once production has begun, a cancellation fee may apply to cover materials and time already committed.</p>
      </Section>

      <Section title="Refund process">
        <p>Approved refunds are returned to your original payment method within 5–10 business days.</p>
      </Section>

      <Section title="Contact us">
        <p>If you have a problem with your order or need to discuss a return, please <Link href="/contact" className="text-[#ef8733] hover:underline">contact us</Link> — we're always happy to help.</p>
      </Section>
    </div>
  );
}
