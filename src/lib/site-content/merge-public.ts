import { SITE_CONTACT, type SiteContact } from "@/constants/site-contact";
import type { CatalogProperty } from "@/data/catalog-properties";
import { CATALOG_PROPERTIES } from "@/data/catalog-properties";
import type { DownloadableItem } from "@/data/downloadables";
import { DOWNLOADABLE_ITEMS_BY_LOCALE } from "@/data/downloadables";
import type { FeaturedProperty } from "@/data/properties";
import { FEATURED_PROPERTIES_BY_LOCALE } from "@/data/properties";
import type { TeamMember } from "@/data/team";
import { TEAM_MEMBERS } from "@/data/team";
import type { HomeCopy } from "@/i18n/home";
import type { Locale } from "@/i18n/types";

import { deepMerge } from "./deep-merge";
import type { SiteContentFile } from "./types";

export function mergeSiteContact(file: SiteContentFile): SiteContact {
  return {
    addressLine: file.contact?.addressLine ?? SITE_CONTACT.addressLine,
    phoneDisplay: file.contact?.phoneDisplay ?? SITE_CONTACT.phoneDisplay,
    phoneHref: file.contact?.phoneHref ?? SITE_CONTACT.phoneHref,
  };
}

/** Merge persistent file + defaults (usable en cliente y servidor). */
export function mergeHomeCopy(locale: Locale, base: HomeCopy, file: SiteContentFile): HomeCopy {
  let outRecord = structuredClone(base) as unknown as Record<string, unknown>;
  const localePatch = file.homeCopyByLocale?.[locale];
  if (localePatch && typeof localePatch === "object") {
    outRecord = deepMerge(outRecord, localePatch as Record<string, unknown>) as Record<string, unknown>;
  }
  let out = outRecord as unknown as HomeCopy;
  const taglineOverride = file.footerTagline?.[locale];
  const announcementOverride = file.heroAnnouncement?.[locale];
  if (taglineOverride) {
    out = { ...out, footer: { ...out.footer, tagline: taglineOverride } };
  }
  if (announcementOverride) {
    out = { ...out, hero: { ...out.hero, announcement: announcementOverride } };
  }
  return out;
}

export function mergeTeamFromFile(file: SiteContentFile): TeamMember[] {
  if (file.team !== undefined) return [...file.team];
  return [...TEAM_MEMBERS];
}

export function mergeFeaturedFromFile(locale: Locale, file: SiteContentFile): FeaturedProperty[] {
  const list = file.featuredByLocale?.[locale];
  if (list !== undefined) return [...list];
  return [...FEATURED_PROPERTIES_BY_LOCALE[locale]];
}

export function mergeCatalogFromFile(file: SiteContentFile): CatalogProperty[] {
  if (file.catalogProperties !== undefined) return [...file.catalogProperties];
  return [...CATALOG_PROPERTIES];
}

export function mergeDownloadablesFromFile(locale: Locale, file: SiteContentFile): DownloadableItem[] {
  const list = file.downloadablesByLocale?.[locale];
  if (list !== undefined) return [...list];
  return [...DOWNLOADABLE_ITEMS_BY_LOCALE[locale]];
}

/** Adapta un ítem del catálogo al layout de ficha (destacadas + catálogo comparten ruta). */
export function catalogAsFeaturedDetail(c: CatalogProperty, locale: Locale): FeaturedProperty {
  const defaultCta = locale === "en" ? "Virtual tours" : "Tours virtuales";
  const defaultStatus = locale === "en" ? "Available" : "Disponible";
  const fallbackDesc =
    locale === "en"
      ? `${c.specs}. ${c.zone}. Contact us for availability and a private visit.`
      : `${c.specs}. ${c.zone}. Consultanos por disponibilidad y visita.`;

  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    price: c.price,
    address: c.address?.trim() || c.zone,
    status: c.status?.trim() || defaultStatus,
    ctaLabel: c.ctaLabel?.trim() || defaultCta,
    description: c.description?.trim() || fallbackDesc,
    imageSrc: c.imageSrc,
    tourUrl: c.tourUrl,
  };
}
