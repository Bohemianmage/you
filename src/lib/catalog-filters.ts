import type { CatalogProperty } from "@/data/catalog-properties";

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

export function filterCatalogProperties(
  list: CatalogProperty[],
  opts: { zone?: string | null; tipo?: string | null },
): CatalogProperty[] {
  let out = list;
  const zone = opts.zone?.trim();
  if (zone) {
    out = out.filter((p) => zonesMatch(p.zone, zone));
  }
  const tipo = opts.tipo;
  if (tipo === "rent" || tipo === "sale") {
    out = out.filter((p) => inferListingType(p) === tipo);
  }
  return out;
}
