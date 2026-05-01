import fs from "fs";

const h = fs.readFileSync("scripts/listings-page.html", "utf8");
const chunks = h.split('role="listitem"').slice(1);

function stripTags(s) {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function pickImg(chunk) {
  const all = [...chunk.matchAll(/src="(https:\/\/[^"]+\.(?:jpe?g|png|webp)[^"]*)/gi)].map((x) => x[1]);
  const real = all.find((u) => !u.includes("Image-empty-state"));
  return real ?? all[0];
}

const rows = [];
for (const ch of chunks) {
  const titleM = ch.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  if (!titleM) continue;
  const title = stripTags(titleM[1]);
  if (title.length < 12 || /investment in M/i.test(title)) continue;

  let price = "";
  const pr =
    ch.match(/US\$\s*([\d,]+\.?\d*)/i) ||
    ch.match(/\$\s*([\d,]+\.?\d*)\s*USD/i) ||
    ch.match(/\$\s*([\d,]+\.?\d*)/);
  if (pr) {
    price = pr[0].includes("US") ? `US$ ${pr[1]}`.replace(/\$\s*/, "$") : `$${pr[1].replace(/^/, "").trim()}`;
    if (!price.includes("US") && /\$\s*[\d,]+\.?\d*\s*USD/i.test(ch)) price = `$${pr[1]} USD`;
  }

  const plain = stripTags(ch);
  const bedsM = plain.match(/Rec\.\s*(\d+)/i) ?? plain.match(/Rec\s+(\d+)/i);
  const bathM = plain.match(/Baños\s*(\d+\.?\d*)/i);
  const sizeM = plain.match(/Tamaño\s*([\d,.]+)\s*m/i);

  const statM = ch.match(/Disponible|VENDIDA|Vendida/i);
  const status = statM ? (statM[0].toUpperCase().includes("VEND") ? "Vendida" : "Disponible") : "Disponible";

  const beds = bedsM ? Number(bedsM[1]) : undefined;
  const baths = bathM ? Number(bathM[1]) : undefined;
  const area = sizeM ? Number(String(sizeM[1]).replace(/,/g, "")) : undefined;

  rows.push({
    title,
    priceRaw: price,
    beds,
    baths,
    area,
    status,
    imageSrc: pickImg(ch),
  });
}

console.log(JSON.stringify(rows.slice(0, 3), null, 2));
console.error("total rows", rows.length);
