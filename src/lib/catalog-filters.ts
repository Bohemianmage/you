import type { CatalogProperty } from "@/data/catalog-properties";
import { catalogZoneFilterKey } from "@/lib/catalog-zone-filter";
import { getListingMetrics, getListingPrice } from "@/lib/catalog-metrics";
import type { CatalogQueryFilters } from "@/lib/catalog-query";

/** Alineado con EasyBroker: recorre todas las operaciones (no solo la «primaria»). */
export function inferListingTypeFromOperations(ops: readonly { type?: string }[]): "rent" | "sale" | undefined {
  if (!ops.length) return undefined;
  for (const o of ops) {
    const t = String(o.type ?? "").toLowerCase();
    if (t === "sale") return "sale";
  }
  for (const o of ops) {
    const t = String(o.type ?? "").toLowerCase();
    if (t === "rental" || t === "rent" || t === "temporary_rental" || t === "lease" || t === "room_rental") return "rent";
  }
  return undefined;
}

export function inferListingType(p: CatalogProperty): "rent" | "sale" | null {
  if (p.listingType === "rent" || p.listingType === "sale") return p.listingType;
  const fromOps = inferListingTypeFromOperations(p.ebOperations ?? []);
  if (fromOps) return fromOps;
  const s = (p.status ?? "").toLowerCase();
  if (s.includes("renta")) return "rent";
  if (s.includes("venta")) return "sale";
  const blob = `${p.title} ${p.specs}`.toLowerCase();
  if (blob.includes("renta")) return "rent";
  if (blob.includes("venta")) return "sale";
  return null;
}

/** Para fichas/destacadas sin todos los campos del catálogo. */
export function inferListingDisplayType(p: {
  listingType?: "rent" | "sale";
  status?: string;
  title?: string;
  specs?: string;
  ebOperations?: readonly { type?: string }[];
}): "rent" | "sale" | null {
  if (p.listingType === "rent" || p.listingType === "sale") return p.listingType;
  const fromOps = inferListingTypeFromOperations(p.ebOperations ?? []);
  if (fromOps) return fromOps;
  const blob = `${p.status ?? ""} ${p.title ?? ""} ${p.specs ?? ""}`.toLowerCase();
  if (blob.includes("renta")) return "rent";
  if (blob.includes("venta")) return "sale";
  return null;
}

export function normalizeCatalogFeatureKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function flatZoneMatches(p: CatalogProperty, filterZone: string): boolean {
  const f = normalizeCatalogFeatureKey(filterZone);
  const key = normalizeCatalogFeatureKey(catalogZoneFilterKey(p));
  const full = normalizeCatalogFeatureKey(p.zone);
  return key === f || full === f;
}

function propertyFeatureKeys(p: CatalogProperty): Set<string> {
  const set = new Set<string>();
  for (const row of p.ebFeatures ?? []) {
    const k = normalizeCatalogFeatureKey(row.name);
    if (k) set.add(k);
  }
  return set;
}

function inRange(
  value: number | undefined,
  min: number | undefined,
  max: number | undefined,
): boolean {
  if (value == null) return false;
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
}

/** `0` en un mínimo equivale a «sin límite inferior» (evita URLs tipo ?m2Min=0 que vacían el listado). */
function effectiveMin(n: number | undefined): number | undefined {
  if (n == null || n === 0) return undefined;
  return n;
}

export function filterCatalogProperties(list: CatalogProperty[], opts: CatalogQueryFilters): CatalogProperty[] {
  let out = list;

  const zone = opts.zone?.trim();
  if (zone) {
    out = out.filter((p) => flatZoneMatches(p, zone));
  }

  const tipo = opts.tipo;
  if (tipo === "rent" || tipo === "sale") {
    out = out.filter((p) => inferListingType(p) === tipo);
  }

  const wantedFeats = (opts.features ?? []).map(normalizeCatalogFeatureKey).filter(Boolean);
  if (wantedFeats.length) {
    out = out.filter((p) => {
      const have = propertyFeatureKeys(p);
      for (const w of wantedFeats) {
        if (!have.has(w)) return false;
      }
      return true;
    });
  }

  const m2Lo = effectiveMin(opts.m2Min);
  const recLo = effectiveMin(opts.recMin);
  const banLo = effectiveMin(opts.banMin);
  const precioLo = effectiveMin(opts.precioMin);

  const hasM2 = m2Lo != null || opts.m2Max != null;
  const hasRec = recLo != null || opts.recMax != null;
  const hasBan = banLo != null || opts.banMax != null;
  const hasPrecio =
    (precioLo != null || opts.precioMax != null) &&
    (opts.moneda === "MXN" || opts.moneda === "USD");

  if (hasM2 || hasRec || hasBan) {
    out = out.filter((p) => {
      const m = getListingMetrics(p);
      if (hasM2 && m.m2 != null && !inRange(m.m2, m2Lo, opts.m2Max)) return false;
      if (hasRec && m.beds != null && !inRange(m.beds, recLo, opts.recMax)) return false;
      if (hasBan && m.baths != null && !inRange(m.baths, banLo, opts.banMax)) return false;
      return true;
    });
  }

  if (hasPrecio) {
    const moneda = opts.moneda ?? "MXN";
    out = out.filter((p) => {
      const price = getListingPrice(p);
      if (!price || price.currency !== moneda) return false;
      return inRange(price.amount, precioLo, opts.precioMax);
    });
  }

  return out;
}
