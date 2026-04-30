import { AboutSection } from "@/components/home/AboutSection";
import { ContactSection } from "@/components/home/ContactSection";
import { DownloadablesSection } from "@/components/home/DownloadablesSection";
import { FeaturedPropertiesSection } from "@/components/home/FeaturedPropertiesSection";
import { HeroSection } from "@/components/home/HeroSection";
import { OfficeSearchSection } from "@/components/home/OfficeSearchSection";
import { OwnerCtaSection } from "@/components/home/OwnerCtaSection";
import { VirtualToursSection } from "@/components/home/VirtualToursSection";
import { ZonesSection } from "@/components/home/ZonesSection";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { DOWNLOADABLE_ITEMS_BY_LOCALE } from "@/data/downloadables";
import { FEATURED_PROPERTIES_BY_LOCALE } from "@/data/properties";
import { ZONES_BY_LOCALE } from "@/data/zones";
import { HOME_COPY, localeQuery, marketingNav, resolveLocale } from "@/i18n/home";
import { CONTACT_FORM_COPY } from "@/i18n/marketing-pages";

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
  const q = localeQuery(locale);
  const catalogHref = `/propiedades${q}`;
  const contactHref = `/contacto${q}`;
  const proposalHref = `/nuestra-propuesta${q}`;
  const tourEmbed = process.env.NEXT_PUBLIC_VIRTUAL_TOUR_EMBED_URL;

  return (
    <>
      <SiteHeader locale={locale} navItems={marketingNav(locale)} />
      <main className="flex-1">
        <HeroSection copy={copy.hero} modalCopy={copy.modal} catalogHref={catalogHref} contactHref={contactHref} />
        <AboutSection locale={locale} copy={copy.about} footerCopy={copy.footer} contactHref={contactHref} />
        <ZonesSection title={copy.zones.title} zones={ZONES_BY_LOCALE[locale]} />
        <FeaturedPropertiesSection
          copy={copy.featured}
          properties={FEATURED_PROPERTIES_BY_LOCALE[locale]}
          catalogHref={catalogHref}
          contactHref={contactHref}
        />
        <VirtualToursSection copy={copy.virtualTours} contactHref={contactHref} embedUrl={tourEmbed} />
        <OwnerCtaSection copy={copy.owner} proposalHref={proposalHref} />
        <OfficeSearchSection copy={copy.offices} proposalHref={proposalHref} />
        <DownloadablesSection
          copy={copy.downloadables}
          items={DOWNLOADABLE_ITEMS_BY_LOCALE[locale]}
          contactHref={contactHref}
        />
        <ContactSection copy={CONTACT_FORM_COPY[locale]} />
      </main>
      <SiteFooter navItems={marketingNav(locale)} footerCopy={copy.footer} />
    </>
  );
}
