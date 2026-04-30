import Link from "next/link";

import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { CATALOG_PROPERTIES } from "@/data/catalog-properties";
import { localeQuery, resolveLocale } from "@/i18n/home";
import { CATALOG_PAGE_COPY } from "@/i18n/marketing-pages";
import type { Metadata } from "next";

interface PropiedadesPageProps {
  searchParams?: Promise<{ lang?: string }>;
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
              <Link href={homeHref} className="text-brand-accent hover:text-brand-accent-strong hover:underline">
                {copy.backHome}
              </Link>
              <span className="text-brand-border" aria-hidden>
                ·
              </span>
              <Link href={contactHref} className="text-brand-accent hover:text-brand-accent-strong hover:underline">
                {copy.contactCta}
              </Link>
            </div>
          </div>
          <ul className="grid gap-8 md:grid-cols-2">
            {CATALOG_PROPERTIES.map((p) => (
              <li key={p.id}>
                <article className="flex h-full flex-col rounded-sm border border-brand-border bg-brand-surface p-6 shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-accent">{copy.zoneLabel}: {p.zone}</p>
                  <h2 className="mt-2 font-heading text-xl font-semibold text-brand-text">{p.title}</h2>
                  <p className="mt-3 font-heading text-2xl font-semibold text-brand-text">{p.price}</p>
                  <p className="mt-2 text-sm text-brand-muted">
                    <span className="font-semibold text-brand-text">{copy.specsLabel}:</span> {p.specs}
                  </p>
                  <Link
                    href={contactHref}
                    className="mt-6 inline-flex w-fit items-center justify-center rounded-sm border border-brand-accent px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-accent transition hover:bg-brand-accent hover:text-brand-white"
                  >
                    {copy.contactCta}
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MarketingLayout>
  );
}
