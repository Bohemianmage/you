import { Redis } from "@upstash/redis";

const PREFIX = "you:analytics";

function redis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function analyticsConfigured(): boolean {
  return redis() != null;
}

function sanitizePath(p: string): string {
  const s = (p.trim() || "/").slice(0, 220);
  return s.length ? s : "/";
}

export async function recordAnalyticsEvent(input: {
  type: string;
  path?: string;
  propertyId?: string;
  x?: number;
  y?: number;
  country: string | null;
}): Promise<void> {
  const r = redis();
  if (!r) return;

  const ccRaw = (input.country ?? "ZZ").trim().toUpperCase().slice(0, 2);
  const cc = ccRaw.length === 2 ? ccRaw : "ZZ";

  if (input.type === "pageview" && input.path) {
    const path = sanitizePath(input.path);
    await Promise.all([
      r.hincrby(`${PREFIX}:paths`, path, 1),
      r.hincrby(`${PREFIX}:countries`, cc, 1),
      r.incr(`${PREFIX}:total_pageviews`),
    ]);
    return;
  }

  if (input.type === "property_view" && input.propertyId) {
    const id = input.propertyId.trim().slice(0, 160);
    if (!id) return;
    await Promise.all([
      r.hincrby(`${PREFIX}:properties`, id, 1),
      r.hincrby(`${PREFIX}:countries`, cc, 1),
    ]);
    return;
  }

  if (input.type === "heatmap" && input.path != null && input.x != null && input.y != null) {
    const payload = JSON.stringify({
      path: sanitizePath(input.path),
      x: Math.round(input.x * 1000) / 1000,
      y: Math.round(input.y * 1000) / 1000,
      t: Date.now(),
    });
    await r.lpush(`${PREFIX}:heatmap`, payload);
    await r.ltrim(`${PREFIX}:heatmap`, 0, 1999);
  }
}

export async function readAnalyticsSummary(): Promise<{
  configured: boolean;
  totalPageviews: number;
  topPaths: { path: string; count: number }[];
  topProperties: { id: string; count: number }[];
  byCountry: { code: string; count: number }[];
  heatmap: { cols: number; rows: number; cells: number[]; max: number };
}> {
  const r = redis();
  const emptyHeat = { cols: 12, rows: 12, cells: Array.from({ length: 144 }, () => 0), max: 0 };

  if (!r) {
    return {
      configured: false,
      totalPageviews: 0,
      topPaths: [],
      topProperties: [],
      byCountry: [],
      heatmap: emptyHeat,
    };
  }

  const [pathsRaw, propsRaw, countriesRaw, totalRaw, heatRaw] = await Promise.all([
    r.hgetall(`${PREFIX}:paths`),
    r.hgetall(`${PREFIX}:properties`),
    r.hgetall(`${PREFIX}:countries`),
    r.get(`${PREFIX}:total_pageviews`),
    r.lrange(`${PREFIX}:heatmap`, 0, 799),
  ]);

  const paths = pathsRaw ?? {};
  const props = propsRaw ?? {};
  const countries = countriesRaw ?? {};

  const topPaths = Object.entries(paths)
    .map(([path, v]) => ({ path, count: Number(v) || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 25);

  const topProperties = Object.entries(props)
    .map(([id, v]) => ({ id, count: Number(v) || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 25);

  const byCountry = Object.entries(countries)
    .map(([code, v]) => ({ code, count: Number(v) || 0 }))
    .sort((a, b) => b.count - a.count);

  const cols = 12;
  const rows = 12;
  const cells = Array.from({ length: cols * rows }, () => 0);
  let max = 0;
  for (const line of heatRaw ?? []) {
    try {
      const o = JSON.parse(line) as { x?: number; y?: number };
      if (typeof o.x !== "number" || typeof o.y !== "number") continue;
      const xi = Math.min(cols - 1, Math.max(0, Math.floor(o.x * cols)));
      const yi = Math.min(rows - 1, Math.max(0, Math.floor(o.y * rows)));
      const idx = yi * cols + xi;
      cells[idx] += 1;
      if (cells[idx] > max) max = cells[idx];
    } catch {
      /* ignore bad rows */
    }
  }

  return {
    configured: true,
    totalPageviews: Number(totalRaw) || 0,
    topPaths,
    topProperties,
    byCountry,
    heatmap: { cols, rows, cells, max },
  };
}
