import { AboutSection } from "@/components/home/AboutSection";
import { DownloadablesSection } from "@/components/home/DownloadablesSection";
import { FeaturedPropertiesSection } from "@/components/home/FeaturedPropertiesSection";
import { HeroSection } from "@/components/home/HeroSection";
import { OfficeSearchSection } from "@/components/home/OfficeSearchSection";
import { OwnerCtaSection } from "@/components/home/OwnerCtaSection";
import { VirtualToursSection } from "@/components/home/VirtualToursSection";
import { ZonesSection } from "@/components/home/ZonesSection";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

/**
 * Public marketing home — rebuilt from legacy Wix structure without reused scripts.
 */
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <ZonesSection />
        <FeaturedPropertiesSection />
        <VirtualToursSection />
        <OwnerCtaSection />
        <OfficeSearchSection />
        <DownloadablesSection />
      </main>
      <SiteFooter />
    </>
  );
}
