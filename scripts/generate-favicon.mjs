/**
 * Genera `src/app/favicon.ico` y recursos relacionados a partir de `public/favicon-source.svg`.
 * `npm run generate-favicon`
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import pngToIco from "png-to-ico";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const svgPath = path.join(root, "public", "favicon-source.svg");

if (!fs.existsSync(svgPath)) {
  console.error("Missing public/favicon-source.svg — add the YOU mark SVG there.");
  process.exit(1);
}

const svgBuf = fs.readFileSync(svgPath);
const tmp = path.join(root, ".favicon-tmp");
fs.mkdirSync(tmp, { recursive: true });
const p16 = path.join(tmp, "16.png");
const p32 = path.join(tmp, "32.png");
const appleOut = path.join(root, "public", "apple-touch-icon.png");

await sharp(svgBuf).resize(16, 16).png().toFile(p16);
await sharp(svgBuf).resize(32, 32).png().toFile(p32);
await sharp(svgBuf).resize(180, 180).png().toFile(appleOut);

const ico = await pngToIco([p16, p32]);
fs.writeFileSync(path.join(root, "src", "app", "favicon.ico"), ico);
fs.rmSync(tmp, { recursive: true, force: true });

fs.copyFileSync(svgPath, path.join(root, "public", "favicon.svg"));

console.log("Wrote src/app/favicon.ico, public/apple-touch-icon.png, public/favicon.svg");
