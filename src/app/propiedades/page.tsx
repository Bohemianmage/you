import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { CatalogPageToolbar } from "@/components/propiedades/CatalogPageToolbar";
import { PropiedadesCatalog } from "@/components/propiedades/PropiedadesCatalog";
import { localeQuery } from "@/i18n/home";
import { resolveMarketingLocale } from "@/lib/marketing-locale";
import { CATALOG_PAGE_COPY } from "@/i18n/marketing-pages";
import { parseCatalogFiltersFromSearchParams } from "@/lib/catalog-query";
import { getMergedCatalog } from "@/lib/site-settings/merge";
import type { Metadata } from "next";

interface PropiedadesPageProps {
  searchParams?: Promise<{
    lang?: string;
    region?: string;
    area?: string;
    zone?: string;
    feat?: string | string[];
    tipo?: string;
    m2Min?: string;
    m2Max?: string;
    recMin?: string;
    recMax?: string;
    banMin?: string;
    banMax?: string;
    precioMin?: string;
    precioMax?: string;
    moneda?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PropiedadesPageProps): Promise<Metadata> {
  const params = searchParams ? await searchParams : undefined;
  const locale = await resolveMarketingLocale(params?.lang);
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
  const locale = await resolveMarketingLocale(params?.lang);
  const copy = CATALOG_PAGE_COPY[locale];
  const q = localeQuery(locale);
  const contactHref = `/contacto${q}`;
  const homeHref = locale === "en" ? "/?lang=en" : "/";
  const catalog = await getMergedCatalog(locale);
  const filters = parseCatalogFiltersFromSearchParams(params ?? {});

  return (
    <MarketingLayout locale={locale}>
      <div className="border-b border-brand-border bg-brand-bg px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <div className="min-w-0 space-y-2 lg:max-w-2xl">
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl">{copy.title}</h1>
              <p className="text-sm leading-relaxed text-brand-muted sm:text-base">{copy.subtitle}</p>
            </div>
            <CatalogPageToolbar
              locale={locale}
              homeHref={homeHref}
              contactHref={contactHref}
              backHomeLabel={copy.backHome}
              contactLabel={copy.contactCta}
            />
          </div>
          <PropiedadesCatalog
            locale={locale}
            serverCatalog={catalog}
            copy={copy}
            contactHref={contactHref}
            filters={filters}
          />
        </div>
      </div>
    </MarketingLayout>
  );
}
