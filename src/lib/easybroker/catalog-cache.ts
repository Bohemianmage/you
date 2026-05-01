import "server-only";

import { unstable_cache } from "next/cache";

import { getEasyBrokerCatalogRevalidateSeconds } from "@/lib/easybroker/config";
import { fetchEasyBrokerCatalogPages, fetchEasyBrokerPropertyDetail } from "@/lib/easybroker/fetch";
import type { CatalogProperty } from "@/data/catalog-properties";

export async function getCachedEasyBrokerCatalog(): Promise<CatalogProperty[]> {
  const ttl = getEasyBrokerCatalogRevalidateSeconds();
  const runner = unstable_cache(
    async () => fetchEasyBrokerCatalogPages(),
    ["easybroker-catalog-v1"],
    { revalidate: ttl, tags: ["easybroker-properties"] },
  );
  return runner();
}

export async function getCachedEasyBrokerPropertyDetail(publicId: string): Promise<CatalogProperty | null> {
  const id = publicId.trim();
  if (!id) return null;
  const ttl = getEasyBrokerCatalogRevalidateSeconds();
  const runner = unstable_cache(
    async () => fetchEasyBrokerPropertyDetail(id),
    ["easybroker-property-v1", id],
    { revalidate: ttl, tags: ["easybroker-properties", `easybroker-property:${id}`] },
  );
  return runner();
}
