"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { useSiteContentEditOptional } from "@/components/admin/site-content-edit-provider";
import type { CatalogProperty } from "@/data/catalog-properties";
import { filterCatalogProperties, inferListingDisplayType } from "@/lib/catalog-filters";
import { ListingTypeBadge } from "@/components/propiedades/ListingTypeBadge";
import { resolveCatalogZoneGroup } from "@/lib/catalog-zone-group";
import { catalogPageHref, type CatalogQueryFilters, type ListingTypeFilter } from "@/lib/catalog-query";
import { CATALOG_PAGE_COPY } from "@/i18n/marketing-pages";
import type { Locale } from "@/i18n/types";
import { propertyCoverImage } from "@/lib/property-media";
import { catalogDetailHref } from "@/lib/property-routes";

type CatalogCopy = (typeof CATALOG_PAGE_COPY)[Locale];

function SelectChevron({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const fieldLabel = "mb-1.5 block text-[11px] font-semibold tracking-wide text-brand-muted";
const fieldInput =
  "w-full rounded-xl border border-brand-border/90 bg-brand-bg px-3.5 py-2.5 text-sm text-brand-text shadow-sm transition placeholder:text-brand-subtle/50 hover:border-brand-accent/35 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/15";

function countDetailFilters(f: CatalogQueryFilters): number {
  let n = 0;
  if (f.tipo === "rent" || f.tipo === "sale") n++;
  if (f.zone?.trim()) n++;
  const nums: (keyof CatalogQueryFilters)[] = ["m2Min", "m2Max", "recMin", "recMax", "banMin", "banMax", "precioMin", "precioMax"];
  for (const k of nums) {
    const v = f[k];
    if (typeof v === "number" && !Number.isNaN(v)) n++;
  }
  return n;
}

function countAdvancedFilters(f: CatalogQueryFilters): number {
  let n = 0;
  const nums: (keyof CatalogQueryFilters)[] = ["m2Min", "m2Max", "recMin", "recMax", "banMin", "banMax", "precioMin", "precioMax"];
  for (const k of nums) {
    const v = f[k];
    if (typeof v === "number" && !Number.isNaN(v)) n++;
  }
  return n;
}

function readNumberInput(v: string): number | undefined {
  const t = v.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Alinea `moneda` / precios con la misma lógica que la query (`parseCatalogFiltersFromSearchParams`). */
function withPriceSanity(f: CatalogQueryFilters): CatalogQueryFilters {
  const precioMin = f.precioMin === 0 ? undefined : f.precioMin;
  const wantsPrice = precioMin != null || f.precioMax != null;
  if (!wantsPrice) {
    return { ...f, precioMin: undefined, precioMax: undefined, moneda: undefined };
  }
  const moneda = f.moneda === "MXN" || f.moneda === "USD" ? f.moneda : "MXN";
  return { ...f, precioMin, moneda };
}

export function PropiedadesCatalog({
  locale,
  serverCatalog,
  copy,
  contactHref,
  filters,
}: {
  locale: Locale;
  serverCatalog: CatalogProperty[];
  copy: CatalogCopy;
  contactHref: string;
  filters: CatalogQueryFilters;
}) {
  const edit = useSiteContentEditOptional();
  const catalog = edit ? [...edit.previewEbCatalog].filter((p) => p.active !== false) : serverCatalog;

  const filtersKeyFromUrl = useMemo(() => JSON.stringify(filters), [filters]);
  const [live, setLive] = useState<CatalogQueryFilters>(filters);
  useEffect(() => {
    setLive(filters);
  }, [filtersKeyFromUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const href = catalogPageHref(locale, live);
    window.history.replaceState(null, "", href);
  }, [live, locale]);

  const filtered = useMemo(() => filterCatalogProperties(catalog, live), [catalog, live]);

  const tipo: ListingTypeFilter = live.tipo === "rent" || live.tipo === "sale" ? live.tipo : "";

  const zones = useMemo(() => {
    const set = new Set<string>();
    for (const p of catalog) {
      const g = resolveCatalogZoneGroup(p.zone, p.zoneGroup);
      if (g.trim()) set.add(g.trim());
    }
    return [...set].sort((a, b) => a.localeCompare(b, locale === "en" ? "en" : "es"));
  }, [catalog, locale]);

  const detailFilterCount = useMemo(() => countDetailFilters(live), [live]);
  const advancedFilterCount = useMemo(() => countAdvancedFilters(live), [live]);

  const [filtersPanelOpen, setFiltersPanelOpen] = useState(() => countDetailFilters(filters) > 0);
  const [advancedOpen, setAdvancedOpen] = useState(() => countAdvancedFilters(filters) > 0);

  /** Solo al llegar filtros por URL (enlace externo / «Limpiar»): no reaccionar a cada tecla en vivo. */
  const prevUrlFiltersRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevUrlFiltersRef.current === null) {
      prevUrlFiltersRef.current = filtersKeyFromUrl;
      return;
    }
    if (prevUrlFiltersRef.current !== filtersKeyFromUrl) {
      prevUrlFiltersRef.current = filtersKeyFromUrl;
      setFiltersPanelOpen(countDetailFilters(filters) > 0);
      setAdvancedOpen(countAdvancedFilters(filters) > 0);
    }
  }, [filtersKeyFromUrl, filters]);

  const totalInCatalog = catalog.length;
  const countCaption = useMemo(() => {
    if (detailFilterCount > 0) {
      return copy.catalogCountFiltered.replace("{{shown}}", String(filtered.length)).replace("{{total}}", String(totalInCatalog));
    }
    return copy.catalogCountAll.replace("{{count}}", String(filtered.length));
  }, [copy, detailFilterCount, filtered.length, totalInCatalog]);

  return (
    <div className="space-y-10">
      {edit ? (
        <p className="text-xs text-brand-muted">
          <Link href="/admin/listas" className="font-semibold text-brand-accent no-underline hover:underline">
            Editar catálogo y fichas
          </Link>
          .
        </p>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-brand-border/70 bg-gradient-to-b from-brand-bg via-brand-bg to-brand-surface/40 shadow-[0_8px_36px_-22px_rgba(26,30,97,0.16)] ring-1 ring-brand-border/50">
        <details
          className="group/filter"
          open={filtersPanelOpen}
          onToggle={(e) => setFiltersPanelOpen((e.target as HTMLDetailsElement).open)}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-brand-border/50 bg-brand-surface/30 px-4 py-4 transition-colors hover:bg-brand-surface/55 sm:px-6 [&::-webkit-details-marker]:hidden">
            <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
              <span className="font-heading text-base font-semibold tracking-tight text-brand-text">
                {copy.filtersDetailHeading}
              </span>
              {detailFilterCount > 0 ? (
                <span className="inline-flex shrink-0 items-center rounded-full bg-brand-you/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-you ring-1 ring-brand-you/18">
                  {detailFilterCount}{" "}
                  {detailFilterCount === 1 ? copy.filterActiveSingular : copy.filterActivePlural}
                </span>
              ) : null}
            </div>
            <SelectChevron className="shrink-0 text-brand-muted transition-transform duration-200 group-open/filter:rotate-180" />
          </summary>

          {copy.filtersDetailSubtitle.trim() ? (
            <p className="border-b border-brand-border/40 bg-brand-bg/50 px-4 py-3 text-sm leading-relaxed text-brand-muted sm:px-6">
              {copy.filtersDetailSubtitle}
            </p>
          ) : null}

          <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <label htmlFor="filter-tipo" className={fieldLabel}>
                  {copy.filterHeading}
                </label>
                <div className="relative">
                  <select
                    id="filter-tipo"
                    value={tipo}
                    onChange={(e) => {
                      const v = e.target.value;
                      setLive((prev) => ({
                        ...prev,
                        tipo: v === "rent" || v === "sale" ? v : "",
                      }));
                    }}
                    className={`${fieldInput} appearance-none pr-11`}
                  >
                    <option value="">{copy.filterAll}</option>
                    <option value="rent">{copy.filterRent}</option>
                    <option value="sale">{copy.filterSale}</option>
                  </select>
                  <SelectChevron className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                </div>
                <p className="text-[11px] leading-snug text-brand-subtle">{copy.filterListingTypeHint}</p>
              </div>
              <div className="min-w-0 space-y-2">
                <label htmlFor="filter-zone" className={fieldLabel}>
                  {copy.zoneLabel}
                </label>
                <div className="relative">
                  <select
                    id="filter-zone"
                    value={live.zone ?? ""}
                    onChange={(e) => {
                      const z = e.target.value.trim();
                      setLive((prev) => ({ ...prev, zone: z || undefined }));
                    }}
                    className={`${fieldInput} appearance-none pr-11`}
                  >
                    <option value="">{copy.filterZoneAll}</option>
                    {zones.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                  <SelectChevron className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                </div>
                <p className="text-[11px] leading-snug text-brand-subtle">{copy.filterRegionHint}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-brand-border/60 bg-brand-surface/25">
              <button
                type="button"
                aria-expanded={advancedOpen}
                onClick={() => setAdvancedOpen((o) => !o)}
                className="flex w-full cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-brand-text transition-colors hover:bg-brand-surface/50"
              >
                <span>{copy.filterMoreOptionsHeading}</span>
                <span className="flex shrink-0 items-center gap-2">
                  {advancedFilterCount > 0 ? (
                    <span className="rounded-full bg-brand-you/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-you ring-1 ring-brand-you/15">
                      {advancedFilterCount}
                    </span>
                  ) : null}
                  <SelectChevron
                    className={`text-brand-muted transition-transform duration-200 ${advancedOpen ? "rotate-180" : ""}`}
                  />
                </span>
              </button>
              {advancedOpen ? (
              <div className="space-y-4 border-t border-brand-border/45 px-4 py-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="filter-m2min" className={fieldLabel}>
                      {copy.filterM2Min}
                    </label>
                    <input
                      id="filter-m2min"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      placeholder="—"
                      value={live.m2Min ?? ""}
                      onChange={(e) =>
                        setLive((prev) => ({
                          ...prev,
                          m2Min: readNumberInput(e.target.value),
                        }))
                      }
                      className={fieldInput}
                    />
                  </div>
                  <div>
                    <label htmlFor="filter-m2max" className={fieldLabel}>
                      {copy.filterM2Max}
                    </label>
                    <input
                      id="filter-m2max"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      placeholder="—"
                      value={live.m2Max ?? ""}
                      onChange={(e) =>
                        setLive((prev) => ({
                          ...prev,
                          m2Max: readNumberInput(e.target.value),
                        }))
                      }
                      className={fieldInput}
                    />
                  </div>
                  <div>
                    <label htmlFor="filter-recmin" className={fieldLabel}>
                      {copy.filterBedMin}
                    </label>
                    <input
                      id="filter-recmin"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      placeholder="—"
                      value={live.recMin ?? ""}
                      onChange={(e) =>
                        setLive((prev) => ({
                          ...prev,
                          recMin: readNumberInput(e.target.value),
                        }))
                      }
                      className={fieldInput}
                    />
                  </div>
                  <div>
                    <label htmlFor="filter-recmax" className={fieldLabel}>
                      {copy.filterBedMax}
                    </label>
                    <input
                      id="filter-recmax"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      placeholder="—"
                      value={live.recMax ?? ""}
                      onChange={(e) =>
                        setLive((prev) => ({
                          ...prev,
                          recMax: readNumberInput(e.target.value),
                        }))
                      }
                      className={fieldInput}
                    />
                  </div>
                  <div>
                    <label htmlFor="filter-banmin" className={fieldLabel}>
                      {copy.filterBathMin}
                    </label>
                    <input
                      id="filter-banmin"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      placeholder="—"
                      value={live.banMin ?? ""}
                      onChange={(e) =>
                        setLive((prev) => ({
                          ...prev,
                          banMin: readNumberInput(e.target.value),
                        }))
                      }
                      className={fieldInput}
                    />
                  </div>
                  <div>
                    <label htmlFor="filter-banmax" className={fieldLabel}>
                      {copy.filterBathMax}
                    </label>
                    <input
                      id="filter-banmax"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      placeholder="—"
                      value={live.banMax ?? ""}
                      onChange={(e) =>
                        setLive((prev) => ({
                          ...prev,
                          banMax: readNumberInput(e.target.value),
                        }))
                      }
                      className={fieldInput}
                    />
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-brand-subtle">{copy.filterPriceNote}</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
                  <div className="lg:col-span-1">
                    <label htmlFor="filter-preciomin" className={fieldLabel}>
                      {copy.filterPriceMin}
                    </label>
                    <input
                      id="filter-preciomin"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      placeholder="—"
                      value={live.precioMin ?? ""}
                      onChange={(e) =>
                        setLive((prev) =>
                          withPriceSanity({
                            ...prev,
                            precioMin: readNumberInput(e.target.value),
                          }),
                        )
                      }
                      className={fieldInput}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <label htmlFor="filter-preciomax" className={fieldLabel}>
                      {copy.filterPriceMax}
                    </label>
                    <input
                      id="filter-preciomax"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      placeholder="—"
                      value={live.precioMax ?? ""}
                      onChange={(e) =>
                        setLive((prev) =>
                          withPriceSanity({
                            ...prev,
                            precioMax: readNumberInput(e.target.value),
                          }),
                        )
                      }
                      className={fieldInput}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label htmlFor="filter-moneda" className={fieldLabel}>
                      {copy.filterCurrency}
                    </label>
                    <div className="relative max-w-xs">
                      <select
                        id="filter-moneda"
                        value={live.moneda ?? "MXN"}
                        onChange={(e) => {
                          const m = e.target.value;
                          setLive((prev) =>
                            withPriceSanity({
                              ...prev,
                              moneda: m === "USD" || m === "MXN" ? m : "MXN",
                            }),
                          );
                        }}
                        className={`${fieldInput} appearance-none pr-11`}
                      >
                        <option value="MXN">{copy.filterCurrencyMXN}</option>
                        <option value="USD">{copy.filterCurrencyUSD}</option>
                      </select>
                      <SelectChevron className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                    </div>
                  </div>
                </div>
              </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 border-t border-brand-border/45 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <p className="text-xs leading-relaxed text-brand-muted">{copy.filterLiveHint}</p>
              <Link
                href={catalogPageHref(locale, {})}
                className="inline-flex min-h-[2.75rem] flex-1 items-center justify-center rounded-full border border-brand-border/90 bg-transparent px-6 text-sm font-semibold text-brand-muted transition hover:border-brand-accent/50 hover:bg-brand-surface/80 hover:text-brand-text sm:flex-none sm:flex-initial"
              >
                {copy.filterReset}
              </Link>
            </div>
          </div>
        </details>
      </section>

      <p className="text-center text-sm font-medium text-brand-muted sm:text-left">{countCaption}</p>

      {filtered.length === 0 ? (
        <p className="rounded-sm border border-dashed border-brand-border bg-brand-surface/80 px-6 py-10 text-center text-sm text-brand-muted">
          {copy.noResults}
        </p>
      ) : (
        <ul className="grid gap-8 md:grid-cols-2">
          {filtered.map((p) => {
            const detailHref = catalogDetailHref(locale, p);
            const cover = propertyCoverImage(p);
            return (
              <li key={p.id}>
                <article className="flex h-full flex-col overflow-hidden rounded-sm border border-brand-border bg-brand-surface shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
                  <Link
                    href={detailHref}
                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
                  >
                    <div className="relative aspect-[16/10] bg-gradient-to-br from-brand-bg to-brand-border/40">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={p.title}
                          fill
                          unoptimized={cover.startsWith("http")}
                          className="object-cover transition duration-300 group-hover:scale-[1.02]"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(47,46,46,0.06),transparent)]" />
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <ListingTypeBadge
                          kind={inferListingDisplayType({
                            listingType: p.listingType,
                            status: p.status,
                            title: p.title,
                            specs: p.specs,
                            ebOperations: p.ebOperations,
                          })}
                          labels={{ rent: copy.listingBadgeRent, sale: copy.listingBadgeSale }}
                        />
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-accent">
                          {copy.zoneLabel}: {p.zone}
                        </p>
                      </div>
                      <h2 className="mt-2 font-heading text-xl font-semibold text-brand-text group-hover:text-brand-accent-strong">
                        {p.title}
                      </h2>
                      <p className="mt-3 font-heading text-2xl font-semibold text-brand-text">{p.price}</p>
                      <p className="mt-2 text-sm text-brand-muted">
                        <span className="font-semibold text-brand-text">{copy.specsLabel}:</span> {p.specs}
                      </p>
                    </div>
                  </Link>
                  <div className="mt-auto flex flex-col gap-2.5 border-t border-brand-border/50 bg-brand-bg/40 px-5 pb-5 pt-4 sm:flex-row sm:flex-wrap sm:items-center">
                    <Link
                      href={detailHref}
                      className="inline-flex min-h-[2.5rem] flex-1 items-center justify-center rounded-full bg-brand-accent px-5 text-center text-xs font-bold uppercase tracking-[0.12em] text-brand-white shadow-sm transition hover:bg-brand-accent-strong sm:flex-none"
                    >
                      {copy.viewListingCta}
                    </Link>
                    <Link
                      href={contactHref}
                      className="inline-flex min-h-[2.5rem] flex-1 items-center justify-center rounded-full border border-brand-accent/90 bg-brand-bg px-5 text-center text-xs font-bold uppercase tracking-[0.12em] text-brand-accent transition hover:bg-brand-accent hover:text-brand-white sm:flex-none"
                    >
                      {copy.contactCta}
                    </Link>
                    {p.tourUrl ? (
                      <a
                        href={p.tourUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[2.5rem] flex-1 items-center justify-center rounded-full border border-brand-border px-5 text-center text-xs font-bold uppercase tracking-[0.12em] text-brand-text transition hover:border-brand-accent hover:text-brand-accent-strong sm:flex-none"
                      >
                        {copy.virtualTourCta}
                      </a>
                    ) : null}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
