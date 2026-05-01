"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function post(body: object) {
  void fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}

/**
 * Pageviews, vistas de ficha y muestras espaciadas para mapa de calor de clics (viewport normalizado).
 */
export function AnalyticsTracker() {
  const pathname = usePathname() ?? "/";
  const heatThrottleRef = useRef(0);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    post({ type: "pageview", path: pathname });

    const match = pathname.match(/^\/propiedades\/([^/?#]+)/);
    const slug = match?.[1];
    if (slug && slug.trim()) {
      post({
        type: "property_view",
        path: pathname,
        propertyId: decodeURIComponent(slug.trim()),
      });
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const now = Date.now();
      if (now - heatThrottleRef.current < 4500) return;
      heatThrottleRef.current = now;
      const x = e.clientX / Math.max(1, window.innerWidth);
      const y = e.clientY / Math.max(1, window.innerHeight);
      post({ type: "heatmap", path: pathname, x, y });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  return null;
}
