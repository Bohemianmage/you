import { SITE_CONTACT, type SiteContact } from "@/constants/site-contact";
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
