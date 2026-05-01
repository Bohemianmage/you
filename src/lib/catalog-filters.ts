import type { CatalogProperty } from "@/data/catalog-properties";
import { getListingMetrics, getListingPrice } from "@/lib/catalog-metrics";
import type { CatalogQueryFilters } from "@/lib/catalog-query";

export function inferListingType(p: CatalogProperty): "rent" | "sale" | null {
  if (p.listingType === "rent" || p.listingType === "sale") return p.listingType;
  const s = (p.status ?? "").toLowerCase();
  if (s.includes("renta")) return "rent";
  if (s.includes("venta")) return "sale";
  const blob = `${p.title} ${p.specs}`.toLowerCase();
  if (blob.includes("renta")) return "rent";
  if (blob.includes("venta")) return "sale";
  return null;
}

function zonesMatch(catalogZone: string, filterZone: string): boolean {
  return catalogZone.trim().toLowerCase() === filterZone.trim().toLowerCase();
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

export function filterCatalogProperties(list: CatalogProperty[], opts: CatalogQueryFilters): CatalogProperty[] {
  let out = list;

  const zone = opts.zone?.trim();
  if (zone) {
    out = out.filter((p) => zonesMatch(p.zone, zone));
  }

  const tipo = opts.tipo;
  if (tipo === "rent" || tipo === "sale") {
    out = out.filter((p) => inferListingType(p) === tipo);
  }

  const hasM2 = opts.m2Min != null || opts.m2Max != null;
  const hasRec = opts.recMin != null || opts.recMax != null;
  const hasBan = opts.banMin != null || opts.banMax != null;
  const hasPrecio =
    (opts.precioMin != null || opts.precioMax != null) &&
    (opts.moneda === "MXN" || opts.moneda === "USD");

  if (hasM2 || hasRec || hasBan) {
    out = out.filter((p) => {
      const m = getListingMetrics(p);
      if (hasM2 && !inRange(m.m2, opts.m2Min, opts.m2Max)) return false;
      if (hasRec && !inRange(m.beds, opts.recMin, opts.recMax)) return false;
      if (hasBan && !inRange(m.baths, opts.banMin, opts.banMax)) return false;
      return true;
    });
  }

  if (hasPrecio) {
    const moneda = opts.moneda ?? "MXN";
    out = out.filter((p) => {
      const price = getListingPrice(p);
      if (!price || price.currency !== moneda) return false;
      return inRange(price.amount, opts.precioMin, opts.precioMax);
    });
  }

  return out;
}
