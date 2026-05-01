import "server-only";

import type { SiteContact } from "@/constants/site-contact";
import type { FeaturedProperty } from "@/data/properties";
import type { TeamMember } from "@/data/team";
import type { HomeCopy } from "@/i18n/home";
import { HOME_COPY } from "@/i18n/home";
import type { Locale } from "@/i18n/types";
import type { AdminEditorSeed } from "@/lib/site-content/editor-seed";
import {
  mergeFeaturedFromFile,
  mergeHomeCopy as mergeHomeCopyFromFile,
  mergeSiteContact as mergeSiteContactFromFile,
  mergeTeamFromFile,
} from "@/lib/site-content/merge-public";
import type { SiteContentFile } from "@/lib/site-content/types";

import { findFeaturedPropertyBySegment } from "@/lib/property-routes";

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

export async function getMergedFeaturedForLocale(locale: Locale): Promise<FeaturedProperty[]> {
  const file = await getCachedSiteContent();
  return mergeFeaturedFromFile(locale, file);
}

export async function getMergedFeaturedPropertyBySlug(locale: Locale, slug: string): Promise<FeaturedProperty | null> {
  const list = await getMergedFeaturedForLocale(locale);
  return findFeaturedPropertyBySegment(list, slug) ?? null;
}

/** Valores efectivos para el formulario admin (tras aplicar overrides). */
export async function getAdminFormSeed(): Promise<{
  contact: SiteContact;
  footerTaglineEs: string;
  footerTaglineEn: string;
  heroAnnouncementEs: string;
  heroAnnouncementEn: string;
}> {
  const file = await getCachedSiteContent();
  const contact = mergeSiteContact(file);
  return {
    contact,
    footerTaglineEs: mergeHomeCopy("es", HOME_COPY.es, file).footer.tagline,
    footerTaglineEn: mergeHomeCopy("en", HOME_COPY.en, file).footer.tagline,
    heroAnnouncementEs: mergeHomeCopy("es", HOME_COPY.es, file).hero.announcement,
    heroAnnouncementEn: mergeHomeCopy("en", HOME_COPY.en, file).hero.announcement,
  };
}

export async function getAdminEditorSeed(): Promise<AdminEditorSeed> {
  const base = await getAdminFormSeed();
  const file = await getCachedSiteContent();
  const [team, featuredEs, featuredEn] = [
    mergeTeamFromFile(file),
    mergeFeaturedFromFile("es", file),
    mergeFeaturedFromFile("en", file),
  ];
  return { ...base, team, featuredEs, featuredEn };
}
