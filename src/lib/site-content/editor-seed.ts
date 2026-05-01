import type { CatalogProperty } from "@/data/catalog-properties";
import type { DownloadableItem } from "@/data/downloadables";
import type { TeamMember } from "@/data/team";

/** Estado inicial del editor admin (serializable al cliente). */
export type AdminEditorSeed = {
  team: TeamMember[];
  /** Orden de IDs del catálogo en la franja de destacados del inicio. */
  featuredCatalogIds: string[];
  /** ID catálogo EB → ID persona equipo (citas). */
  propertyAdvisorByCatalogId: Record<string, string>;
  /** Asesores sin huecos sáb/dom (solo lun–vie). */
  advisorNoWeekendAvailability: string[];
  catalog: CatalogProperty[];
  downloadablesEs: DownloadableItem[];
  downloadablesEn: DownloadableItem[];
};
