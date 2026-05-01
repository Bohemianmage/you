import "server-only";

import { unstable_cache } from "next/cache";

import type { CatalogProperty } from "@/data/catalog-properties";
import { getEasyBrokerCatalogRevalidateSeconds } from "@/lib/easybroker/config";
import { fetchEasyBrokerCatalogPages, fetchEasyBrokerPropertyDetail } from "@/lib/easybroker/fetch";
import type { Locale } from "@/i18n/types";

export async function getCachedEasyBrokerCatalog(locale: Locale): Promise<CatalogProperty[]> {
  const ttl = getEasyBrokerCatalogRevalidateSeconds();
  const runner = unstable_cache(
    async () => fetchEasyBrokerCatalogPages(locale),
    ["easybroker-catalog-v2", locale],
    { revalidate: ttl, tags: ["easybroker-properties"] },
  );
  return runner();
}

export async function getCachedEasyBrokerPropertyDetail(publicId: string, locale: Locale): Promise<CatalogProperty | null> {
  const id = publicId.trim();
  if (!id) return null;
  const ttl = getEasyBrokerCatalogRevalidateSeconds();
  const runner = unstable_cache(
    async () => fetchEasyBrokerPropertyDetail(id, locale),
    ["easybroker-property-v2", id, locale],
    { revalidate: ttl, tags: ["easybroker-properties", `easybroker-property:${id}`] },
  );
  return runner();
}
