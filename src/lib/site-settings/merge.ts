import "server-only";

import type { SiteContact } from "@/constants/site-contact";
import type { CatalogProperty } from "@/data/catalog-properties";
import type { DownloadableItem } from "@/data/downloadables";
import type { FeaturedProperty } from "@/data/properties";
import type { TeamMember } from "@/data/team";
import type { HomeCopy } from "@/i18n/home";
import { HOME_COPY } from "@/i18n/home";
import type { Locale } from "@/i18n/types";
import type { AdminEditorSeed } from "@/lib/site-content/editor-seed";
import {
  catalogAsFeaturedDetail,
  mergeCatalogFromFile,
  mergeDownloadablesFromFile,
  mergeFeaturedFromFile,
  mergeHomeCopy as mergeHomeCopyFromFile,
  mergePublicCatalogFromFile,
  mergeSiteContact as mergeSiteContactFromFile,
  mergeTeamFromFile,
  mergeClientLogosFromFile,
} from "@/lib/site-content/merge-public";
import type { ClientLogo, SiteContentFile } from "@/lib/site-content/types";

import { findCatalogPropertyBySegment, findFeaturedPropertyBySegment } from "@/lib/property-routes";

import { getCachedSiteContent } from "./load";

export function mergeSiteContact(file: SiteContentFile): SiteContact {
  return mergeSiteContactFromFile(file);
}

export function mergeHomeCopy(locale: Locale, base: HomeCopy, file: SiteContentFile): HomeCopy {
  return mergeHomeCopyFromFile(locale, base, file);
}

export async function getMergedSiteContext(locale: Locale): Promise<{ homeCopy: HomeCopy; contact: SiteContact }> {
  const file = await getCachedSiteContent();
  const base = HOME_COPY[locale];
  return {
    homeCopy: mergeHomeCopy(locale, base, file),
    contact: mergeSiteContact(file),
  };
}

export async function getMergedTeamMembers(): Promise<TeamMember[]> {
  const file = await getCachedSiteContent();
  return mergeTeamFromFile(file);
}

export async function getMergedClientLogos(): Promise<ClientLogo[]> {
  const file = await getCachedSiteContent();
  return mergeClientLogosFromFile(file);
}

export async function getMergedFeaturedForLocale(locale: Locale): Promise<FeaturedProperty[]> {
  const file = await getCachedSiteContent();
  return mergeFeaturedFromFile(locale, file);
}

export async function getMergedCatalog(): Promise<CatalogProperty[]> {
  const file = await getCachedSiteContent();
  return mergePublicCatalogFromFile(file);
}

export async function getMergedDownloadablesForLocale(locale: Locale): Promise<DownloadableItem[]> {
  const file = await getCachedSiteContent();
  return mergeDownloadablesFromFile(locale, file);
}

/** Ficha interna: destacados derivados del catálogo o lista legacy; catálogo con slug único. */
export async function getMergedPropertyDetailBySlug(locale: Locale, slug: string): Promise<FeaturedProperty | null> {
  const file = await getCachedSiteContent();
  const featured = mergeFeaturedFromFile(locale, file);
  const fromFeatured = findFeaturedPropertyBySegment(featured, slug);
  if (fromFeatured) return fromFeatured;
  const catalog = mergeCatalogFromFile(file);
  const cat = findCatalogPropertyBySegment(catalog, slug);
  if (!cat || cat.active === false) return null;
  return catalogAsFeaturedDetail(cat, locale);
}

function deriveFeaturedCatalogIdsForAdmin(file: SiteContentFile): string[] {
  if (file.featuredCatalogIds !== undefined) return [...file.featuredCatalogIds];
  const catalog = mergeCatalogFromFile(file);
  const catalogIds = new Set(catalog.map((c) => c.id));
  const legacy = file.featuredByLocale?.es;
  if (legacy?.length) {
    const ids = legacy.map((p) => p.id).filter((id) => catalogIds.has(id));
    if (ids.length) return ids;
  }
  const fromDefaults = mergeFeaturedFromFile("es", file)
    .map((p) => p.id)
    .filter((id) => catalogIds.has(id));
  if (fromDefaults.length) return fromDefaults;
  const active = catalog.filter((c) => c.active !== false);
  return active.slice(0, 6).map((c) => c.id);
}

export async function getAdminEditorSeed(): Promise<AdminEditorSeed> {
  const file = await getCachedSiteContent();
  return {
    team: mergeTeamFromFile(file),
    featuredCatalogIds: deriveFeaturedCatalogIdsForAdmin(file),
    catalog: mergeCatalogFromFile(file),
    downloadablesEs: mergeDownloadablesFromFile("es", file),
    downloadablesEn: mergeDownloadablesFromFile("en", file),
  };
}
