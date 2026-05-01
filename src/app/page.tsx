import { HomePageContent } from "@/components/home/HomePageContent";
import { MarketingPageFrame } from "@/components/layout/MarketingPageFrame";
import { localeQuery } from "@/i18n/home";
import { resolveMarketingLocale } from "@/lib/marketing-locale";
import { distinctCatalogZoneFilterKeys } from "@/lib/catalog-zone-filter";
import {
  getMergedCatalog,
  getMergedClientLogos,
  getMergedDownloadablesForLocale,
  getMergedFeaturedForLocale,
  getMergedSiteContext,
  getMergedTeamMembers,
} from "@/lib/site-settings/merge";

interface HomePageProps {
  searchParams?: Promise<{ lang?: string }>;
}

/**
 * Marketing home — bloques modulares y copy por locale.
 */
export default async function Home({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const locale = await resolveMarketingLocale(params?.lang);
  const [{ homeCopy: copy, contact }, teamMembers, featuredProperties, downloadables, clientLogos, catalog] =
    await Promise.all([
      getMergedSiteContext(locale),
      getMergedTeamMembers(),
      getMergedFeaturedForLocale(locale),
      getMergedDownloadablesForLocale(locale),
      getMergedClientLogos(),
      getMergedCatalog(locale),
    ]);
  const catalogZones = distinctCatalogZoneFilterKeys(catalog, locale === "en" ? "en" : "es");
  const q = localeQuery(locale);
  const catalogHref = `/propiedades${q}`;
  const contactHref = `/contacto${q}`;
  const proposalHref = `/nuestra-propuesta${q}`;
  const tourEmbed = process.env.NEXT_PUBLIC_VIRTUAL_TOUR_EMBED_URL;

  return (
    <MarketingPageFrame locale={locale} fallback={{ homeCopy: copy, contact }}>
      <HomePageContent
        catalogHref={catalogHref}
        contactHref={contactHref}
        proposalHref={proposalHref}
        tourEmbed={tourEmbed}
        catalogZones={catalogZones}
        serverTeam={teamMembers}
        serverFeatured={featuredProperties}
        serverDownloadables={downloadables}
        serverClientLogos={clientLogos}
      />
    </MarketingPageFrame>
  );
}
