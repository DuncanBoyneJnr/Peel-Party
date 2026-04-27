export const dynamic = "force-dynamic";

import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import OurWork from "@/components/home/OurWork";
import CustomOrderBanner from "@/components/home/CustomOrderBanner";
import FeaturedBundles from "@/components/home/FeaturedBundles";
import BundlesSection from "@/components/home/BundlesSection";
import AlsoViewed from "@/components/home/AlsoViewed";
import TrustSignals from "@/components/home/TrustSignals";
import FAQ from "@/components/home/FAQ";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Peel & Party Co.",
  description: "Personalised stickers, gifts and party decor handcrafted in the UK.",
  url: "https://peelpartyco.co.uk",
  logo: "https://peelpartyco.co.uk/logo.png",
  image: "https://peelpartyco.co.uk/logo.png",
  priceRange: "££",
  areaServed: "GB",
  "@id": "https://peelpartyco.co.uk",
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <CategoryGrid />
      <OurWork />
      <FeaturedBundles />
      <BundlesSection />
      <AlsoViewed />
      <CustomOrderBanner />
      <TrustSignals />
      <FAQ />
    </>
  );
}
