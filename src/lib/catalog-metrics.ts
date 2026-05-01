import type { CatalogProperty } from "@/data/catalog-properties";

export type ParsedPrice = { amount: number; currency: "MXN" | "USD" };

/** Extrae m², recámaras y baños desde texto tipo `240 m² · 3 rec. · 3 baños`. */
export function parseSpecsMetrics(specs: string): { m2?: number; beds?: number; baths?: number } {
  let m2: number | undefined;
  for (const re of [/(\d+)\s*m²/i, /(\d+)\s*m2/i, /(\d+)m²/i, /(\d+)m2/i]) {
    const hit = specs.match(re);
    if (hit?.[1]) {
      const n = Number(hit[1]);
      if (Number.isFinite(n)) {
        m2 = n;
        break;
      }
    }
  }
  const beds = specs.match(/(\d+)\s*rec/i);
  const baths = specs.match(/(\d+(?:\.\d+)?)\s*bañ/i);
  return {
    m2,
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

/** Interpreta montos visibles (`US$ …`, `… MXN`, `$…` pesos mexicanos). */
export function parsePriceString(price: string): ParsedPrice | undefined {
  const t = price.trim();
  const n = extractPrimaryNumber(t);
  if (n == null) return undefined;
  if (/US\s*\$|USD|US\s*D/i.test(t)) return { amount: n, currency: "USD" };
  if (/MXN|MX\s*\$|pesos?\s*mex/i.test(t)) return { amount: n, currency: "MXN" };
  if (/^\s*\$\s*[\d,.]+/i.test(t) && !/US|USD/i.test(t)) return { amount: n, currency: "MXN" };
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
  if (p.priceAmount != null && p.priceCurrency == null) {
    const parsed = parsePriceString(p.price);
    const currency = parsed?.currency ?? "MXN";
    return { amount: p.priceAmount, currency };
  }
  return parsePriceString(p.price);
}
