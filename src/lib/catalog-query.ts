import type { Locale } from "@/i18n/types";

export type ListingTypeFilter = "" | "rent" | "sale";

/** Estado de filtros del listado (URL ↔ UI). */
export type CatalogQueryFilters = {
  zone?: string;
  tipo?: ListingTypeFilter;
  m2Min?: number;
  m2Max?: number;
  recMin?: number;
  recMax?: number;
  banMin?: number;
  banMax?: number;
  precioMin?: number;
  precioMax?: number;
  moneda?: "MXN" | "USD";
};

function appendNumericParams(params: URLSearchParams, f: CatalogQueryFilters): void {
  if (f.m2Min != null) params.set("m2Min", String(f.m2Min));
  if (f.m2Max != null) params.set("m2Max", String(f.m2Max));
  if (f.recMin != null) params.set("recMin", String(f.recMin));
  if (f.recMax != null) params.set("recMax", String(f.recMax));
  if (f.banMin != null) params.set("banMin", String(f.banMin));
  if (f.banMax != null) params.set("banMax", String(f.banMax));
  if (f.precioMin != null) params.set("precioMin", String(f.precioMin));
  if (f.precioMax != null) params.set("precioMax", String(f.precioMax));
  if (f.moneda === "MXN" || f.moneda === "USD") params.set("moneda", f.moneda);
}

/** URL de `/propiedades` con locale y filtros opcionales. */
export function catalogPageHref(locale: Locale, filters: CatalogQueryFilters): string {
  const params = new URLSearchParams();
  if (locale === "en") params.set("lang", "en");
  const z = filters.zone?.trim();
  if (z) params.set("zone", z);
  if (filters.tipo === "rent" || filters.tipo === "sale") params.set("tipo", filters.tipo);
  appendNumericParams(params, filters);
  const q = params.toString();
  return `/propiedades${q ? `?${q}` : ""}`;
}

function spFirst(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  const s = Array.isArray(v) ? v[0] : v;
  return typeof s === "string" ? s : undefined;
}

function parseNonNegNumber(v: string | undefined): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Lee query string de Next (`searchParams`) hacia estado de filtros. */
export function parseCatalogFiltersFromSearchParams(params: {
  zone?: string | string[];
  tipo?: string | string[];
  m2Min?: string | string[];
  m2Max?: string | string[];
  recMin?: string | string[];
  recMax?: string | string[];
  banMin?: string | string[];
  banMax?: string | string[];
  precioMin?: string | string[];
  precioMax?: string | string[];
  moneda?: string | string[];
}): CatalogQueryFilters {
  const tipoRaw = spFirst(params.tipo);
  const tipo = tipoRaw === "rent" || tipoRaw === "sale" ? tipoRaw : "";
  const monedaRaw = spFirst(params.moneda);
  const moneda = monedaRaw === "USD" || monedaRaw === "MXN" ? monedaRaw : undefined;
  const precioMinRaw = parseNonNegNumber(spFirst(params.precioMin));
  const precioMaxRaw = parseNonNegNumber(spFirst(params.precioMax));
  /** `precioMin=0` no debe activar el filtro de precio (equivale a sin mínimo). */
  const precioMin = precioMinRaw === 0 ? undefined : precioMinRaw;
  const wantsPrice = precioMin != null || precioMaxRaw != null;
  const zone = spFirst(params.zone)?.trim();
  return {
    zone: zone || undefined,
    tipo,
    m2Min: parseNonNegNumber(spFirst(params.m2Min)),
    m2Max: parseNonNegNumber(spFirst(params.m2Max)),
    recMin: parseNonNegNumber(spFirst(params.recMin)),
    recMax: parseNonNegNumber(spFirst(params.recMax)),
    banMin: parseNonNegNumber(spFirst(params.banMin)),
    banMax: parseNonNegNumber(spFirst(params.banMax)),
    precioMin: wantsPrice ? precioMin : undefined,
    precioMax: wantsPrice ? precioMaxRaw : undefined,
    moneda: wantsPrice ? moneda : undefined,
  };
}
