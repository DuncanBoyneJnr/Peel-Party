import { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "How we ship your orders, delivery timescales, and postage costs.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-display font-700 text-xl text-[#111111] mb-3">{title}</h2>
      <div className="text-[#6b7280] leading-relaxed flex flex-col gap-3">{children}</div>
    </div>
  );
}

export default async function ShippingPage() {
  const { businessName } = await getSettings();
  const name = businessName || "EL4 Designs";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-12">
        <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-2">Legal</p>
        <h1 className="font-display font-800 text-4xl text-[#111111] mb-3">Shipping Policy</h1>
        <p className="text-[#6b7280]">Last updated: April 2025</p>
      </div>

      <Section title="Production time">
        <p>All products at {name} are made to order. Standard production time is 3–5 business days from proof approval. During busy periods (e.g. Christmas, Valentine's Day) production may take slightly longer — we will always let you know if your order is affected.</p>
      </Section>

      <Section title="Postage costs">
        <p>We offer a flat-rate postage charge for all UK orders. Orders over a certain value qualify for free shipping — the current threshold is shown at checkout.</p>
        <p>We do not currently ship outside of the United Kingdom.</p>
      </Section>

      <Section title="Delivery timescales">
        <p>Once dispatched, orders are typically delivered within 2–3 business days via Royal Mail or a tracked courier service. Delivery timescales are estimates and not guaranteed — we are not responsible for delays caused by the carrier once your parcel has been collected.</p>
      </Section>

      <Section title="Tracking">
        <p>Where a tracked service is used, we will provide a tracking number by email once your order has been dispatched. Please allow a few hours for tracking information to update after dispatch.</p>
      </Section>

      <Section title="Non-delivery">
        <p>If your order has not arrived within 10 business days of your dispatch notification, please <Link href="/contact" className="text-[#ef8733] hover:underline">contact us</Link> and we will investigate with the carrier. We are unable to raise a claim with Royal Mail until 15 business days after the expected delivery date.</p>
      </Section>

      <Section title="Address accuracy">
        <p>Please ensure your delivery address is correct at the time of ordering. We are not responsible for orders lost or delayed due to an incorrect address being provided. If you notice an error after placing your order, contact us immediately — we can only amend the address before dispatch.</p>
      </Section>

      <Section title="Contact">
        <p>Questions about your delivery? <Link href="/contact" className="text-[#ef8733] hover:underline">Get in touch</Link> and we'll be happy to help.</p>
      </Section>
    </div>
  );
}
