import type { CatalogProperty } from "@/data/catalog-properties";
import type { DownloadableItem } from "@/data/downloadables";
import type { TeamMember } from "@/data/team";

/** Estado inicial del editor admin (serializable al cliente). */
export type AdminEditorSeed = {
  team: TeamMember[];
  /** Orden de IDs del catálogo en la franja de destacados del inicio. */
  featuredCatalogIds: string[];
  catalog: CatalogProperty[];
  downloadablesEs: DownloadableItem[];
  downloadablesEn: DownloadableItem[];
};
