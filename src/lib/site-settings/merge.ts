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
import { getCachedEasyBrokerCatalog, getCachedEasyBrokerPropertyDetail } from "@/lib/easybroker/catalog-cache";
import {
  catalogAsFeaturedDetail,
  mergeDownloadablesFromFile,
  mergeFeaturedFromFile,
  mergeHomeCopy as mergeHomeCopyFromFile,
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
  const catalog = await getCachedEasyBrokerCatalog(locale);
  return mergeFeaturedFromFile(locale, file, catalog);
}

export async function getMergedCatalog(locale: Locale): Promise<CatalogProperty[]> {
  const catalog = await getCachedEasyBrokerCatalog(locale);
  return catalog.filter((p) => p.active !== false);
}

export async function getMergedDownloadablesForLocale(locale: Locale): Promise<DownloadableItem[]> {
  const file = await getCachedSiteContent();
  return mergeDownloadablesFromFile(locale, file);
}

/** Ficha interna: catálogo EasyBroker enriquecido con GET detalle. */
export async function getMergedPropertyDetailBySlug(locale: Locale, slug: string): Promise<FeaturedProperty | null> {
  const file = await getCachedSiteContent();
  const catalog = await getCachedEasyBrokerCatalog(locale);
  const segment = decodeURIComponent(slug);

  const fromList = findCatalogPropertyBySegment(catalog, slug);
  if (fromList && fromList.active !== false) {
    const detail = await getCachedEasyBrokerPropertyDetail(segment, locale);
    return catalogAsFeaturedDetail(detail ?? fromList, locale);
  }

  const featured = mergeFeaturedFromFile(locale, file, catalog);
  return findFeaturedPropertyBySegment(featured, slug) ?? null;
}

export async function getMergedSiteContact(): Promise<SiteContact> {
  const file = await getCachedSiteContent();
  return mergeSiteContact(file);
}

function deriveFeaturedCatalogIdsForAdmin(file: SiteContentFile, ebCatalog: readonly CatalogProperty[]): string[] {
  if (file.featuredCatalogIds !== undefined) return [...file.featuredCatalogIds];
  const catalogIds = new Set(ebCatalog.map((c) => c.id));
  const fromMerged = mergeFeaturedFromFile("es", file, ebCatalog)
    .map((p) => p.id)
    .filter((id) => catalogIds.has(id));
  if (fromMerged.length) return fromMerged;
  const active = ebCatalog.filter((c) => c.active !== false);
  return active.slice(0, 6).map((c) => c.id);
}

export async function getAdminEditorSeed(): Promise<AdminEditorSeed> {
  const file = await getCachedSiteContent();
  const catalog = await getCachedEasyBrokerCatalog("es");
  return {
    team: mergeTeamFromFile(file),
    featuredCatalogIds: deriveFeaturedCatalogIdsForAdmin(file, catalog),
    propertyAdvisorByCatalogId: file.propertyAdvisorByCatalogId ? { ...file.propertyAdvisorByCatalogId } : {},
    advisorNoWeekendAvailability: file.advisorNoWeekendAvailability?.length ? [...file.advisorNoWeekendAvailability] : [],
    catalog,
    downloadablesEs: mergeDownloadablesFromFile("es", file),
    downloadablesEn: mergeDownloadablesFromFile("en", file),
  };
}
