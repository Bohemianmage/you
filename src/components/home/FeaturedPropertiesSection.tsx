import Link from "next/link";

import { withYouWordmark } from "@/components/brand/you-wordmark";
import { FeaturedPropertiesCarousel } from "@/components/home/FeaturedPropertiesCarousel";
import type { FeaturedProperty } from "@/data/properties";
import type { HomeCopy } from "@/i18n/home";
import type { Locale } from "@/i18n/types";
import { TEXT_LINK_INLINE } from "@/lib/link-styles";

interface FeaturedPropertiesSectionProps {
  locale: Locale;
  copy: HomeCopy["featured"];
  properties: readonly FeaturedProperty[];
  catalogHref: string;
  contactHref: string;
}

/**
 * Grid destacadas — sombra suave `0 1px 4px rgba(0,0,0,0.2)` en tarjetas.
 */
export function FeaturedPropertiesSection({
  locale,
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
            <p className="max-w-xl text-sm text-brand-muted">{withYouWordmark(copy.subtitle)}</p>
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
        <FeaturedPropertiesCarousel locale={locale} featuredCopy={copy} properties={properties} />
      </div>
    </section>
  );
}
