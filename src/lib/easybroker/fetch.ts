import "server-only";

import {
  getEasyBrokerApiBaseUrl,
  getEasyBrokerApiKey,
  getEasyBrokerPropertyStatuses,
} from "@/lib/easybroker/config";
import { mapEasyBrokerPropertyToCatalog } from "@/lib/easybroker/map-property";
import type { CatalogProperty } from "@/data/catalog-properties";

type EbListResponse = {
  content?: unknown[];
  pagination?: { next_page?: string | null };
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v != null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

async function ebJson(url: string): Promise<unknown> {
  const key = getEasyBrokerApiKey();
  if (!key) return null;
  const res = await fetch(url, {
    headers: {
      "X-Authorization": key,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json() as Promise<unknown>;
}

export async function fetchEasyBrokerPropertyDetail(publicId: string): Promise<CatalogProperty | null> {
  const key = getEasyBrokerApiKey();
  if (!key) return null;
  const base = getEasyBrokerApiBaseUrl();
  const url = `${base}/properties/${encodeURIComponent(publicId)}`;
  const json = await ebJson(url);
  const raw = asRecord(json);
  if (!raw) return null;
  return mapEasyBrokerPropertyToCatalog(raw, "detail");
}

/** Todas las páginas del listado (máx. 50 ítems por página). */
export async function fetchEasyBrokerCatalogPages(): Promise<CatalogProperty[]> {
  const key = getEasyBrokerApiKey();
  if (!key) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[easybroker] EASYBROKER_API_KEY no está definido; el catálogo quedará vacío.");
    }
    return [];
  }

  const base = getEasyBrokerApiBaseUrl();
  const statuses = getEasyBrokerPropertyStatuses();

  const buildUrl = (page: number): string => {
    const url = new URL(`${base}/properties`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", "50");
    for (const s of statuses) url.searchParams.append("search[statuses][]", s);
    return url.toString();
  };

  const out: CatalogProperty[] = [];
  let nextUrl: string | null = buildUrl(1);
  let pages = 0;

  while (nextUrl) {
    pages += 1;
    if (pages > 500) {
      console.warn("[easybroker] Demasiadas páginas; abortando para evitar bucle.");
      break;
    }

    const json = await ebJson(nextUrl);
    const data = json as EbListResponse | null;
    if (!data || !Array.isArray(data.content)) break;

    for (const item of data.content) {
      const raw = asRecord(item);
      if (raw) out.push(mapEasyBrokerPropertyToCatalog(raw, "list"));
    }

    const np = data.pagination?.next_page;
    nextUrl = typeof np === "string" && np.startsWith("http") ? np : null;
  }

  return out;
}
