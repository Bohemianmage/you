import "server-only";

import { unstable_cache } from "next/cache";

import { readSiteContentFile } from "@/lib/site-content/file-store";
import type { SiteContentFile } from "@/lib/site-content/types";

async function fetchSiteContent(): Promise<SiteContentFile> {
  const file = await readSiteContentFile();
  return file ?? {};
}

export const getCachedSiteContent = unstable_cache(fetchSiteContent, ["site-content-v2"], {
  tags: ["site-content"],
});

/** Alias histórico — mismo que contenido JSON local. */
export const getCachedSiteSettingsPayload = getCachedSiteContent;

export async function getSiteContentFresh(): Promise<SiteContentFile> {
  return fetchSiteContent();
}

/** @deprecated Usar getSiteContentFresh */
export async function getSiteSettingsPayloadFresh(): Promise<SiteContentFile> {
  return getSiteContentFresh();
}
