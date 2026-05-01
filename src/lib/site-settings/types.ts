import type { Locale } from "@/i18n/types";

/** Overrides del JSON local (`content/site-content.json`). Campos omitidos = valor por defecto del código. */
export type SiteSettingsPayload = {
  contact?: Partial<{
    addressLine: string;
    phoneDisplay: string;
    phoneHref: string;
    emailDisplay: string;
    emailHref: string;
  }>;
  footerTagline?: Partial<Record<Locale, string>>;
  heroAnnouncement?: Partial<Record<Locale, string>>;
};
