import Link from "next/link";

import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { PropiedadesCatalog } from "@/components/propiedades/PropiedadesCatalog";
import { localeQuery, resolveLocale } from "@/i18n/home";
import { CATALOG_PAGE_COPY } from "@/i18n/marketing-pages";
import { TEXT_LINK_INLINE } from "@/lib/link-styles";
import { getMergedCatalog } from "@/lib/site-settings/merge";
import type { Metadata } from "next";

interface PropiedadesPageProps {
  searchParams?: Promise<{ lang?: string; zone?: string; tipo?: string }>;
}

export async function generateMetadata({ searchParams }: PropiedadesPageProps): Promise<Metadata> {
  const params = searchParams ? await searchParams : undefined;
  const locale = resolveLocale(params?.lang);
  const title = locale === "en" ? "Properties" : "Propiedades";
  return {
    title,
    description:
      locale === "en"
        ? "YOU Soluciones — portfolio and listings in Mexico City."
        : "YOU Soluciones — portafolio y propiedades en Ciudad de México.",
  };
}

export default async function PropiedadesPage({ searchParams }: PropiedadesPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const locale = resolveLocale(params?.lang);
  const copy = CATALOG_PAGE_COPY[locale];
  const q = localeQuery(locale);
  const contactHref = `/contacto${q}`;
  const homeHref = locale === "en" ? "/?lang=en" : "/";
  const catalog = await getMergedCatalog();
  const filterZone = typeof params?.zone === "string" ? params.zone : undefined;
  const filterTipo = params?.tipo === "rent" || params?.tipo === "sale" ? params.tipo : undefined;

  return (
    <MarketingLayout locale={locale}>
      <div className="border-b border-brand-border bg-brand-bg px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl">{copy.title}</h1>
              <p className="max-w-2xl text-sm text-brand-muted">{copy.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm font-semibold">
              <Link href={homeHref} className={TEXT_LINK_INLINE}>
                {copy.backHome}
              </Link>
              <span className="text-brand-border" aria-hidden>
                ·
              </span>
              <Link href={contactHref} className={TEXT_LINK_INLINE}>
                {copy.contactCta}
              </Link>
            </div>
          </div>
          <PropiedadesCatalog
            locale={locale}
            serverCatalog={catalog}
            copy={copy}
            contactHref={contactHref}
            filterZone={filterZone}
            filterTipo={filterTipo}
          />
        </div>
      </div>
    </MarketingLayout>
  );
}
