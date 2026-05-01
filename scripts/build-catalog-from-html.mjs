/**
 * @deprecated El catálogo sale de EasyBroker (`EASYBROKER_API_KEY`). Este extractor ya no alimenta el sitio.
 * Lee `scripts/listings-page.html` y podría escribir `catalog-seed.json` solo como utilidad legacy.
 */
import fs from "fs";

const h = fs.readFileSync("scripts/listings-page.html", "utf8");
const chunks = h.split('role="listitem"').slice(1);

function stripTags(s) {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&ntilde;/gi, "ñ")
    .replace(/&aacute;/gi, "á")
    .replace(/&eacute;/gi, "é")
    .replace(/&iacute;/gi, "í")
    .replace(/&oacute;/gi, "ó")
    .replace(/&uacute;/gi, "ú")
    .replace(/&uuml;/gi, "ü")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function zoneFromTitle(title) {
  let t = title.replace(/\s+/g, " ").trim();
  const lower = t.toLowerCase();
  const idx = lower.lastIndexOf(" en ");
  if (idx >= 0) {
    const tail = t.slice(idx + 4).trim();
    if (tail.length > 2 && !/^venta\b/i.test(tail)) return tail.replace(/\.$/, "");
  }
  if (/interlomas/i.test(t)) return "Interlomas";
  if (/polanco/i.test(t)) return "Polanco";
  if (/santa fe/i.test(t)) return "Santa Fe";
  if (/bosque real/i.test(t)) return "Bosque Real";
  return "CDMX";
}

function slugify(s) {
  const base = s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
  return base || "propiedad";
}

/** Miniaturas como URLs absolutas en el HTML exportado (cualquier host con ruta típica `/media/…`). */
function pickImg(chunk) {
  const bare = [
    ...chunk.matchAll(
      /https:\/\/[a-z0-9.-]+\/media\/[a-z0-9_]{6,}_[a-z0-9]{10,}[^"'\\\s]*?\.(?:jpe?g|png|webp)/gi,
    ),
  ].map((m) => m[0]);
  const clean = bare.filter((u) => !u.includes("Image-empty-state"));
  return clean[0];
}

function parsePrice(raw, plainChunk) {
  const hasUsdLabel = /USD|US\$/i.test(plainChunk);
  let currency = "MXN";
  let display = raw;

  const usMatch = plainChunk.match(/US\$\s*([\d,.]+)/i);
  const mxMatch = plainChunk.match(/\$\s*([\d,.]+(?:\.\d{2})?)/);

  if (usMatch && (!mxMatch || plainChunk.indexOf("US$") < plainChunk.indexOf("$"))) {
    currency = "USD";
    display = `US$ ${usMatch[1]}`;
  } else if (/\$\s*[\d,.]+\s*USD/i.test(plainChunk)) {
    currency = "USD";
    const m = plainChunk.match(/\$\s*([\d,.]+(?:\.\d{2})?)\s*USD/i);
    if (m) display = `$${m[1]} USD`;
  } else if (mxMatch) {
    display = `$${mxMatch[1]}`;
  }

  const numPart = display.replace(/[^\d.]/g, "").replace(/^/, "");
  const amount = Number(numPart.replace(/\.(?=\d{3})/g, "").replace(/,(?=\d{3})/g, "").replace(/,/g, ""));
  return { display: display.trim(), currency, amount: Number.isFinite(amount) ? amount : undefined };
}

const rawRows = [];
for (const ch of chunks) {
  const titleM = ch.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  if (!titleM) continue;
  const title = stripTags(titleM[1]);
  if (title.length < 12 || /investment in M/i.test(title)) continue;

  const plain = stripTags(ch);
  const priceLine =
    plain.match(/US\$\s*[\d,.]+/)?.[0] ??
    plain.match(/\$\s*[\d,.]+(?:\.\d{2})?\s*USD/i)?.[0] ??
    plain.match(/\$\s*[\d,.]+(?:\.\d{2})?/)?.[0] ??
    "";

  const { display: price, currency, amount } = parsePrice(priceLine, plain);

  const bedsM = plain.match(/Rec\.\s*(\d+)/i);
  const bathM = plain.match(/Baños\s*(\d+\.?\d*)/i);
  const sizeM = plain.match(/Tamaño\s*([\d,.]+)\s*m\s*[²2]?/i);

  const beds = bedsM ? Number(bedsM[1]) : undefined;
  const baths = bathM ? Number(bathM[1]) : undefined;
  const areaM2 = sizeM ? Number(String(sizeM[1]).replace(/,/g, "")) : undefined;

  let status = "Disponible";
  if (/VENDIDA/i.test(plain)) status = "Vendida";

  const zone = zoneFromTitle(title);
  const specsParts = [];
  if (areaM2 != null) specsParts.push(`${areaM2} m²`);
  if (beds != null) specsParts.push(`${beds} rec.`);
  if (baths != null) specsParts.push(`${baths} baños`);
  const specs = specsParts.join(" · ") || "Consultar detalle";

  rawRows.push({
    title,
    price,
    specs,
    zone,
    status,
    listingType: "sale",
    areaM2,
    bedrooms: beds,
    bathrooms: baths,
    priceAmount: amount,
    priceCurrency: currency,
    active: status !== "Vendida",
    imageSrc: pickImg(ch),
    description:
      "Resumen del listado público YOU. Para disponibilidad actual y visitas, contactá a un asesor.",
  });
}

const slugCount = new Map();
const catalog = rawRows.map((r) => {
  let slug = slugify(r.title);
  const n = (slugCount.get(slug) ?? 0) + 1;
  slugCount.set(slug, n);
  if (n > 1) slug = `${slug}-${n}`;
  const id = slug;
  const address = r.zone;
  return {
    id,
    slug,
    active: r.active,
    title: r.title,
    price: r.price,
    specs: r.specs,
    zone: r.zone,
    address,
    status: r.status === "Vendida" ? "Vendida" : "En venta",
    listingType: "sale",
    areaM2: r.areaM2,
    bedrooms: r.bedrooms,
    bathrooms: r.bathrooms,
    priceAmount: r.priceAmount,
    priceCurrency: r.priceCurrency,
    description: r.description,
    imageSrc: r.imageSrc,
  };
});

const outPath = "src/data/catalog-seed.json";
fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2), "utf8");
console.error("Wrote", catalog.length, "properties to", outPath);
