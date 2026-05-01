/**
 * Comprime el MP4 del hero para web (H.264, sin audio, faststart).
 * Uso: node scripts/compress-hero-video.mjs
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ffmpegPath from "ffmpeg-static";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const input = path.join(root, "public", "videos", "hero-mexico-city.mp4");
const tmpOut = path.join(root, "public", "videos", "hero-mexico-city.tmp.mp4");

if (!ffmpegPath) {
  console.error("ffmpeg-static: binario no disponible en esta plataforma.");
  process.exit(1);
}

if (!fs.existsSync(input)) {
  console.error("No existe:", input);
  process.exit(1);
}

const before = fs.statSync(input).size;
console.log("Entrada:", input, `(${(before / 1e6).toFixed(2)} MB)`);

const args = [
  "-y",
  "-i",
  input,
  "-an",
  "-vf",
  "scale='min(1920,iw)':-2",
  "-c:v",
  "libx264",
  "-preset",
  "medium",
  "-crf",
  "26",
  "-pix_fmt",
  "yuv420p",
  "-movflags",
  "+faststart",
  tmpOut,
];

const run = spawnSync(ffmpegPath, args, { stdio: "inherit", encoding: "utf8" });
if (run.status !== 0) {
  console.error("ffmpeg falló con código", run.status);
  if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
  process.exit(run.status ?? 1);
}

if (!fs.existsSync(tmpOut)) {
  console.error("Salida no generada");
  process.exit(1);
}

const after = fs.statSync(tmpOut).size;
if (after >= before) {
  console.warn("La salida no es más liviana; se conserva el MP4 actual.");
  fs.unlinkSync(tmpOut);
  process.exit(0);
}

fs.renameSync(input, path.join(root, "public", "videos", "hero-mexico-city.original.mp4"));
fs.renameSync(tmpOut, input);

const pct = Math.round((1 - after / before) * 100);
console.log(
  "Listo:",
  path.relative(root, input),
  `(${(after / 1e6).toFixed(2)} MB, −${pct}% vs original). Backup: public/videos/hero-mexico-city.original.mp4`,
);
