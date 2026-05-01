import type { CatalogProperty } from "@/data/catalog-properties";

export type ParsedPrice = { amount: number; currency: "MXN" | "USD" };

/** Extrae m², recámaras y baños desde texto tipo `240 m² · 3 rec. · 3 baños`. */
export function parseSpecsMetrics(specs: string): { m2?: number; beds?: number; baths?: number } {
  const m2 = specs.match(/(\d+)\s*m²/i);
  const beds = specs.match(/(\d+)\s*rec/i);
  const baths = specs.match(/(\d+)\s*bañ/i);
  return {
    m2: m2 ? Number(m2[1]) : undefined,
    beds: beds ? Number(beds[1]) : undefined,
    baths: baths ? Number(baths[1]) : undefined,
  };
}

function extractPrimaryNumber(s: string): number | undefined {
  const withoutCommas = s.replace(/,/g, "");
  const m = withoutCommas.match(/(\d+(?:\.\d+)?)/);
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : undefined;
}

/** Interpreta montos visibles (`US$ …`, `… MXN`, `$…`). */
export function parsePriceString(price: string): ParsedPrice | undefined {
  const t = price.trim();
  const n = extractPrimaryNumber(t);
  if (n == null) return undefined;
  if (/US\s*\$|USD/i.test(t)) return { amount: n, currency: "USD" };
  if (/MXN/i.test(t)) return { amount: n, currency: "MXN" };
  if (/\$\s*[\d,]+.*USD/i.test(t)) return { amount: n, currency: "USD" };
  return { amount: n, currency: "MXN" };
}

export function getListingMetrics(p: CatalogProperty): { m2?: number; beds?: number; baths?: number } {
  const parsed = parseSpecsMetrics(p.specs);
  return {
    m2: p.areaM2 ?? parsed.m2,
    beds: p.bedrooms ?? parsed.beds,
    baths: p.bathrooms ?? parsed.baths,
  };
}

export function getListingPrice(p: CatalogProperty): ParsedPrice | undefined {
  if (p.priceAmount != null && (p.priceCurrency === "MXN" || p.priceCurrency === "USD")) {
    return { amount: p.priceAmount, currency: p.priceCurrency };
  }
  return parsePriceString(p.price);
}
