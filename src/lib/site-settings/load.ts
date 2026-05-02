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

export async function getSiteContentFresh(): Promise<SiteContentFile> {
  return fetchSiteContent();
}
