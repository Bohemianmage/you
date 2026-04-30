import "server-only";

import { SITE_CONTACT, type SiteContact } from "@/constants/site-contact";
import type { FeaturedProperty } from "@/data/properties";
import { FEATURED_PROPERTIES_BY_LOCALE } from "@/data/properties";
import type { TeamMember } from "@/data/team";
import { TEAM_MEMBERS } from "@/data/team";
import type { HomeCopy } from "@/i18n/home";
import { HOME_COPY } from "@/i18n/home";
import type { Locale } from "@/i18n/types";

import { getCachedSiteContent } from "./load";
import type { AdminEditorSeed } from "@/lib/site-content/editor-seed";
import type { SiteContentFile } from "@/lib/site-content/types";

export function mergeSiteContact(file: SiteContentFile): SiteContact {
  return {
    addressLine: file.contact?.addressLine ?? SITE_CONTACT.addressLine,
    phoneDisplay: file.contact?.phoneDisplay ?? SITE_CONTACT.phoneDisplay,
    phoneHref: file.contact?.phoneHref ?? SITE_CONTACT.phoneHref,
  };
}

export function mergeHomeCopy(locale: Locale, base: HomeCopy, file: SiteContentFile): HomeCopy {
  const taglineOverride = file.footerTagline?.[locale];
  const announcementOverride = file.heroAnnouncement?.[locale];

  return {
    ...base,
    footer: {
      ...base.footer,
      ...(taglineOverride ? { tagline: taglineOverride } : {}),
    },
    hero: {
      ...base.hero,
      ...(announcementOverride ? { announcement: announcementOverride } : {}),
    },
  };
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
  if (file.team !== undefined) return [...file.team];
  return [...TEAM_MEMBERS];
}

export async function getMergedFeaturedForLocale(locale: Locale): Promise<FeaturedProperty[]> {
  const file = await getCachedSiteContent();
  const list = file.featuredByLocale?.[locale];
  if (list !== undefined) return [...list];
  return [...FEATURED_PROPERTIES_BY_LOCALE[locale]];
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
  const [team, featuredEs, featuredEn] = await Promise.all([
    getMergedTeamMembers(),
    getMergedFeaturedForLocale("es"),
    getMergedFeaturedForLocale("en"),
  ]);
  return { ...base, team, featuredEs, featuredEn };
}
