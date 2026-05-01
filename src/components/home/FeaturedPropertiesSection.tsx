import { withYouWordmark } from "@/components/brand/you-wordmark";
import { FeaturedPropertiesCarousel } from "@/components/home/FeaturedPropertiesCarousel";
import type { FeaturedProperty } from "@/data/properties";
import type { HomeCopy } from "@/i18n/home";
import type { Locale } from "@/i18n/types";

interface FeaturedPropertiesSectionProps {
  locale: Locale;
  copy: HomeCopy["featured"];
  properties: readonly FeaturedProperty[];
}

/**
 * Grid destacadas — sombra suave `0 1px 4px rgba(0,0,0,0.2)` en tarjetas.
 */
export function FeaturedPropertiesSection({ locale, copy, properties }: FeaturedPropertiesSectionProps) {
  return (
    <section
      id="featured-properties"
      className="border-b border-brand-border bg-brand-bg py-16 sm:py-20 md:py-24"
      aria-labelledby="featured-heading"
    >
      <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <h2
            id="featured-heading"
            className="font-heading text-xl font-semibold uppercase tracking-wide text-brand-text sm:text-2xl"
          >
            {copy.title}
          </h2>
          {copy.subtitle.trim() ? (
            <p className="max-w-xl text-sm text-brand-muted">{withYouWordmark(copy.subtitle)}</p>
          ) : null}
        </div>
        <FeaturedPropertiesCarousel locale={locale} featuredCopy={copy} properties={properties} />
      </div>
    </section>
  );
}
