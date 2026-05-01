import type { CatalogProperty } from "@/data/catalog-properties";
import { extractLocalZonePart } from "@/lib/catalog-zone-group";

/**
 * Clave estable para filtrar por «zona» sin agrupar ciudad+estado:
 * colonia / tramo local si existe; si no, la línea completa de ubicación.
 */
export function catalogZoneFilterKey(property: CatalogProperty): string {
  const local = extractLocalZonePart(property.zone)?.trim();
  if (local) return local;
  return property.zone.trim() || "—";
}

export function distinctCatalogZoneFilterKeys(catalog: readonly CatalogProperty[], locale: string): string[] {
  const set = new Set<string>();
  for (const p of catalog) {
    const k = catalogZoneFilterKey(p);
    if (k && k !== "—") set.add(k);
  }
  const collator = locale === "en" ? "en" : "es";
  return [...set].sort((a, b) => a.localeCompare(b, collator));
}
