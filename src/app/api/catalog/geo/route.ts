import { NextResponse } from "next/server";

import type { CatalogProperty } from "@/data/catalog-properties";
import { getCachedEasyBrokerPropertyDetail } from "@/lib/easybroker/catalog-cache";
import { catalogPropertySegment } from "@/lib/property-routes";

const MAX_IDS = 80;
const BATCH = 12;

type GeoPoint = { lat: number; lng: number; title: string; segment: string };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("ids") ?? "";
  const ids = [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))].slice(0, MAX_IDS);
  if (!ids.length) {
    return NextResponse.json({ points: [] as GeoPoint[] });
  }

  const points: GeoPoint[] = [];

  for (let i = 0; i < ids.length; i += BATCH) {
    const slice = ids.slice(i, i + BATCH);
    const batch = await Promise.all(
      slice.map(async (id) => {
        const p: CatalogProperty | null = await getCachedEasyBrokerPropertyDetail(id);
        if (p == null) return null;
        const lat = p.latitude;
        const lng = p.longitude;
        if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return {
          lat,
          lng,
          title: p.title,
          segment: catalogPropertySegment(p),
        } satisfies GeoPoint;
      }),
    );
    for (const pt of batch) {
      if (pt) points.push(pt);
    }
  }

  return NextResponse.json({ points });
}
