import type { CatalogProperty } from "@/data/catalog-properties";
import type { DownloadableItem } from "@/data/downloadables";
import type { TeamMember } from "@/data/team";
import type { HomeCopy } from "@/i18n/home";
import type { Locale } from "@/i18n/types";
import type { SiteSettingsPayload } from "@/lib/site-settings/types";

/** Logos de clientes — editable vía `content/site-content.json` (`clientLogos`). */
export type ClientLogo = { src: string; alt: string };

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
  /** Orden de IDs del catálogo mostrados como destacados en el inicio (mismo orden para todos los idiomas). */
  featuredCatalogIds?: string[];
  /** Catálogo `/propiedades` y fichas detalle. */
  catalogProperties?: CatalogProperty[];
  /** Logos en bloque “Clientes” (sobre nosotros). */
  clientLogos?: ClientLogo[];
  downloadablesByLocale?: Partial<Record<Locale, DownloadableItem[]>>;
  /** Textos del home por idioma (se fusionan sobre `HOME_COPY`). */
  homeCopyByLocale?: Partial<Record<Locale, DeepPartial<HomeCopy>>>;
  /**
   * ID de catálogo EasyBroker → ID de miembro del equipo (asesor) para citas y recordatorios.
   * Si falta entrada, la ficha puede seguir ofreciendo agenda con horarios del equipo (unión) hasta confirmar en admin.
   */
  propertyAdvisorByCatalogId?: Record<string, string>;
  /**
   * IDs de miembros del equipo que no ofrecen citas en sábado ni domingo (solo entre semana).
   */
  advisorNoWeekendAvailability?: string[];
};
