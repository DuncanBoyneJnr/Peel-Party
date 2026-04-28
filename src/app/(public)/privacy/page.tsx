import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How we collect, use, and protect your personal data.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-display font-700 text-xl text-[#111111] mb-3">{title}</h2>
      <div className="text-[#6b7280] leading-relaxed flex flex-col gap-3">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-12">
        <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-2">Legal</p>
        <h1 className="font-display font-800 text-4xl text-[#111111] mb-3">Privacy Policy</h1>
        <p className="text-[#6b7280]">Last updated: April 2025</p>
      </div>

      <Section title="Who we are">
        <p>We are EL4 Designs, a UK-based custom merchandise business. When you use our website or place an order with us, we collect and use certain personal data. This policy explains what we collect, why we collect it, and your rights.</p>
      </Section>

      <Section title="What data we collect">
        <p>When you place an order or contact us we may collect:</p>
        <ul className="list-disc list-inside flex flex-col gap-1.5 ml-2">
          <li>Your name, email address, and phone number</li>
          <li>Your delivery address</li>
          <li>Payment information (processed securely by Stripe — we never see or store your card details)</li>
          <li>Any artwork, custom text, or files you upload as part of your order</li>
          <li>Messages you send us via the contact form</li>
        </ul>
      </Section>

      <Section title="How we use your data">
        <p>We use your data to:</p>
        <ul className="list-disc list-inside flex flex-col gap-1.5 ml-2">
          <li>Process and fulfil your order</li>
          <li>Communicate with you about your order or enquiry</li>
          <li>Send order confirmation and dispatch notifications</li>
          <li>Comply with our legal obligations</li>
        </ul>
        <p>We do not sell or share your data with third parties for marketing purposes.</p>
      </Section>

      <Section title="Payment processing">
        <p>All payments are handled by Stripe, a PCI-compliant payment processor. Your card details are entered directly into Stripe's secure system and are never transmitted to or stored by us. Stripe's privacy policy is available at stripe.com/privacy.</p>
      </Section>

      <Section title="Data retention">
        <p>We retain your order information for up to 7 years to comply with HMRC record-keeping requirements. Contact form messages are retained for up to 12 months.</p>
      </Section>

      <Section title="Your rights">
        <p>Under UK GDPR you have the right to access, correct, or request deletion of your personal data. To exercise any of these rights, please contact us at the address below.</p>
      </Section>

      <Section title="Cookies">
        <p>Our website uses only essential cookies required for the site to function (e.g. your shopping cart). We do not use tracking or advertising cookies.</p>
      </Section>

      <Section title="Contact">
        <p>If you have any questions about this policy or how we handle your data, please <Link href="/contact" className="text-[#ef8733] hover:underline">contact us</Link>.</p>
      </Section>
    </div>
  );
}
