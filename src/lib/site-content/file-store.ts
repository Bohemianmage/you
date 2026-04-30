import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import type { SiteContentFile } from "./types";

function contentPath(): string {
  const override = process.env.SITE_CONTENT_PATH?.trim();
  if (override) return path.isAbsolute(override) ? override : path.join(/* turbopackIgnore: true */ process.cwd(), override);
  return path.join(/* turbopackIgnore: true */ process.cwd(), "content", "site-content.json");
}

export async function readSiteContentFile(): Promise<SiteContentFile | null> {
  try {
    const raw = await readFile(contentPath(), "utf-8");
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    return data as SiteContentFile;
  } catch {
    return null;
  }
}

export async function writeSiteContentFile(data: SiteContentFile): Promise<void> {
  const filePath = contentPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}
