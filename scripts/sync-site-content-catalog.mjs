/**
 * Copia `src/data/catalog-seed.json` a `content/site-content.json` → catalogProperties
 * y actualiza featuredCatalogIds (primeras 5 activas).
 */
import fs from "fs";

const sitePath = "content/site-content.json";
const catalogPath = "src/data/catalog-seed.json";

const site = JSON.parse(fs.readFileSync(sitePath, "utf8"));
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

site.catalogProperties = catalog;
site.featuredCatalogIds = catalog.filter((p) => p.active !== false).slice(0, 5).map((p) => p.id);

fs.writeFileSync(sitePath, JSON.stringify(site, null, 2), "utf8");
console.error("Updated", sitePath, "catalog count:", catalog.length, "featured:", site.featuredCatalogIds);
