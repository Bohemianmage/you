import type { FeaturedProperty } from "@/data/properties";
import type { TeamMember } from "@/data/team";
import type { Locale } from "@/i18n/types";
import type { SiteSettingsPayload } from "@/lib/site-settings/types";

/** Documento JSON persistido (`content/site-content.json`). */
export type SiteContentFile = SiteSettingsPayload & {
  version?: 1;
  team?: TeamMember[];
  featuredByLocale?: Partial<Record<Locale, FeaturedProperty[]>>;
};
