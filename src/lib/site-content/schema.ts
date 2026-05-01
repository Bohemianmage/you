import { z } from "zod";

import type { SiteContentFile } from "./types";

const teamMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.object({
    es: z.string(),
    en: z.string(),
  }),
  imageSrc: z.string().optional(),
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
  address: z.string().optional(),
  status: z.string().optional(),
  description: z.string().optional(),
  imageSrc: z.string().optional(),
  tourUrl: z.string().optional(),
  ctaLabel: z.string().optional(),
  listingType: z.enum(["rent", "sale"]).optional(),
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

const featuredPropertySchema = z.object({
  id: z.string().min(1),
  slug: z.string().optional(),
  title: z.string().min(1),
  price: z.string().min(1),
  address: z.string().min(1),
  status: z.string().min(1),
  ctaLabel: z.string().min(1),
  description: z.string().optional(),
  tourUrl: z.string().optional(),
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
    featuredByLocale: z
      .object({
        es: z.array(featuredPropertySchema).optional(),
        en: z.array(featuredPropertySchema).optional(),
      })
      .optional(),
    catalogProperties: z.array(catalogPropertySchema).optional(),
    clientLogos: z.array(clientLogoSchema).optional(),
    downloadablesByLocale: z
      .object({
        es: z.array(downloadableItemSchema).optional(),
        en: z.array(downloadableItemSchema).optional(),
      })
      .optional(),
    homeCopyByLocale: z.any().optional(),
  })
  .strict();

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
  } else if (input.featuredByLocale !== undefined) {
    const stripFeatured = (arr: NonNullable<SiteContentFile["featuredByLocale"]>["es"] | undefined) =>
      (arr ?? []).map((p) => ({
        ...p,
        slug: p.slug?.trim() || undefined,
        description: p.description?.trim() || undefined,
        tourUrl: p.tourUrl?.trim() || undefined,
        imageSrc: p.imageSrc?.trim() || undefined,
      }));

    out.featuredByLocale = {
      ...(input.featuredByLocale.es !== undefined ? { es: stripFeatured(input.featuredByLocale.es) } : {}),
      ...(input.featuredByLocale.en !== undefined ? { en: stripFeatured(input.featuredByLocale.en) } : {}),
    };
  }

  if (input.catalogProperties !== undefined) {
    out.catalogProperties = input.catalogProperties.map((p) => ({
      ...p,
      active: p.active === false ? false : undefined,
      slug: p.slug?.trim() || undefined,
      address: p.address?.trim() || undefined,
      status: p.status?.trim() || undefined,
      description: p.description?.trim() || undefined,
      imageSrc: p.imageSrc?.trim() || undefined,
      tourUrl: p.tourUrl?.trim() || undefined,
      ctaLabel: p.ctaLabel?.trim() || undefined,
      listingType: p.listingType,
    }));
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

  return out;
}
