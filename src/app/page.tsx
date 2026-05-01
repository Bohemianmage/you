import { HomePageContent } from "@/components/home/HomePageContent";
import { MarketingPageFrame } from "@/components/layout/MarketingPageFrame";
import { DOWNLOADABLE_ITEMS_BY_LOCALE } from "@/data/downloadables";
import { ZONES_BY_LOCALE } from "@/data/zones";
import { localeQuery, marketingNav, resolveLocale } from "@/i18n/home";
import { getMergedFeaturedForLocale, getMergedSiteContext, getMergedTeamMembers } from "@/lib/site-settings/merge";

interface HomePageProps {
  searchParams?: Promise<{ lang?: string }>;
}

/**
 * Marketing home — bloques modulares y copy por locale.
 */
export default async function Home({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const locale = resolveLocale(params?.lang);
  const [{ homeCopy: copy, contact }, teamMembers, featuredProperties] = await Promise.all([
    getMergedSiteContext(locale),
    getMergedTeamMembers(),
    getMergedFeaturedForLocale(locale),
  ]);
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
        serverTeam={teamMembers}
        serverFeatured={featuredProperties}
      />
    </MarketingPageFrame>
  );
}
