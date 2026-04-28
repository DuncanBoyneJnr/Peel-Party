import { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How we use cookies on our website.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-display font-700 text-xl text-[#111111] mb-3">{title}</h2>
      <div className="text-[#6b7280] leading-relaxed flex flex-col gap-3">{children}</div>
    </div>
  );
}

export default async function CookiesPage() {
  const { businessName } = await getSettings();
  const name = businessName || "EL4 Designs";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-12">
        <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-2">Legal</p>
        <h1 className="font-display font-800 text-4xl text-[#111111] mb-3">Cookie Policy</h1>
        <p className="text-[#6b7280]">Last updated: April 2025</p>
      </div>

      <Section title="What are cookies?">
        <p>Cookies are small text files stored on your device when you visit a website. They allow the website to remember information about your visit — for example, the items in your shopping cart.</p>
      </Section>

      <Section title={`How ${name} uses cookies`}>
        <p>{name} uses only essential cookies that are strictly necessary for the website to function. We do not use tracking, analytics, or advertising cookies of any kind.</p>
      </Section>

      <Section title="Essential cookies we use">
        <p>The following essential cookies may be set when you use our website:</p>
        <ul className="list-disc list-inside flex flex-col gap-1.5 ml-2">
          <li><strong>Shopping cart</strong> — stores the contents of your basket so items persist between pages and sessions.</li>
          <li><strong>Session state</strong> — maintains your session as you move through the checkout process.</li>
        </ul>
        <p>These cookies are necessary for the site to work correctly and cannot be disabled without affecting site functionality. They do not collect personal data beyond what is needed to operate the feature.</p>
      </Section>

      <Section title="Third-party cookies">
        <p>When you proceed to payment, you are redirected to Stripe's secure checkout. Stripe may set their own cookies on their domain in accordance with their own <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer" className="text-[#ef8733] hover:underline">Cookie Policy</a>. We have no control over cookies set by third-party services.</p>
      </Section>

      <Section title="Your choices">
        <p>Because we only use essential cookies, there is no cookie consent banner on this site — essential cookies cannot lawfully be refused as they are required for the service to function. If you wish to clear cookies, you can do so through your browser settings, though this may affect your shopping cart and checkout experience.</p>
      </Section>

      <Section title="Contact">
        <p>Questions about our use of cookies? <Link href="/contact" className="text-[#ef8733] hover:underline">Get in touch</Link>.</p>
      </Section>
    </div>
  );
}
