/**
 * Agrupa ubicaciones estilo EasyBroker («colonia, ciudad, estado») en una clave estable
 * para filtros del catálogo: por defecto **ciudad + estado** (últimos dos segmentos cuando hay 3+ partes).
 *
 * Ejemplos: `Santa María, Monterrey, Nuevo León` → `Monterrey, Nuevo León`.
 * Con dos partes se conserva la línea completa; con una sola, ese valor.
 */
/** Usa `zoneGroup` persistido o lo deriva de la línea de ubicación. */
export function resolveCatalogZoneGroup(zone: string, zoneGroup?: string): string {
  const g = zoneGroup?.trim();
  if (g) return g;
  return deriveZoneGroup(zone);
}

export function deriveZoneGroup(locationLine: string): string {
  const raw = locationLine.trim();
  if (!raw || raw === "—") return raw || "—";
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= 3) {
    return `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
  }
  if (parts.length === 2) {
    return `${parts[0]}, ${parts[1]}`;
  }
  return parts[0] ?? raw;
}

/**
 * Parte «fina» de la ubicación antes de ciudad+estado: p. ej. `Colonia, Ciudad, Estado` → `Colonia`.
 * Con 4+ segmentos une todo salvo los dos últimos (`A, B, Ciudad, Estado` → `A, B`).
 */
export function extractLocalZonePart(locationLine: string): string | undefined {
  const raw = locationLine.trim();
  if (!raw || raw === "—") return undefined;
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length < 3) return undefined;
  return parts.slice(0, -2).join(", ");
}
