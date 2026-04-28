import { Mail, Phone, Clock, MapPin } from "lucide-react";
import { getSettings } from "@/lib/server-data";
import ContactForm from "./ContactForm";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings();

  const contactItems = [
    {
      icon: Mail,
      title: "Email",
      body: settings.email || "—",
      sub: "We respond within 4 hours",
    },
    {
      icon: Phone,
      title: "Phone",
      body: settings.phone || "—",
      sub: "Mon–Fri, 9am–5pm",
    },
    {
      icon: Clock,
      title: "Business Hours",
      body: "Mon–Fri: 9am–5pm",
      sub: "Sat: 10am–2pm (email only)",
    },
    {
      icon: MapPin,
      title: "Studio",
      body: settings.address || "—",
      sub: "Not open to the public",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-14">
        <p className="text-[#ef8733] text-sm font-semibold uppercase tracking-wider mb-2">Get in touch</p>
        <h1 className="font-display font-800 text-4xl sm:text-5xl text-[#111111] mb-3">We'd love to hear from you</h1>
        <p className="text-[#6b7280] text-lg max-w-xl mx-auto">
          Have a question, need a quote, or just want to say hello? We're a real team and we respond quickly.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Contact info */}
        <div className="flex flex-col gap-5">
          {contactItems.map(({ icon: Icon, title, body, sub }) => (
            <div key={title} className="flex items-start gap-4 p-5 bg-[#f9f7f4] rounded-2xl border border-[#e5e1d8]">
              <div className="w-10 h-10 bg-[#ef8733]/10 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={18} className="text-[#ef8733]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111111]">{title}</p>
                <p className="text-sm text-[#111111]">{body}</p>
                <p className="text-xs text-[#6b7280] mt-0.5">{sub}</p>
              </div>
            </div>
          ))}

          <div className="p-5 bg-[#111111] rounded-2xl">
            <p className="font-display font-700 text-white text-lg mb-2">Need a quote?</p>
            <p className="text-sm text-gray-400 mb-4">Use our dedicated custom order form for bulk and bespoke orders.</p>
            <a href="/custom-order" className="inline-flex items-center h-9 px-4 bg-[#ef8733] text-white rounded-full text-sm font-semibold hover:bg-[#ea7316] transition-colors">
              Custom Order Form
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
