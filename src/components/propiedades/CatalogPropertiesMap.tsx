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
  mapLoading: string;
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
/** Centro aproximado de CDMX — vista inicial y cuando no hay puntos */
const DEFAULT_CENTER: [number, number] = [19.4326, -99.1332];
/** Zoom metro CDMX; mayoría de listados suelen verse sin alejar demasiado */
const DEFAULT_ZOOM = 11;
/** Para encuadrar el mapa se ignoran ~12% de puntos más alejados del centro denso (mediana) */
const FOCUS_NEAREST_RATIO = 0.88;

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
}

function median(nums: number[]): number {
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : ((s[m - 1]! + s[m]!) / 2);
}

/** Bounds que encuadran la zona de mayor densidad (mayoría de puntos cerca de la mediana). */
function densityFocusedBounds(points: GeoPoint[]): L.LatLngBounds {
  const bounds = L.latLngBounds([]);
  if (points.length === 0) return bounds;
  if (points.length === 1) {
    bounds.extend([points[0]!.lat, points[0]!.lng]);
    return bounds;
  }
  const medianLat = median(points.map((p) => p.lat));
  const medianLng = median(points.map((p) => p.lng));
  const ranked = points
    .map((p) => ({ p, d: haversineKm(medianLat, medianLng, p.lat, p.lng) }))
    .sort((a, b) => a.d - b.d);
  const keepCount = Math.max(3, Math.ceil(points.length * FOCUS_NEAREST_RATIO));
  const subset = ranked.slice(0, keepCount).map((x) => x.p);
  for (const pt of subset) bounds.extend([pt.lat, pt.lng]);
  return bounds;
}

async function fetchGeoPoints(ids: string[], locale: Locale): Promise<GeoPoint[]> {
  const out: GeoPoint[] = [];
  const lang = locale === "en" ? "en" : "es";
  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    const q = chunk.map((id) => encodeURIComponent(id)).join(",");
    const res = await fetch(`/api/catalog/geo?ids=${q}&lang=${lang}`);
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
        const pts = await fetchGeoPoints(ids, locale);
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
  }, [idsKey, listings, locale]);

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
    const map = mapRef.current;
    const el = containerRef.current;
    if (!mapReady || !map || !el) return;

    map.scrollWheelZoom.disable();
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        map.scrollWheelZoom.enable();
      } else {
        map.scrollWheelZoom.disable();
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    const onLeave = () => map.scrollWheelZoom.disable();
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("mouseleave", onLeave);
      map.scrollWheelZoom.disable();
    };
  }, [mapReady]);

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
    for (const pt of points) {
      const href = catalogDetailSegmentHref(locale, pt.segment);
      const marker = L.circleMarker([pt.lat, pt.lng], {
        radius: 8,
        color: "#1a1e61",
        weight: 2,
        fillColor: "#55607a",
        fillOpacity: 0.92,
      });
      marker.bindPopup(`<a href="${escapeHtml(href)}" style="font-weight:600">${escapeHtml(pt.title)}</a>`);
      marker.addTo(group);
    }
    if (points.length === 1) {
      const p = points[0]!;
      map.setView([p.lat, p.lng], 14);
      return;
    }
    const focusBounds = densityFocusedBounds(points);
    if (focusBounds.isValid()) {
      map.fitBounds(focusBounds, { padding: [28, 28], maxZoom: 15 });
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
          <div
            className="pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-center gap-4 bg-brand-bg/75 px-6 backdrop-blur-[2px]"
            role="status"
            aria-live="polite"
          >
            <div className="h-1.5 w-40 rounded-full bg-brand-border">
              <div className="h-full w-full rounded-full bg-brand-accent-strong/70 motion-safe:animate-pulse" />
            </div>
            <p className="text-center text-sm font-medium text-brand-muted">{copy.mapLoading}</p>
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
