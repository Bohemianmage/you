import Image from "next/image";
import Link from "next/link";

import type { FeaturedProperty } from "@/data/properties";
import { TEXT_LINK_INLINE } from "@/lib/link-styles";
import type { HomeCopy } from "@/i18n/home";

interface FeaturedPropertiesSectionProps {
  copy: HomeCopy["featured"];
  properties: readonly FeaturedProperty[];
  catalogHref: string;
  contactHref: string;
}

/**
 * Featured grid — card chrome mirrors Wix shadow `0px 1px 4px rgba(0,0,0,0.2)` on menus/containers.
 */
export function FeaturedPropertiesSection({
  copy,
  properties,
  catalogHref,
  contactHref,
}: FeaturedPropertiesSectionProps) {
  return (
    <section id="featured-properties" className="border-b border-brand-border bg-brand-bg py-16 sm:py-20 md:py-24" aria-labelledby="featured-heading">
      <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2 id="featured-heading" className="font-heading text-xl font-semibold uppercase tracking-wide text-brand-text sm:text-2xl">
              {copy.title}
            </h2>
            <p className="max-w-xl text-sm text-brand-muted">{copy.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link href={catalogHref} className={TEXT_LINK_INLINE}>
              {copy.catalogCta}
            </Link>
            <span className="hidden text-brand-border sm:inline" aria-hidden>
              ·
            </span>
            <Link href={contactHref} className={TEXT_LINK_INLINE}>
              {copy.visitCta}
            </Link>
          </div>
        </div>
        <ul className="grid gap-10 md:grid-cols-2">
          {properties.map((property) => (
            <li key={property.id}>
              <article className="flex h-full flex-col overflow-hidden rounded-sm border border-brand-border bg-brand-bg shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                <div className="relative aspect-[16/10] bg-gradient-to-br from-brand-surface to-brand-border/60">
                  {property.imageSrc ? (
                    <Image
                      src={property.imageSrc}
                      alt={property.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(47,46,46,0.08),transparent)]" />
                </div>
                <div className="flex flex-1 flex-col gap-4 p-6">
                  <h3 className="font-heading text-lg font-semibold leading-snug text-brand-text">{property.title}</h3>
                  <p className="font-heading text-2xl font-semibold text-brand-text">{property.price}</p>
                  <p className="text-sm leading-relaxed text-brand-muted">{property.address}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-accent">{property.status}</p>
                  <div className="mt-auto pt-2">
                    {property.tourUrl ? (
                      <a
                        href={property.tourUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-sm border border-brand-accent bg-transparent px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-accent transition hover:bg-brand-accent hover:text-brand-white"
                      >
                        {property.ctaLabel}
                      </a>
                    ) : (
                      <Link
                        href="#virtual-tours"
                        className="inline-flex items-center justify-center rounded-sm border border-brand-accent bg-transparent px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-accent transition hover:bg-brand-accent hover:text-brand-white"
                      >
                        {property.ctaLabel}
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
