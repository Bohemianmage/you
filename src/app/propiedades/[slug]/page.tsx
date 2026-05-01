import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { PROPERTY_DETAIL_COPY } from "@/i18n/marketing-pages";
import { homePath, localeQuery, resolveLocale } from "@/i18n/home";
import { appendContactParams } from "@/lib/contact-url";
import { TEXT_LINK_INLINE } from "@/lib/link-styles";
import { getMergedPropertyDetailBySlug } from "@/lib/site-settings/merge";
import type { Metadata } from "next";

interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lang?: string }>;
}

export async function generateMetadata({ params, searchParams }: PropertyDetailPageProps): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams ?? Promise.resolve(undefined)]);
  const locale = resolveLocale(sp?.lang);
  const prop = await getMergedPropertyDetailBySlug(locale, slug);
  if (!prop) {
    return { title: locale === "en" ? "Listing" : "Propiedad" };
  }
  return {
    title: prop.title,
    description: prop.description?.slice(0, 160) ?? prop.address,
  };
}

export default async function PropertyDetailPage({ params, searchParams }: PropertyDetailPageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams ?? Promise.resolve(undefined)]);
  const locale = resolveLocale(sp?.lang);
  const property = await getMergedPropertyDetailBySlug(locale, slug);
  if (!property) notFound();

  const q = localeQuery(locale);
  const copy = PROPERTY_DETAIL_COPY[locale];
  const featuredHref = `${homePath(locale)}#featured-properties`;
  const catalogHref = `/propiedades${q}`;
  const contactInterestHref = appendContactParams(`/contacto${q}`, { topic: "visita" });

  return (
    <MarketingLayout locale={locale}>
      <div className="border-b border-brand-border bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-8">
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
            <Link href={featuredHref} className={TEXT_LINK_INLINE}>
              {copy.backFeatured}
            </Link>
            <span className="text-brand-border" aria-hidden>
              ·
            </span>
            <Link href={catalogHref} className={TEXT_LINK_INLINE}>
              {copy.backCatalog}
            </Link>
          </nav>

          <header className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-accent">{property.status}</p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl">{property.title}</h1>
            <p className="font-heading text-2xl font-semibold text-brand-text">{property.price}</p>
            <p className="text-sm leading-relaxed text-brand-muted">{property.address}</p>
          </header>

          {property.imageSrc ? (
            <div className="relative aspect-[16/10] overflow-hidden rounded-sm border border-brand-border shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
              <Image
                src={property.imageSrc}
                alt={property.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          ) : null}

          <div className="space-y-4 text-sm leading-relaxed text-brand-muted">
            {(property.description ?? copy.descriptionFallback).split(/\n\n+/).map((para, i) => (
              <p key={i} className="text-brand-text">
                {para}
              </p>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={contactInterestHref}
              className="inline-flex items-center justify-center rounded-sm bg-brand-accent px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-brand-white shadow-sm transition hover:bg-brand-accent-strong"
            >
              {copy.interestCta}
            </Link>
            {property.tourUrl ? (
              <a
                href={property.tourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-sm border border-brand-accent px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-brand-accent transition hover:bg-brand-accent hover:text-brand-white"
              >
                {copy.virtualTourCta}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
