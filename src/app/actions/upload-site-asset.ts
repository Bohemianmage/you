"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE, verifyAdminToken } from "@/lib/admin/auth";
import {
  getGithubPublishConfig,
  getGithubSiteAssetsPrefix,
  GithubPublishError,
  publishBinaryFileToGithub,
} from "@/lib/site-content/github-publish";

export type UploadSiteAssetResult = { ok: true; publicPath: string } | { ok: false; error: string };

function repoPathToPublicUrl(repoRelativePath: string): string {
  if (repoRelativePath.startsWith("public/")) {
    return "/" + repoRelativePath.slice("public/".length);
  }
  return "/" + repoRelativePath;
}

function safeFilename(name: string): string {
  const base = name.replace(/^.*[/\\]/, "").replace(/[^a-zA-Z0-9._-]+/g, "-");
  return base.slice(0, 160) || "file";
}

function validateFile(kind: string, file: File): string | null {
  const maxPdf = 25 * 1024 * 1024;
  const maxImg = 8 * 1024 * 1024;
  const lower = file.name.toLowerCase();

  if (kind === "pdf") {
    if (file.type && file.type !== "application/pdf") return "Solo se admite PDF.";
    if (!lower.endsWith(".pdf")) return "El archivo debe tener extensión .pdf.";
    if (file.size > maxPdf) return "PDF demasiado grande (máx. 25 MB).";
    return null;
  }

  if (kind === "image") {
    const allowedMime = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
    const okExt = /\.(jpe?g|png|webp|gif|svg)$/i.test(lower);
    const okMime = !file.type || allowedMime.has(file.type);
    if (!okMime && !okExt) return "Tipo de imagen no permitido.";
    if (file.size > maxImg) return "Imagen demasiado grande (máx. 8 MB).";
    return null;
  }

  return "Tipo de subida no válido.";
}

async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return Boolean(token && (await verifyAdminToken(token)));
}

/**
 * Sube un PDF o imagen al repositorio (Contents API), misma config que `site-content.json`.
 * Tras un deploy, la ruta bajo `public/` queda servida como archivo estático.
 */
export async function uploadSiteAsset(formData: FormData): Promise<UploadSiteAssetResult> {
  if (!(await isAdmin())) {
    return { ok: false, error: "Sesión de administrador requerida." };
  }

  const gh = getGithubPublishConfig();
  if (!gh) {
    return {
      ok: false,
      error: "Configura GITHUB_TOKEN y GITHUB_REPO (igual que para guardar el contenido del sitio).",
    };
  }

  const kind = String(formData.get("kind") ?? "");
  const subfolder = String(formData.get("subfolder") ?? "misc")
    .replace(/[^a-z0-9-]/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "misc";

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecciona un archivo." };
  }

  const verr = validateFile(kind, file);
  if (verr) return { ok: false, error: verr };

  const buf = Buffer.from(await file.arrayBuffer());
  const prefix = getGithubSiteAssetsPrefix();
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const repoPath = `${prefix}/${subfolder}/${stamp}-${safeFilename(file.name)}`;
  const message = `${gh.commitPrefix} · subir asset ${safeFilename(file.name)}`;

  try {
    await publishBinaryFileToGithub(repoPath, buf, gh, message);
  } catch (e) {
    if (e instanceof GithubPublishError) {
      return { ok: false, error: `GitHub (${e.code}): ${e.message}` };
    }
    console.error("[upload-site-asset]", e);
    return { ok: false, error: "No se pudo completar la subida en GitHub." };
  }

  try {
    const abs = path.join(process.cwd(), repoPath);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, buf);
  } catch {
    /* FS de solo lectura (p. ej. Vercel); el archivo ya está en el repo */
  }

  return { ok: true, publicPath: repoPathToPublicUrl(repoPath) };
}
