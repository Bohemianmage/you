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
import { FEATURED_PROPERTIES_BY_LOCALE } from "@/data/properties";
import { ZONES_BY_LOCALE } from "@/data/zones";
import { HOME_COPY, resolveLocale } from "@/i18n/home";

interface HomePageProps {
  searchParams?: Promise<{ lang?: string }>;
}

/**
 * Public marketing home — rebuilt from legacy Wix structure without reused scripts.
 */
export default async function Home({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const locale = resolveLocale(params?.lang);
  const copy = HOME_COPY[locale];

  return (
    <>
      <SiteHeader
        locale={locale}
        navItems={copy.nav}
        languageLabel={copy.languageLabel}
      />
      <main className="flex-1">
        <HeroSection copy={copy.hero} modalCopy={copy.modal} />
        <AboutSection copy={copy.about} />
        <ZonesSection title={copy.zones.title} zones={ZONES_BY_LOCALE[locale]} />
        <FeaturedPropertiesSection
          copy={copy.featured}
          properties={FEATURED_PROPERTIES_BY_LOCALE[locale]}
        />
        <VirtualToursSection copy={copy.virtualTours} />
        <OwnerCtaSection copy={copy.owner} />
        <OfficeSearchSection copy={copy.offices} />
        <DownloadablesSection copy={copy.downloadables} />
      </main>
      <SiteFooter navItems={copy.nav} footerCopy={copy.footer} />
    </>
  );
}
