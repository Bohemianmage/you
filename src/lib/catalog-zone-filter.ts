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

/** Orden sectorial CDMX — solo se muestran las que existan en inventario (landing). */
export const LANDING_INDUSTRY_ZONE_PRIORITY: readonly string[] = [
  "Polanco",
  "Santa Fe",
  "Condesa",
  "Roma",
  "Lomas de Chapultepec",
];

function normZoneLabel(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/**
 * Hasta `max` zonas del landing: prioridad sectorial, restringidas a claves presentes en catálogo.
 */
export function distinctLandingCatalogZones(
  catalog: readonly CatalogProperty[],
  locale: string,
  max = 5,
): string[] {
  const keys = distinctCatalogZoneFilterKeys(catalog, locale);
  const used = new Set<string>();
  const out: string[] = [];

  for (const needle of LANDING_INDUSTRY_ZONE_PRIORITY) {
    if (out.length >= max) break;
    const nn = normZoneLabel(needle);
    const exact = keys.find((k) => !used.has(k) && normZoneLabel(k) === nn);
    if (exact) {
      used.add(exact);
      out.push(exact);
      continue;
    }
    const fuzzy = keys.find(
      (k) =>
        !used.has(k) &&
        (normZoneLabel(k).includes(nn) || nn.includes(normZoneLabel(k))),
    );
    if (fuzzy) {
      used.add(fuzzy);
      out.push(fuzzy);
    }
  }

  return out;
}
