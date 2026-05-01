import type { FeaturedProperty } from "@/data/properties";
import type { TeamMember } from "@/data/team";
import type { HomeCopy } from "@/i18n/home";
import type { Locale } from "@/i18n/types";
import type { SiteSettingsPayload } from "@/lib/site-settings/types";

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends readonly (infer U)[]
    ? U[]
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P];
};

/** Documento JSON persistido (`content/site-content.json`). */
export type SiteContentFile = SiteSettingsPayload & {
  version?: 1;
  team?: TeamMember[];
  featuredByLocale?: Partial<Record<Locale, FeaturedProperty[]>>;
  /** Textos del home por idioma (se fusionan sobre `HOME_COPY`). */
  homeCopyByLocale?: Partial<Record<Locale, DeepPartial<HomeCopy>>>;
};
