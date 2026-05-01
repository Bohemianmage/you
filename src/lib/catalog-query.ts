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

function parseNonNegNumber(v: string | undefined): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Lee query string de Next (`searchParams`) hacia estado de filtros. */
export function parseCatalogFiltersFromSearchParams(params: {
  zone?: string;
  tipo?: string;
  m2Min?: string;
  m2Max?: string;
  recMin?: string;
  recMax?: string;
  banMin?: string;
  banMax?: string;
  precioMin?: string;
  precioMax?: string;
  moneda?: string;
}): CatalogQueryFilters {
  const tipo = params.tipo === "rent" || params.tipo === "sale" ? params.tipo : "";
  const moneda = params.moneda === "USD" || params.moneda === "MXN" ? params.moneda : undefined;
  const precioMin = parseNonNegNumber(params.precioMin);
  const precioMax = parseNonNegNumber(params.precioMax);
  const wantsPrice = precioMin != null || precioMax != null;
  return {
    zone: params.zone?.trim() || undefined,
    tipo,
    m2Min: parseNonNegNumber(params.m2Min),
    m2Max: parseNonNegNumber(params.m2Max),
    recMin: parseNonNegNumber(params.recMin),
    recMax: parseNonNegNumber(params.recMax),
    banMin: parseNonNegNumber(params.banMin),
    banMax: parseNonNegNumber(params.banMax),
    precioMin: wantsPrice ? precioMin : undefined,
    precioMax: wantsPrice ? precioMax : undefined,
    moneda: wantsPrice ? moneda : undefined,
  };
}
