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

const featuredPropertySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  price: z.string().min(1),
  address: z.string().min(1),
  status: z.string().min(1),
  ctaLabel: z.string().min(1),
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
    featuredByLocale: z
      .object({
        es: z.array(featuredPropertySchema).optional(),
        en: z.array(featuredPropertySchema).optional(),
      })
      .optional(),
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

  if (input.featuredByLocale !== undefined) {
    const stripFeatured = (arr: NonNullable<SiteContentFile["featuredByLocale"]>["es"] | undefined) =>
      (arr ?? []).map((p) => ({
        ...p,
        tourUrl: p.tourUrl?.trim() || undefined,
        imageSrc: p.imageSrc?.trim() || undefined,
      }));

    out.featuredByLocale = {
      ...(input.featuredByLocale.es !== undefined ? { es: stripFeatured(input.featuredByLocale.es) } : {}),
      ...(input.featuredByLocale.en !== undefined ? { en: stripFeatured(input.featuredByLocale.en) } : {}),
    };
  }

  return out;
}
