/**
 * Genera `src/app/favicon.ico` (16×16 y 32×32) a partir de un SVG acorde al logo YOU.
 * `npm run generate-favicon`
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import pngToIco from "png-to-ico";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#ffffff"/>
  <text x="32" y="40" text-anchor="middle" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="26" font-weight="700" fill="#2f2e2e">YOU</text>
</svg>`;

const root = path.join(__dirname, "..");
const tmp = path.join(root, ".favicon-tmp");
fs.mkdirSync(tmp, { recursive: true });
const p16 = path.join(tmp, "16.png");
const p32 = path.join(tmp, "32.png");
const buf = Buffer.from(svg);

await sharp(buf).resize(16, 16).png().toFile(p16);
await sharp(buf).resize(32, 32).png().toFile(p32);

const ico = await pngToIco([p16, p32]);
fs.writeFileSync(path.join(root, "src", "app", "favicon.ico"), ico);
fs.rmSync(tmp, { recursive: true, force: true });
console.log("Wrote src/app/favicon.ico");
