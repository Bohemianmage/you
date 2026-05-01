import type { CatalogProperty } from "@/data/catalog-properties";
import { inferListingTypeFromOperations } from "@/lib/catalog-filters";

type EbOperation = {
  type?: string;
  amount?: number;
  currency?: string;
  formatted_amount?: string;
  period?: string;
  unit?: string;
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
  const u = c?.trim().toUpperCase();
  if (u === "MXN" || u === "USD") return u;
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

function videoUrls(raw: Record<string, unknown>): string[] {
  const arr = raw.videos;
  if (!Array.isArray(arr)) return [];
  const out: string[] = [];
  for (const item of arr) {
    if (typeof item === "string" && item.startsWith("http")) out.push(item);
    else {
      const u = str(asRecord(item)?.url);
      if (u?.startsWith("http")) out.push(u);
    }
  }
  return out;
}

function propertyFileUrls(raw: Record<string, unknown>): string[] {
  const arr = raw.property_files;
  if (!Array.isArray(arr)) return [];
  const out: string[] = [];
  for (const item of arr) {
    const o = asRecord(item);
    const u = o ? str(o.url) ?? str(o.file_url) : undefined;
    if (u?.startsWith("http")) out.push(u);
  }
  return out;
}

function ebFeaturesList(raw: Record<string, unknown>): { category: string; name: string }[] {
  const arr = raw.features;
  if (!Array.isArray(arr)) return [];
  const out: { category: string; name: string }[] = [];
  for (const item of arr) {
    if (typeof item === "string") {
      const t = item.trim();
      if (t) out.push({ category: "", name: t });
      continue;
    }
    const o = asRecord(item);
    const name = o ? str(o.name) ?? str(o.title) : undefined;
    if (!name?.trim()) continue;
    const category = (o ? str(o.category) : undefined)?.trim() ?? "";
    out.push({ category, name: name.trim() });
  }
  return out;
}

function tagStrings(raw: Record<string, unknown>): string[] {
  const arr = raw.tags;
  if (!Array.isArray(arr)) return [];
  return arr.map((t) => (typeof t === "string" ? t.trim() : "")).filter(Boolean);
}

function operationFormattedAmount(o: EbOperation): string | undefined {
  const fa = str(o.formatted_amount)?.trim();
  if (fa) return fa;
  if (typeof o.amount === "number" && Number.isFinite(o.amount)) {
    const c = str(o.currency)?.trim();
    return [c, o.amount.toLocaleString("es-MX")].filter(Boolean).join(" ").trim();
  }
  return undefined;
}

function operationsDetail(
  ops: EbOperation[],
): { type: string; formatted_amount: string; period?: string; unit?: string }[] {
  const out: { type: string; formatted_amount: string; period?: string; unit?: string }[] = [];
  for (const o of ops) {
    const type = str(o.type)?.trim();
    const formatted = operationFormattedAmount(o);
    if (!type || !formatted) continue;
    out.push({
      type,
      formatted_amount: formatted,
      period: str(o.period)?.trim(),
      unit: str(o.unit)?.trim(),
    });
  }
  return out;
}

function parseYearBuilt(raw: Record<string, unknown>): number | undefined {
  const a = raw.age;
  if (typeof a === "number" && Number.isFinite(a)) {
    const y = Math.round(a);
    return y >= 1600 && y <= 2100 ? y : undefined;
  }
  const s = str(a)?.trim();
  if (!s) return undefined;
  const n = parseInt(s, 10);
  return Number.isFinite(n) && n >= 1600 && n <= 2100 ? n : undefined;
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
  const listingType = inferListingTypeFromOperations(ops) ?? operationToListingType(primary?.type);
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
  const bathroomsFull = num(raw.bathrooms);
  const half = num(raw.half_bathrooms);
  const bathrooms =
    bathroomsFull != null || half != null ? (bathroomsFull ?? 0) + (half != null ? half * 0.5 : 0) : undefined;

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
  const yearBuilt = parseYearBuilt(raw);

  const specs = buildSpecs({
    propertyType,
    areaM2,
    bedrooms,
    bathrooms,
    lotAreaM2,
    parkingSpots,
  });

  const base: CatalogProperty = {
    id,
    slug: publicId || undefined,
    active: true,
    title,
    price: price || "—",
    specs,
    zone,
    address,
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
    yearBuilt,
  };

  if (mode !== "detail") return base;

  const pdfUrls = propertyFileUrls(raw);
  const ebListingUrl = str(raw.public_url)?.trim();
  const expenses = str(raw.expenses)?.trim();
  const floorsCount = num(raw.floors);
  const floorRaw = raw.floor;
  const floorNumber =
    typeof floorRaw === "number" && Number.isFinite(floorRaw)
      ? String(Math.round(floorRaw))
      : str(floorRaw)?.trim();
  const lotLengthM = num(raw.lot_length);
  const lotWidthM = num(raw.lot_width);
  const ebFeatures = ebFeaturesList(raw);
  const tagLabels = tagStrings(raw);
  const videoUrlsList = videoUrls(raw);
  const collaborationNotes = str(raw.collaboration_notes)?.trim();
  const agentRec = asRecord(raw.agent);
  const agentName = agentRec ? str(agentRec.full_name)?.trim() || str(agentRec.name)?.trim() : undefined;
  const agentEmail = agentRec ? str(agentRec.email)?.trim() : undefined;

  const opDetail = operationsDetail(ops);
  const foreclosure = raw.foreclosure === true;
  const exclusive = raw.exclusive === true;

  return {
    ...base,
    ebOperations: opDetail.length ? opDetail : undefined,
    ebListingUrl: ebListingUrl || undefined,
    expenses: expenses || undefined,
    floorsCount: floorsCount != null ? Math.round(floorsCount) : undefined,
    floorNumber: floorNumber || undefined,
    lotLengthM,
    lotWidthM,
    ebFeatures: ebFeatures.length ? ebFeatures : undefined,
    tagLabels: tagLabels.length ? tagLabels : undefined,
    videoUrls: videoUrlsList.length ? videoUrlsList : undefined,
    brochureUrls: pdfUrls.length > 1 ? pdfUrls.slice(1) : undefined,
    brochureUrl: pdfUrls[0],
    collaborationNotes: collaborationNotes || undefined,
    agentName: agentName || undefined,
    agentEmail: agentEmail || undefined,
    foreclosure: foreclosure || undefined,
    exclusive: exclusive || undefined,
    bathroomsFull,
    halfBathrooms: half != null && half > 0 ? Math.round(half) : undefined,
  };
}
