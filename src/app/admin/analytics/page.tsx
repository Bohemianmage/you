"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { withYouWordmark } from "@/components/brand/you-wordmark";

type Summary = {
  configured: boolean;
  totalPageviews: number;
  topPaths: { path: string; count: number }[];
  topProperties: { id: string; count: number }[];
  byCountry: { code: string; count: number }[];
  heatmap: { cols: number; rows: number; cells: number[]; max: number };
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/analytics/summary", { cache: "no-store" });
        if (!res.ok) {
          setError(res.status === 401 ? "Sesión requerida." : "No se pudieron cargar las métricas.");
          return;
        }
        setData((await res.json()) as Summary);
      } catch {
        setError("No se pudieron cargar las métricas.");
      }
    })();
  }, []);

  return (
    <div id="admin-main" className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">
        <Link href="/admin" className="text-brand-accent no-underline hover:underline">
          Panel
        </Link>
        {" · "}
        Analíticas
      </p>
      <h1 className="mt-2 font-heading text-2xl font-semibold text-brand-text">{withYouWordmark("Analíticas del sitio")}</h1>

      {error ? (
        <p className="mt-8 rounded-sm border border-brand-border bg-brand-surface px-4 py-3 text-sm text-brand-muted">{error}</p>
      ) : null}

      {!data && !error ? (
        <p className="mt-10 text-sm text-brand-muted">Cargando…</p>
      ) : null}

      {data && !error ? (
        <div className="mt-10 space-y-12">
          {!data.configured ? (
            <p className="rounded-sm border border-dashed border-brand-border bg-brand-bg px-4 py-4 text-sm text-brand-muted">
              Redis no está configurado: los eventos se aceptan pero no se persisten. Añade las variables de entorno y despliega de nuevo.
            </p>
          ) : null}

          <section aria-labelledby="pv-heading">
            <h2 id="pv-heading" className="font-heading text-lg font-semibold text-brand-text">
              Resumen
            </h2>
            <p className="mt-2 text-sm text-brand-muted">
              Pageviews registrados: <span className="font-semibold text-brand-text">{data.totalPageviews}</span>
            </p>
          </section>

          <section aria-labelledby="prop-heading">
            <h2 id="prop-heading" className="font-heading text-lg font-semibold text-brand-text">
              Fichas más vistas
            </h2>
            <p className="mt-1 text-xs text-brand-muted">Identificador público / segmento de URL tal cual llegó al tracker.</p>
            <ul className="mt-4 divide-y divide-brand-border/60 rounded-sm border border-brand-border bg-brand-bg">
              {data.topProperties.length === 0 ? (
                <li className="px-4 py-3 text-sm text-brand-muted">Sin datos todavía.</li>
              ) : (
                data.topProperties.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                    <span className="min-w-0 truncate font-mono text-[13px] text-brand-text">{row.id}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-brand-accent-strong">{row.count}</span>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section aria-labelledby="paths-heading">
            <h2 id="paths-heading" className="font-heading text-lg font-semibold text-brand-text">
              Rutas más visitadas
            </h2>
            <ul className="mt-4 divide-y divide-brand-border/60 rounded-sm border border-brand-border bg-brand-bg">
              {data.topPaths.length === 0 ? (
                <li className="px-4 py-3 text-sm text-brand-muted">Sin datos todavía.</li>
              ) : (
                data.topPaths.map((row) => (
                  <li key={row.path} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                    <span className="min-w-0 truncate font-mono text-[13px] text-brand-text">{row.path}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-brand-muted">{row.count}</span>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section aria-labelledby="country-heading">
            <h2 id="country-heading" className="font-heading text-lg font-semibold text-brand-text">
              Visitas por país
            </h2>
            <p className="mt-1 text-xs text-brand-muted">Cabecera <code className="text-[11px]">x-vercel-ip-country</code> en producción.</p>
            <ul className="mt-4 divide-y divide-brand-border/60 rounded-sm border border-brand-border bg-brand-bg">
              {data.byCountry.length === 0 ? (
                <li className="px-4 py-3 text-sm text-brand-muted">Sin datos todavía.</li>
              ) : (
                data.byCountry.map((row) => (
                  <li key={row.code} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                    <span className="font-semibold text-brand-text">{row.code}</span>
                    <span className="tabular-nums text-brand-muted">{row.count}</span>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section aria-labelledby="heat-heading">
            <h2 id="heat-heading" className="font-heading text-lg font-semibold text-brand-text">
              Mapa de calor de clics
            </h2>
            <p className="mt-1 text-xs text-brand-muted">Agregación 12×12 sobre posiciones de clic normalizadas al viewport; muestra máx. una muestra cada ~4,5 s por usuario.</p>
            <div
              className="mt-4 grid max-w-md gap-px overflow-hidden rounded-sm border border-brand-border bg-brand-border"
              style={{
                gridTemplateColumns: `repeat(${data.heatmap.cols}, minmax(0, 1fr))`,
              }}
            >
              {data.heatmap.cells.map((v, i) => {
                const intensity = data.heatmap.max > 0 ? v / data.heatmap.max : 0;
                const bg =
                  v === 0
                    ? "rgb(248 250 252)"
                    : `rgba(79, 70, 229, ${0.15 + intensity * 0.85})`;
                return (
                  <div
                    key={i}
                    title={`${v}`}
                    className="aspect-square min-h-[14px]"
                    style={{ backgroundColor: bg }}
                  />
                );
              })}
            </div>
          </section>
        </div>
      ) : null}

      <p className="mt-12 text-sm">
        <Link href="/admin/listas" className="font-semibold text-brand-accent no-underline hover:underline">
          Contenidos del sitio
        </Link>
      </p>
    </div>
  );
}
