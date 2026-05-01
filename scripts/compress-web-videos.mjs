/**
 * Comprime MP4 para web (H.264, sin audio, faststart, ancho máx. 1920).
 * Archivos: hero-mexico-city.mp4 (hero), virtual-tours-bg.mp4 (recorridos virtuales).
 *
 * Si existe `hero-landing.mp4` y no `virtual-tours-bg.mp4`, renombra el primero al segundo antes de comprimir.
 *
 * Uso: node scripts/compress-web-videos.mjs
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ffmpegPath from "ffmpeg-static";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const videosDir = path.join(root, "public", "videos");

if (!ffmpegPath) {
  console.error("ffmpeg-static: binario no disponible en esta plataforma.");
  process.exit(1);
}

/**
 * @param {string} filename - nombre bajo public/videos/
 */
function compressInPlace(filename) {
  const input = path.join(videosDir, filename);
  const tmpOut = path.join(videosDir, `${filename}.tmp.mp4`);

  if (!fs.existsSync(input)) {
    console.warn("Omitido (no existe):", path.relative(root, input));
    return;
  }

  const before = fs.statSync(input).size;
  console.log("\nEntrada:", path.relative(root, input), `(${(before / 1e6).toFixed(2)} MB)`);

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
    console.error("Salida no generada para", filename);
    process.exit(1);
  }

  const after = fs.statSync(tmpOut).size;
  if (after >= before) {
    console.warn("La salida no es más liviana; se conserva el archivo actual.");
    fs.unlinkSync(tmpOut);
    return;
  }

  const stem = filename.replace(/\.mp4$/i, "");
  const backup = path.join(videosDir, `${stem}.original.mp4`);
  try {
    if (!fs.existsSync(backup)) fs.renameSync(input, backup);
    else fs.unlinkSync(input);
    fs.renameSync(tmpOut, input);
  } catch (e) {
    console.error(e);
    if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
    process.exit(1);
  }

  const pct = Math.round((1 - after / before) * 100);
  console.log(
    "Listo:",
    path.relative(root, input),
    `(${(after / 1e6).toFixed(2)} MB, −${pct}%). Backup:`,
    path.relative(root, backup),
  );
}

fs.mkdirSync(videosDir, { recursive: true });

const legacyLanding = path.join(videosDir, "hero-landing.mp4");
const vtFinal = path.join(videosDir, "virtual-tours-bg.mp4");
if (!fs.existsSync(vtFinal) && fs.existsSync(legacyLanding)) {
  fs.renameSync(legacyLanding, vtFinal);
  console.log("Renombrado hero-landing.mp4 → virtual-tours-bg.mp4");
}

compressInPlace("hero-mexico-city.mp4");
compressInPlace("virtual-tours-bg.mp4");

console.log("\nHecho.");
