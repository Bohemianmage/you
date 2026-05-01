import "server-only";

export function getEasyBrokerApiKey(): string | undefined {
  const k = process.env.EASYBROKER_API_KEY?.trim();
  return k || undefined;
}

export function getEasyBrokerApiBaseUrl(): string {
  const raw = process.env.EASYBROKER_API_BASE_URL?.trim() || "https://api.easybroker.com/v1";
  return raw.replace(/\/$/, "");
}

/** Estados enviados como `search[statuses][]`. Por defecto solo publicadas. */
export function getEasyBrokerPropertyStatuses(): string[] {
  const raw = process.env.EASYBROKER_PROPERTY_STATUSES?.trim();
  if (!raw) return ["published"];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getEasyBrokerCatalogRevalidateSeconds(): number {
  const n = Number(process.env.EASYBROKER_CACHE_SECONDS);
  if (Number.isFinite(n) && n >= 30) return Math.floor(n);
  return 300;
}
