import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { withYouWordmark } from "@/components/brand/you-wordmark";
import { ListingTypeBadge } from "@/components/propiedades/ListingTypeBadge";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { PropertyImageGallery } from "@/components/propiedades/PropertyImageGallery";
import {
  CATALOG_PAGE_COPY,
  PROPERTY_DETAIL_COPY,
  ebOperationPeriodNote,
  ebOperationTypeLabel,
} from "@/i18n/marketing-pages";
import { localeQuery } from "@/i18n/home";
import { resolveMarketingLocale } from "@/lib/marketing-locale";
import { inferListingDisplayType } from "@/lib/catalog-filters";
import { appendContactParams } from "@/lib/contact-url";
import { TEXT_LINK_INLINE } from "@/lib/link-styles";
import { propertyGalleryImages } from "@/lib/property-media";
import { publicSiteBaseUrl } from "@/lib/public-site-url";
import { buildPropertyWhatsAppUrl } from "@/lib/property-whatsapp";
import { getMergedPropertyDetailBySlug, getMergedSiteContact } from "@/lib/site-settings/merge";
import type { FeaturedProperty } from "@/data/properties";
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

function uniqueUrls(urls: (string | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    const t = u?.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function groupFeatures(property: FeaturedProperty, uncategorizedLabel: string): Map<string, string[]> {
  const grouped = new Map<string, Set<string>>();
  for (const f of property.ebFeatures ?? []) {
    const cat = f.category.trim() || uncategorizedLabel;
    const set = grouped.get(cat) ?? new Set<string>();
    set.add(f.name.trim());
    grouped.set(cat, set);
  }
  const out = new Map<string, string[]>();
  for (const [cat, set] of grouped) out.set(cat, [...set].sort((a, b) => a.localeCompare(b)));
  return out;
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

  const pdfDocuments = uniqueUrls([property.brochureUrl, ...(property.brochureUrls ?? [])]);

  const ops = property.ebOperations ?? [];
  const showOperationsBreakdown = ops.length > 1;

  const detailRows: { label: string; value: string }[] = [];
  if (property.propertyType?.trim()) detailRows.push({ label: copy.typeLabel, value: property.propertyType.trim() });
  if (property.neighborhood?.trim())
    detailRows.push({ label: copy.neighborhoodLabel, value: property.neighborhood.trim() });
  if (property.bedrooms != null) detailRows.push({ label: copy.bedroomsLabel, value: String(property.bedrooms) });

  const hasBathBreakdown =
    (property.bathroomsFull != null && property.bathroomsFull > 0) ||
    (property.halfBathrooms != null && property.halfBathrooms > 0);
  if (hasBathBreakdown) {
    if (property.bathroomsFull != null && property.bathroomsFull > 0)
      detailRows.push({ label: copy.fullBathroomsLabel, value: String(property.bathroomsFull) });
    if (property.halfBathrooms != null && property.halfBathrooms > 0)
      detailRows.push({ label: copy.halfBathroomsLabel, value: String(property.halfBathrooms) });
  } else if (property.bathrooms != null) {
    detailRows.push({ label: copy.bathroomsLabel, value: String(property.bathrooms) });
  }

  if (property.areaM2 != null) detailRows.push({ label: copy.builtLabel, value: fmtM2(property.areaM2) });
  if (property.lotAreaM2 != null) detailRows.push({ label: copy.lotLabel, value: fmtM2(property.lotAreaM2) });
  if (property.lotLengthM != null && property.lotWidthM != null)
    detailRows.push({
      label: copy.lotDimensionsLabel,
      value: `${property.lotLengthM} × ${property.lotWidthM} m`,
    });
  if (property.gardenM2 != null) detailRows.push({ label: copy.gardenLabel, value: fmtM2(property.gardenM2) });
  if (property.parkingSpots != null)
    detailRows.push({ label: copy.parkingLabel, value: String(property.parkingSpots) });
  if (property.floorsCount != null) detailRows.push({ label: copy.floorsLabel, value: String(property.floorsCount) });
  if (property.floorNumber?.trim())
    detailRows.push({ label: copy.floorUnitLabel, value: property.floorNumber.trim() });
  if (property.yearBuilt != null) detailRows.push({ label: copy.yearLabel, value: String(property.yearBuilt) });
  if (property.expenses?.trim()) detailRows.push({ label: copy.expensesLabel, value: property.expenses.trim() });

  const badgeClass =
    "rounded-full border border-brand-border bg-brand-surface/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-muted";

  const featuresGrouped = groupFeatures(property, copy.featuresUncategorized);

  return (
    <MarketingLayout locale={locale}>
      <div className="border-b border-brand-border bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-10">
          <nav className="text-sm font-semibold">
            <Link href={catalogHref} className={TEXT_LINK_INLINE}>
              {copy.backCatalog}
            </Link>
          </nav>

          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <ListingTypeBadge
                kind={inferListingDisplayType({
                  listingType: property.listingType,
                  status: property.status,
                  title: property.title,
                  specs: property.specs,
                  ebOperations: property.ebOperations,
                })}
                labels={{
                  rent: CATALOG_PAGE_COPY[locale].listingBadgeRent,
                  sale: CATALOG_PAGE_COPY[locale].listingBadgeSale,
                }}
              />
              {property.foreclosure ? <span className={badgeClass}>{copy.badgeForeclosure}</span> : null}
            </div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl">{property.title}</h1>
            <p className="font-heading text-2xl font-semibold text-brand-text">{property.price}</p>
            <p className="text-sm leading-relaxed text-brand-muted">{property.address}</p>
          </header>

          {showOperationsBreakdown ? (
            <section className="rounded-sm border border-brand-border bg-brand-bg px-5 py-5 shadow-sm" aria-labelledby="prop-ops-heading">
              <h2 id="prop-ops-heading" className="font-heading text-lg font-semibold text-brand-text">
                {copy.operationsHeading}
              </h2>
              <ul className="mt-4 space-y-3">
                {ops.map((op, idx) => {
                  const periodNote = ebOperationPeriodNote(op.period, locale);
                  return (
                    <li key={`${op.type}-${idx}`} className="flex flex-col gap-0.5 border-b border-brand-border/40 pb-3 last:border-b-0 last:pb-0">
                      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">
                        {ebOperationTypeLabel(op.type, locale)}
                      </span>
                      <span className="text-lg font-semibold text-brand-text">{op.formatted_amount}</span>
                      {periodNote ? <span className="text-xs text-brand-muted">({periodNote})</span> : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

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
                {detailRows.map((row, i) => (
                  <div
                    key={`${row.label}-${i}`}
                    className="flex flex-col gap-0.5 border-b border-brand-border/50 pb-3 sm:border-b-0 sm:pb-0"
                  >
                    <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">{row.label}</dt>
                    <dd className="text-sm font-semibold text-brand-text">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {featuresGrouped.size > 0 ? (
            <section className="space-y-6" aria-labelledby="prop-features-heading">
              <h2 id="prop-features-heading" className="font-heading text-lg font-semibold text-brand-text">
                {copy.featuresHeading}
              </h2>
              {[...featuresGrouped.entries()].map(([category, names]) => (
                <div key={category} className="space-y-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted">{category}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {names.map((name) => (
                      <li
                        key={`${category}-${name}`}
                        className="rounded-full border border-brand-border bg-brand-bg px-3 py-1.5 text-xs font-medium text-brand-text"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ) : null}

          {property.tagLabels?.length ? (
            <section aria-labelledby="prop-tags-heading">
              <h2 id="prop-tags-heading" className="font-heading text-lg font-semibold text-brand-text">
                {copy.tagsHeading}
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {property.tagLabels.map((t) => (
                  <li key={t} className="rounded-sm bg-brand-accent/10 px-2.5 py-1 text-xs font-semibold text-brand-accent-strong">
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {property.videoUrls?.length ? (
            <section aria-labelledby="prop-videos-heading">
              <h2 id="prop-videos-heading" className="font-heading text-lg font-semibold text-brand-text">
                {copy.videosHeading}
              </h2>
              <ul className="mt-3 space-y-2">
                {property.videoUrls.map((url, i) => (
                  <li key={`${url}-${i}`}>
                    <a href={url} target="_blank" rel="noopener noreferrer" className={`${TEXT_LINK_INLINE} text-sm font-semibold`}>
                      {copy.videoOpenLabel} {property.videoUrls!.length > 1 ? `(${i + 1})` : ""}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {pdfDocuments.length > 0 ? (
            <section aria-labelledby="prop-docs-heading">
              <h2 id="prop-docs-heading" className="font-heading text-lg font-semibold text-brand-text">
                {copy.documentsHeading}
              </h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {pdfDocuments.map((href, i) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-sm border border-brand-border px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-text transition hover:border-brand-accent hover:text-brand-accent-strong"
                  >
                    {pdfDocuments.length > 1 ? `${copy.brochureCta} (${i + 1}/${pdfDocuments.length})` : copy.brochureCta}
                  </a>
                ))}
              </div>
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
