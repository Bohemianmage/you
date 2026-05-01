import type { CatalogProperty } from "@/data/catalog-properties";
import type { FeaturedProperty } from "@/data/properties";
import { localeQuery } from "@/i18n/home";
import type { Locale } from "@/i18n/types";

/** URL path segment for `/propiedades/[slug]` — explicit slug or stable `id`. */
export function featuredPropertySegment(property: FeaturedProperty): string {
  const s = property.slug?.trim();
  return s && s.length > 0 ? s : property.id;
}

/** Relative href to the internal property detail page (featured listings). */
export function featuredPropertyDetailHref(locale: Locale, property: FeaturedProperty): string {
  const seg = encodeURIComponent(featuredPropertySegment(property));
  return `/propiedades/${seg}${localeQuery(locale)}`;
}

export function findFeaturedPropertyBySegment(list: readonly FeaturedProperty[], slugParam: string): FeaturedProperty | undefined {
  const decoded = decodeURIComponent(slugParam);
  return list.find((p) => featuredPropertySegment(p) === decoded);
}

export function catalogPropertySegment(c: CatalogProperty): string {
  const s = c.slug?.trim();
  return s && s.length > 0 ? s : c.id;
}

export function catalogDetailHref(locale: Locale, c: CatalogProperty): string {
  const seg = encodeURIComponent(catalogPropertySegment(c));
  return `/propiedades/${seg}${localeQuery(locale)}`;
}

export function findCatalogPropertyBySegment(list: readonly CatalogProperty[], slugParam: string): CatalogProperty | undefined {
  const decoded = decodeURIComponent(slugParam);
  return list.find((p) => catalogPropertySegment(p) === decoded);
}
