import { SITE_CONTACT, type SiteContact } from "@/constants/site-contact";
import type { CatalogProperty } from "@/data/catalog-properties";
import type { DownloadableItem } from "@/data/downloadables";
import { DOWNLOADABLE_ITEMS_BY_LOCALE } from "@/data/downloadables";
import type { FeaturedProperty } from "@/data/properties";
import { FEATURED_PROPERTIES_BY_LOCALE } from "@/data/properties";
import type { TeamMember } from "@/data/team";
import { inferListingType } from "@/lib/catalog-filters";
import { TEAM_MEMBERS } from "@/data/team";
import { clampTeamImageZoom } from "@/lib/team-image-framing";
import type { HomeCopy } from "@/i18n/home";
import type { Locale } from "@/i18n/types";

import { deepMerge } from "./deep-merge";
import type { ClientLogo, SiteContentFile } from "./types";

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
  const announcementOverride = file.heroAnnouncement?.[locale]?.trim();
  if (taglineOverride) {
    out = { ...out, footer: { ...out.footer, tagline: taglineOverride } };
  }
  /**
   * `heroAnnouncement` es atajo por idioma; si en `homeCopyByLocale` hay `hero.announcement`, gana el structured patch
   * (coherente con el drawer de edición).
   */
  const structuredAnnouncement = file.homeCopyByLocale?.[locale]?.hero?.announcement;
  const hasStructuredAnnouncement = typeof structuredAnnouncement === "string" && structuredAnnouncement.trim().length > 0;
  if (announcementOverride && !hasStructuredAnnouncement) {
    out = { ...out, hero: { ...out.hero, announcement: announcementOverride } };
  }
  return out;
}

export function mergeClientLogosFromFile(file: SiteContentFile): ClientLogo[] {
  if (file.clientLogos !== undefined) return [...file.clientLogos];
  return [];
}

/** Une JSON persistido con `TEAM_MEMBERS` por `id` para no perder fotos/contacto cuando el archivo no los incluye. */
export function mergeTeamFromFile(file: SiteContentFile): TeamMember[] {
  if (file.team === undefined) return [...TEAM_MEMBERS];
  const defaultsById = new Map(TEAM_MEMBERS.map((m) => [m.id, m]));
  return file.team.map((m) => {
    const base = defaultsById.get(m.id);
    if (!base) return { ...m };
    const role = { ...base.role, ...m.role };
    const trimmedImg = m.imageSrc?.trim();
    const trimmedObjPos = m.imageObjectPosition?.trim();
    const zoomFromFile = m.imageZoom;
    return {
      ...base,
      ...m,
      role,
      imageSrc: trimmedImg ? trimmedImg : base.imageSrc,
      imageFocus: m.imageFocus !== undefined ? m.imageFocus : base.imageFocus,
      imageObjectPosition: trimmedObjPos ? trimmedObjPos : base.imageObjectPosition,
      imageZoom:
        zoomFromFile != null && Number.isFinite(zoomFromFile) ? clampTeamImageZoom(zoomFromFile) : base.imageZoom,
      email: m.email?.trim() ? m.email.trim() : base.email,
      phoneDisplay: m.phoneDisplay?.trim() ? m.phoneDisplay.trim() : base.phoneDisplay,
      phoneHref: m.phoneHref?.trim() ? m.phoneHref.trim() : base.phoneHref,
      social: m.social !== undefined ? m.social : base.social,
    };
  });
}

export function mergeFeaturedFromFile(
  locale: Locale,
  file: SiteContentFile,
  ebCatalog: readonly CatalogProperty[],
): FeaturedProperty[] {
  if (file.featuredCatalogIds !== undefined) {
    const byId = new Map(ebCatalog.map((c) => [c.id, c]));
    return file.featuredCatalogIds
      .map((id) => byId.get(id))
      .filter((c): c is CatalogProperty => c != null && c.active !== false)
      .map((c) => catalogAsFeaturedDetail(c, locale));
  }

  const list = file.featuredByLocale?.[locale];
  if (list !== undefined) return [...list];

  const active = ebCatalog.filter((c) => c.active !== false);
  if (active.length) return active.slice(0, 6).map((c) => catalogAsFeaturedDetail(c, locale));

  return [...FEATURED_PROPERTIES_BY_LOCALE[locale]];
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

  const gallery = c.imageGallery?.map((u) => u.trim()).filter(Boolean);

  const listingType = c.listingType ?? inferListingType(c);

  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    price: c.price,
    address: c.address?.trim() || c.zone,
    specs: c.specs?.trim() || undefined,
    status: c.status?.trim() || defaultStatus,
    listingType: listingType ?? undefined,
    ctaLabel: c.ctaLabel?.trim() || defaultCta,
    description: c.description?.trim() || fallbackDesc,
    imageSrc: c.imageSrc,
    imageGallery: gallery?.length ? gallery : undefined,
    tourUrl: c.tourUrl,
    neighborhood: c.neighborhood?.trim() || undefined,
    propertyType: c.propertyType?.trim() || undefined,
    bedrooms: c.bedrooms,
    bathrooms: c.bathrooms,
    bathroomsFull: c.bathroomsFull,
    halfBathrooms: c.halfBathrooms,
    areaM2: c.areaM2,
    lotAreaM2: c.lotAreaM2,
    gardenM2: c.gardenM2,
    parkingSpots: c.parkingSpots,
    yearBuilt: c.yearBuilt,
    brochureUrl: c.brochureUrl?.trim() || undefined,
    ebOperations: c.ebOperations,
    ebListingUrl: c.ebListingUrl?.trim() || undefined,
    expenses: c.expenses?.trim() || undefined,
    floorsCount: c.floorsCount,
    floorNumber: c.floorNumber?.trim() || undefined,
    lotLengthM: c.lotLengthM,
    lotWidthM: c.lotWidthM,
    ebFeatures: c.ebFeatures,
    tagLabels: c.tagLabels,
    videoUrls: c.videoUrls,
    brochureUrls: c.brochureUrls,
    collaborationNotes: c.collaborationNotes?.trim() || undefined,
    agentName: c.agentName?.trim() || undefined,
    agentEmail: c.agentEmail?.trim() || undefined,
    foreclosure: c.foreclosure,
    exclusive: c.exclusive,
  };
}
