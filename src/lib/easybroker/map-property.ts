import type { CatalogProperty } from "@/data/catalog-properties";

type EbOperation = {
  type?: string;
  amount?: number;
  currency?: string;
  formatted_amount?: string;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v != null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return undefined;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function ebOperations(raw: Record<string, unknown>): EbOperation[] {
  const ops = raw.operations;
  if (!Array.isArray(ops)) return [];
  return ops.filter((o): o is EbOperation => o != null && typeof o === "object");
}

/** Prioriza venta; si no hay, renta. */
function pickPrimaryOperation(ops: EbOperation[]): EbOperation | undefined {
  if (!ops.length) return undefined;
  const sale = ops.find((o) => o.type === "sale");
  if (sale) return sale;
  const rental = ops.find((o) => o.type === "rental" || o.type === "rent");
  if (rental) return rental;
  return ops[0];
}

function operationToListingType(type: string | undefined): "rent" | "sale" | undefined {
  if (type === "sale") return "sale";
  if (type === "rental" || type === "rent" || type === "temporary_rental") return "rent";
  return undefined;
}

function currencyToCatalog(c: string | undefined): "MXN" | "USD" | undefined {
  if (c === "MXN" || c === "USD") return c;
  return undefined;
}

function joinLocation(loc: Record<string, unknown>): string {
  const name = str(loc.name);
  if (name) return name;
  const parts = [str(loc.city_area), str(loc.city), str(loc.region)].filter(Boolean) as string[];
  return parts.join(", ");
}

function streetAddress(loc: Record<string, unknown>): string | undefined {
  const street = str(loc.street);
  const ext = str(loc.exterior_number);
  const interior = str(loc.interior_number);
  const postal = str(loc.postal_code);
  const base = [street, ext ? `#${ext}` : "", interior ? `Int. ${interior}` : ""].filter(Boolean).join(" ").trim();
  const area = joinLocation(loc);
  const combined = [base || undefined, area].filter(Boolean).join(" · ");
  return combined.trim() || undefined;
}

function imageUrls(raw: Record<string, unknown>): string[] {
  const from = (key: string): string[] => {
    const arr = raw[key];
    if (!Array.isArray(arr)) return [];
    const urls: string[] = [];
    for (const item of arr) {
      const o = asRecord(item);
      const u = o ? str(o.url) : undefined;
      if (u?.startsWith("http")) urls.push(u);
    }
    return urls;
  };
  const a = from("property_images");
  if (a.length) return a;
  return from("images");
}

function buildSpecs(p: {
  propertyType?: string;
  areaM2?: number;
  bedrooms?: number;
  bathrooms?: number;
  lotAreaM2?: number;
  parkingSpots?: number;
}): string {
  const parts: string[] = [];
  if (p.propertyType?.trim()) parts.push(p.propertyType.trim());
  if (p.areaM2 != null) parts.push(`${p.areaM2} m²`);
  if (p.bedrooms != null) parts.push(`${p.bedrooms} rec`);
  if (p.bathrooms != null) parts.push(`${p.bathrooms} baños`);
  if (p.lotAreaM2 != null) parts.push(`Terreno ${p.lotAreaM2} m²`);
  if (p.parkingSpots != null) parts.push(`${p.parkingSpots} estac.`);
  return parts.length ? parts.join(" · ") : "—";
}

/**
 * Convierte respuesta de listado o detalle `/v1/properties` al modelo del sitio.
 */
export function mapEasyBrokerPropertyToCatalog(raw: Record<string, unknown>, mode: "list" | "detail"): CatalogProperty {
  const publicId = str(raw.public_id)?.trim() ?? "";
  const internalId = str(raw.internal_id)?.trim();
  const id = publicId || internalId || "unknown";

  const ops = ebOperations(raw);
  const primary = pickPrimaryOperation(ops);
  const listingType = operationToListingType(primary?.type);
  const priceCurrency = currencyToCatalog(primary?.currency);
  const priceAmount = typeof primary?.amount === "number" && Number.isFinite(primary.amount) ? primary.amount : undefined;
  const price =
    str(primary?.formatted_amount)?.trim() ||
    (priceAmount != null ? `${priceCurrency ?? ""} ${priceAmount}`.trim() : "");

  const locObj = asRecord(raw.location);
  const zone =
    mode === "list"
      ? str(raw.location)?.trim() || (locObj ? joinLocation(locObj) : "") || "—"
      : locObj
        ? joinLocation(locObj)
        : "—";

  const address =
    mode === "detail" && locObj ? streetAddress(locObj) ?? (zone !== "—" ? zone : undefined) : zone !== "—" ? zone : undefined;

  const bedrooms = num(raw.bedrooms);
  const bathroomsRaw = num(raw.bathrooms);
  const half = num(raw.half_bathrooms);
  const bathrooms =
    bathroomsRaw != null || half != null ? (bathroomsRaw ?? 0) + (half != null ? half * 0.5 : 0) : undefined;

  const areaM2 = num(raw.construction_size);
  const lotAreaM2 = num(raw.lot_size);
  const parkingSpots = num(raw.parking_spaces);

  const title = str(raw.title)?.trim() || id;
  const description = str(raw.description)?.trim();
  const propertyType = str(raw.property_type)?.trim();

  const gallery = imageUrls(raw);
  const titleFull = str(raw.title_image_full)?.trim();
  const imageSrc = gallery[0] ?? titleFull;

  const tourUrl = str(raw.virtual_tour)?.trim();
  const age = str(raw.age)?.trim();
  const yearBuilt = age ? parseInt(age, 10) : undefined;

  const specs = buildSpecs({
    propertyType,
    areaM2,
    bedrooms,
    bathrooms,
    lotAreaM2,
    parkingSpots,
  });

  return {
    id,
    slug: publicId || undefined,
    active: true,
    title,
    price: price || "—",
    specs,
    zone,
    address,
    status: "published",
    listingType,
    areaM2,
    bedrooms,
    bathrooms,
    priceAmount,
    priceCurrency,
    description,
    imageSrc,
    imageGallery: gallery.length > 1 ? gallery : gallery.length === 1 ? gallery : undefined,
    tourUrl: tourUrl || undefined,
    neighborhood: locObj ? str(locObj.city_area) ?? str(locObj.city) : undefined,
    propertyType,
    lotAreaM2,
    parkingSpots,
    yearBuilt: yearBuilt != null && Number.isFinite(yearBuilt) ? yearBuilt : undefined,
  };
}
