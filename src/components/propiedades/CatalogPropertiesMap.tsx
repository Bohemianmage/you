"use client";

import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CatalogProperty } from "@/data/catalog-properties";
import { catalogDetailSegmentHref, catalogPropertySegment } from "@/lib/property-routes";
import type { Locale } from "@/i18n/types";

import "leaflet/dist/leaflet.css";

type CatalogMapCopy = {
  mapEmpty: string;
  mapError: string;
  mapHint: string;
};

type GeoPoint = { lat: number; lng: number; title: string; segment: string };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const CHUNK = 28;
const DEFAULT_CENTER: [number, number] = [19.4326, -99.1332];
const DEFAULT_ZOOM = 11;

async function fetchGeoPoints(ids: string[]): Promise<GeoPoint[]> {
  const out: GeoPoint[] = [];
  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    const q = chunk.map((id) => encodeURIComponent(id)).join(",");
    const res = await fetch(`/api/catalog/geo?ids=${q}`);
    if (!res.ok) throw new Error("geo_failed");
    const data = (await res.json()) as { points?: GeoPoint[] };
    const pts = Array.isArray(data.points) ? data.points : [];
    out.push(...pts);
  }
  return out;
}

export function CatalogPropertiesMap({
  locale,
  listings,
  copy,
}: {
  locale: Locale;
  listings: CatalogProperty[];
  copy: CatalogMapCopy;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [mapReady, setMapReady] = useState(false);

  const idsKey = useMemo(() => {
    return [...new Set(listings.map((p) => catalogPropertySegment(p)))].sort().join("|");
  }, [listings]);

  useEffect(() => {
    let cancelled = false;
    if (!listings.length) {
      setPoints([]);
      setStatus("ready");
      return;
    }
    setStatus("loading");
    const ids = [...new Set(listings.map((p) => catalogPropertySegment(p)))];
    void (async () => {
      try {
        const pts = await fetchGeoPoints(ids);
        if (cancelled) return;
        setPoints(pts);
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setPoints([]);
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idsKey, listings]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;
    const map = L.map(el).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    const group = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerRef.current = group;
    setMapReady(true);
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    const group = layerRef.current;
    if (!map || !group) return;
    group.clearLayers();
    if (!points.length) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }
    const bounds = L.latLngBounds([]);
    for (const pt of points) {
      const href = catalogDetailSegmentHref(locale, pt.segment);
      const marker = L.circleMarker([pt.lat, pt.lng], {
        radius: 8,
        color: "#1a1e61",
        weight: 2,
        fillColor: "#4f46e5",
        fillOpacity: 0.92,
      });
      marker.bindPopup(`<a href="${escapeHtml(href)}" style="font-weight:600">${escapeHtml(pt.title)}</a>`);
      marker.addTo(group);
      bounds.extend([pt.lat, pt.lng]);
    }
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 15 });
    }
  }, [mapReady, locale, points]);

  if (!listings.length) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-brand-border/70 bg-brand-surface/30 shadow-[0_8px_36px_-22px_rgba(26,30,97,0.12)] ring-1 ring-brand-border/40">
      <div className="border-b border-brand-border/50 px-4 py-3 sm:px-6">
        <p className="text-[11px] leading-relaxed text-brand-subtle">{copy.mapHint}</p>
      </div>
      <div className="relative h-[min(420px,55vh)] min-h-[280px] w-full">
        <div ref={containerRef} className="absolute inset-0 z-0" aria-hidden />
        {status === "loading" ? (
          <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-brand-bg/40 text-sm text-brand-muted">
            …
          </div>
        ) : null}
        {status === "ready" && points.length === 0 ? (
          <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-brand-bg/55 px-6 text-center text-sm text-brand-muted">
            {copy.mapEmpty}
          </div>
        ) : null}
        {status === "error" ? (
          <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-brand-bg/70 px-6 text-center text-sm text-brand-muted">
            {copy.mapError}
          </div>
        ) : null}
      </div>
    </section>
  );
}
