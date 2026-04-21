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

export default function HomePage() {
  return (
    <>
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
