import { z } from "zod";

import { clampTeamImageZoom } from "@/lib/team-image-framing";

import type { SiteContentFile } from "./types";

const teamImageFocusEnum = z.enum(["center", "top", "face", "bottom", "left", "right"]);

const teamMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.object({
    es: z.string(),
    en: z.string(),
  }),
  imageSrc: z.string().optional(),
  imageFocus: teamImageFocusEnum.optional(),
  imageObjectPosition: z.string().optional(),
  imageZoom: z.number().min(100).max(140).optional(),
  email: z.string().optional(),
  phoneDisplay: z.string().optional(),
  phoneHref: z.string().optional(),
  social: z
    .object({
      facebook: z.string().optional(),
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
    })
    .optional(),
});

const catalogPropertySchema = z.object({
  id: z.string().min(1),
  active: z.boolean().optional(),
  slug: z.string().optional(),
  title: z.string().min(1),
  price: z.string().min(1),
  specs: z.string().min(1),
  zone: z.string().min(1),
  zoneGroup: z.string().min(1).optional(),
  address: z.string().optional(),
  status: z.string().optional(),
  description: z.string().optional(),
  imageSrc: z.string().optional(),
  imageGallery: z.array(z.string()).optional(),
  tourUrl: z.string().optional(),
  ctaLabel: z.string().optional(),
  listingType: z.enum(["rent", "sale"]).optional(),
  areaM2: z.number().nonnegative().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().nonnegative().optional(),
  priceAmount: z.number().nonnegative().optional(),
  priceCurrency: z.enum(["MXN", "USD"]).optional(),
  neighborhood: z.string().optional(),
  propertyType: z.string().optional(),
  lotAreaM2: z.number().nonnegative().optional(),
  gardenM2: z.number().nonnegative().optional(),
  parkingSpots: z.number().int().nonnegative().optional(),
  yearBuilt: z.number().int().optional(),
  brochureUrl: z.string().optional(),
});

const clientLogoSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
});

const downloadableItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  fileUrl: z.string().optional(),
  imageSrc: z.string().optional(),
});

export const siteContentFileSchema = z
  .object({
    version: z.literal(1).optional(),
    contact: z
      .object({
        addressLine: z.string().optional(),
        phoneDisplay: z.string().optional(),
        phoneHref: z.string().optional(),
        emailDisplay: z.string().optional(),
        emailHref: z.string().optional(),
      })
      .optional(),
    footerTagline: z
      .object({
        es: z.string().optional(),
        en: z.string().optional(),
      })
      .optional(),
    heroAnnouncement: z
      .object({
        es: z.string().optional(),
        en: z.string().optional(),
      })
      .optional(),
    team: z.array(teamMemberSchema).optional(),
    featuredCatalogIds: z.array(z.string().min(1)).optional(),
    catalogProperties: z.array(catalogPropertySchema).optional(),
    clientLogos: z.array(clientLogoSchema).optional(),
    downloadablesByLocale: z
      .object({
        es: z.array(downloadableItemSchema).optional(),
        en: z.array(downloadableItemSchema).optional(),
      })
      .optional(),
    homeCopyByLocale: z.any().optional(),
    propertyAdvisorByCatalogId: z.record(z.string(), z.string()).optional(),
    advisorNoWeekendAvailability: z.array(z.string().min(1)).optional(),
  });

export function parseSiteContentFile(raw: unknown): SiteContentFile {
  const parsed = siteContentFileSchema.parse(raw);
  return pruneSiteContent(parsed);
}

function pruneSiteContent(input: z.infer<typeof siteContentFileSchema>): SiteContentFile {
  const out: SiteContentFile = { version: 1 };

  if (input.contact) {
    const c = Object.fromEntries(Object.entries(input.contact).filter(([, v]) => typeof v === "string" && v.trim().length > 0));
    if (Object.keys(c).length) out.contact = c as SiteContentFile["contact"];
  }

  if (input.footerTagline) {
    const f = Object.fromEntries(Object.entries(input.footerTagline).filter(([, v]) => typeof v === "string" && v.trim().length > 0));
    if (Object.keys(f).length) out.footerTagline = f as SiteContentFile["footerTagline"];
  }

  if (input.heroAnnouncement) {
    const h = Object.fromEntries(Object.entries(input.heroAnnouncement).filter(([, v]) => typeof v === "string" && v.trim().length > 0));
    if (Object.keys(h).length) out.heroAnnouncement = h as SiteContentFile["heroAnnouncement"];
  }

  if (input.team !== undefined) {
    out.team = input.team.map((m) => ({
      ...m,
      imageSrc: m.imageSrc?.trim() || undefined,
      imageFocus: m.imageFocus,
      imageObjectPosition: m.imageObjectPosition?.trim() || undefined,
      imageZoom: m.imageZoom != null ? clampTeamImageZoom(m.imageZoom) : undefined,
      email: m.email?.trim() || undefined,
      phoneDisplay: m.phoneDisplay?.trim() || undefined,
      phoneHref: m.phoneHref?.trim() || undefined,
      social:
        m.social && Object.values(m.social).some((u) => u && u.trim())
          ? {
              facebook: m.social.facebook?.trim() || undefined,
              twitter: m.social.twitter?.trim() || undefined,
              linkedin: m.social.linkedin?.trim() || undefined,
            }
          : undefined,
    }));
  }

  if (input.featuredCatalogIds !== undefined) {
    out.featuredCatalogIds = input.featuredCatalogIds.map((id) => id.trim()).filter(Boolean);
  }

  if (input.catalogProperties !== undefined) {
    out.catalogProperties = input.catalogProperties.map((p) => {
      const imageGallery = p.imageGallery?.map((u) => u.trim()).filter(Boolean);
      return {
        ...p,
        active: p.active === false ? false : undefined,
        slug: p.slug?.trim() || undefined,
        address: p.address?.trim() || undefined,
        status: p.status?.trim() || undefined,
        description: p.description?.trim() || undefined,
        imageSrc: p.imageSrc?.trim() || undefined,
        imageGallery: imageGallery?.length ? imageGallery : undefined,
        tourUrl: p.tourUrl?.trim() || undefined,
        ctaLabel: p.ctaLabel?.trim() || undefined,
        listingType: p.listingType,
        areaM2: p.areaM2,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        priceAmount: p.priceAmount,
        priceCurrency: p.priceCurrency,
        neighborhood: p.neighborhood?.trim() || undefined,
        propertyType: p.propertyType?.trim() || undefined,
        lotAreaM2: p.lotAreaM2,
        gardenM2: p.gardenM2,
        parkingSpots: p.parkingSpots,
        yearBuilt: p.yearBuilt,
        brochureUrl: p.brochureUrl?.trim() || undefined,
      };
    });
  }

  if (input.clientLogos !== undefined) {
    out.clientLogos = input.clientLogos.map((l) => ({
      src: l.src.trim(),
      alt: l.alt.trim(),
    }));
  }

  if (input.downloadablesByLocale !== undefined) {
    const stripDl = (arr: NonNullable<SiteContentFile["downloadablesByLocale"]>["es"] | undefined) =>
      (arr ?? []).map((d) => ({
        ...d,
        fileUrl: d.fileUrl?.trim() || undefined,
        imageSrc: d.imageSrc?.trim() || undefined,
      }));

    out.downloadablesByLocale = {
      ...(input.downloadablesByLocale.es !== undefined ? { es: stripDl(input.downloadablesByLocale.es) } : {}),
      ...(input.downloadablesByLocale.en !== undefined ? { en: stripDl(input.downloadablesByLocale.en) } : {}),
    };
  }

  if (input.homeCopyByLocale != null && typeof input.homeCopyByLocale === "object") {
    const compact = JSON.parse(JSON.stringify(input.homeCopyByLocale)) as unknown;
    if (compact && typeof compact === "object" && Object.keys(compact as object).length > 0) {
      out.homeCopyByLocale = compact as SiteContentFile["homeCopyByLocale"];
    }
  }

  if (input.propertyAdvisorByCatalogId !== undefined) {
    const entries = Object.entries(input.propertyAdvisorByCatalogId).filter(
      ([k, v]) => k.trim().length > 0 && typeof v === "string" && v.trim().length > 0,
    );
    if (entries.length) out.propertyAdvisorByCatalogId = Object.fromEntries(entries);
  }

  if (input.advisorNoWeekendAvailability !== undefined) {
    const ids = [...new Set(input.advisorNoWeekendAvailability.map((x) => x.trim()).filter(Boolean))];
    if (ids.length) out.advisorNoWeekendAvailability = ids;
  }

  return out;
}
