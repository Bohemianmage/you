import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { withYouWordmark } from "@/components/brand/you-wordmark";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { PropertyImageGallery } from "@/components/propiedades/PropertyImageGallery";
import { PROPERTY_DETAIL_COPY } from "@/i18n/marketing-pages";
import { homePath, localeQuery } from "@/i18n/home";
import { resolveMarketingLocale } from "@/lib/marketing-locale";
import { appendContactParams } from "@/lib/contact-url";
import { TEXT_LINK_INLINE } from "@/lib/link-styles";
import { propertyGalleryImages } from "@/lib/property-media";
import { publicSiteBaseUrl } from "@/lib/public-site-url";
import { buildPropertyWhatsAppUrl } from "@/lib/property-whatsapp";
import { getMergedPropertyDetailBySlug, getMergedSiteContact } from "@/lib/site-settings/merge";
import type { Metadata } from "next";

interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lang?: string }>;
}

export async function generateMetadata({ params, searchParams }: PropertyDetailPageProps): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams ?? Promise.resolve(undefined)]);
  const locale = await resolveMarketingLocale(sp?.lang);
  const prop = await getMergedPropertyDetailBySlug(locale, slug);
  if (!prop) {
    return { title: locale === "en" ? "Listing" : "Propiedad" };
  }
  return {
    title: prop.title,
    description: prop.description?.slice(0, 160) ?? prop.address,
  };
}

function fmtM2(n: number): string {
  return `${n} m²`;
}

export default async function PropertyDetailPage({ params, searchParams }: PropertyDetailPageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams ?? Promise.resolve(undefined)]);
  const locale = await resolveMarketingLocale(sp?.lang);
  const [property, contact] = await Promise.all([
    getMergedPropertyDetailBySlug(locale, slug),
    getMergedSiteContact(),
  ]);
  if (!property) notFound();

  const q = localeQuery(locale);
  const copy = PROPERTY_DETAIL_COPY[locale];
  const featuredHref = `${homePath(locale)}#featured-properties`;
  const catalogHref = `/propiedades${q}`;
  const contactInterestHref = appendContactParams(`/contacto${q}`, { topic: "visita" });

  const propertyUrl = `${publicSiteBaseUrl()}/propiedades/${encodeURIComponent(slug)}${q}`;
  const whatsappHref = buildPropertyWhatsAppUrl({
    phoneHref: contact.phoneHref,
    propertyTitle: property.title,
    propertyAbsoluteUrl: propertyUrl,
    locale,
  });
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`;

  const gallery = propertyGalleryImages(property);
  const singleCover = gallery.length === 1 ? gallery[0] : null;

  const detailRows: { label: string; value: string }[] = [];
  if (property.propertyType?.trim()) detailRows.push({ label: copy.typeLabel, value: property.propertyType.trim() });
  if (property.neighborhood?.trim())
    detailRows.push({ label: copy.neighborhoodLabel, value: property.neighborhood.trim() });
  if (property.bedrooms != null) detailRows.push({ label: copy.bedroomsLabel, value: String(property.bedrooms) });
  if (property.bathrooms != null) detailRows.push({ label: copy.bathroomsLabel, value: String(property.bathrooms) });
  if (property.areaM2 != null) detailRows.push({ label: copy.builtLabel, value: fmtM2(property.areaM2) });
  if (property.lotAreaM2 != null) detailRows.push({ label: copy.lotLabel, value: fmtM2(property.lotAreaM2) });
  if (property.gardenM2 != null) detailRows.push({ label: copy.gardenLabel, value: fmtM2(property.gardenM2) });
  if (property.parkingSpots != null)
    detailRows.push({ label: copy.parkingLabel, value: String(property.parkingSpots) });
  if (property.yearBuilt != null) detailRows.push({ label: copy.yearLabel, value: String(property.yearBuilt) });

  return (
    <MarketingLayout locale={locale}>
      <div className="border-b border-brand-border bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-10">
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

          {gallery.length > 1 ? (
            <PropertyImageGallery images={gallery} alt={property.title} />
          ) : singleCover ? (
            <div className="relative aspect-[16/10] overflow-hidden rounded-sm border border-brand-border shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
              <Image
                src={singleCover}
                alt={property.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
                priority
                unoptimized={singleCover.startsWith("http")}
              />
            </div>
          ) : null}

          {detailRows.length > 0 ? (
            <section className="rounded-sm border border-brand-border bg-brand-surface/40 p-6 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]" aria-labelledby="prop-details-heading">
              <h2 id="prop-details-heading" className="font-heading text-lg font-semibold text-brand-text">
                {copy.detailsHeading}
              </h2>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {detailRows.map((row) => (
                  <div key={row.label} className="flex flex-col gap-0.5 border-b border-brand-border/50 pb-3 sm:border-b-0 sm:pb-0">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">{row.label}</dt>
                    <dd className="text-sm font-semibold text-brand-text">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <section aria-labelledby="prop-location-heading">
            <h2 id="prop-location-heading" className="font-heading text-lg font-semibold text-brand-text">
              {copy.locationHeading}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">{property.address}</p>
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${TEXT_LINK_INLINE} mt-3 inline-block text-sm font-semibold`}
            >
              {copy.openMaps}
            </a>
          </section>

          <div className="space-y-4 text-sm leading-relaxed text-brand-muted">
            {(property.description ?? copy.descriptionFallback).split(/\n\n+/).map((para, i) => (
              <p key={i} className="text-brand-text">
                {withYouWordmark(para)}
              </p>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-sm bg-brand-accent px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-brand-white shadow-sm transition hover:bg-brand-accent-strong"
            >
              {copy.interestCta}
            </a>
            {property.tourUrl ? (
              <a
                href={property.tourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-sm border border-brand-accent px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-brand-accent transition hover:bg-brand-accent hover:text-brand-white"
              >
                {property.ctaLabel ?? copy.virtualTourCta}
              </a>
            ) : null}
            {property.brochureUrl ? (
              <a
                href={property.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-sm border border-brand-border px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-brand-text transition hover:border-brand-accent hover:text-brand-accent-strong"
              >
                {copy.brochureCta}
              </a>
            ) : null}
            <Link
              href={contactInterestHref}
              className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-brand-border bg-brand-bg px-6 text-sm font-semibold text-brand-text shadow-sm transition hover:border-brand-accent/40 hover:bg-brand-surface"
            >
              {copy.contactFormCta}
            </Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
