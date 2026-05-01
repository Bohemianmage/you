"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { useSiteContentEditOptional } from "@/components/admin/site-content-edit-provider";
import type { CatalogProperty } from "@/data/catalog-properties";
import { filterCatalogProperties } from "@/lib/catalog-filters";
import { catalogPageHref, type CatalogQueryFilters, type ListingTypeFilter } from "@/lib/catalog-query";
import { CATALOG_PAGE_COPY } from "@/i18n/marketing-pages";
import type { Locale } from "@/i18n/types";
import { propertyCoverImage } from "@/lib/property-media";
import { catalogDetailHref } from "@/lib/property-routes";
import { mergePublicCatalogFromFile } from "@/lib/site-content/merge-public";
import type { SiteContentFile } from "@/lib/site-content/types";

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
  const catalog = edit ? mergePublicCatalogFromFile(edit.working as SiteContentFile) : serverCatalog;

  const filtered = useMemo(() => filterCatalogProperties(catalog, filters), [catalog, filters]);

  const tipo: ListingTypeFilter =
    filters.tipo === "rent" || filters.tipo === "sale" ? filters.tipo : "";

  const zones = useMemo(() => {
    const set = new Set<string>();
    for (const p of catalog) {
      if (p.zone?.trim()) set.add(p.zone.trim());
    }
    return [...set].sort((a, b) => a.localeCompare(b, locale === "en" ? "en" : "es"));
  }, [catalog, locale]);

  const filterFormKey = JSON.stringify(filters);
  const detailFilterCount = useMemo(() => countDetailFilters(filters), [filters]);

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

      <section className="overflow-hidden rounded-2xl border border-brand-border/60 bg-gradient-to-b from-brand-bg via-brand-bg to-brand-surface/25 shadow-[0_8px_40px_-24px_rgba(26,30,97,0.18)] ring-1 ring-brand-border/40">
        <div className="border-b border-brand-border/40 bg-brand-bg/40 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <h2 className="font-heading text-lg font-semibold tracking-tight text-brand-text">{copy.filtersDetailHeading}</h2>
              <p className="max-w-xl text-sm leading-relaxed text-brand-muted">{copy.filtersDetailSubtitle}</p>
            </div>
            {detailFilterCount > 0 ? (
              <span className="shrink-0 rounded-full bg-brand-you/10 px-3 py-1 text-xs font-semibold text-brand-you ring-1 ring-brand-you/15">
                {detailFilterCount} {copy.filterActiveLabel}
              </span>
            ) : null}
          </div>
        </div>

        <form key={filterFormKey} method="get" action="/propiedades" className="space-y-8 px-4 py-6 sm:px-6 sm:py-8">
          {locale === "en" ? <input type="hidden" name="lang" value="en" /> : null}

          <div className="space-y-8">
            <fieldset className="min-w-0 space-y-3 border-0 p-0">
              <legend className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-accent-strong">
                {copy.filterHeading}
              </legend>
              <label htmlFor="filter-tipo" className={fieldLabel}>
                {copy.filterListingTypeHint}
              </label>
              <div className="relative max-w-md">
                <select
                  id="filter-tipo"
                  name="tipo"
                  defaultValue={tipo}
                  className={`${fieldInput} appearance-none pr-11`}
                >
                  <option value="">{copy.filterAll}</option>
                  <option value="rent">{copy.filterRent}</option>
                  <option value="sale">{copy.filterSale}</option>
                </select>
                <SelectChevron className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
              </div>
            </fieldset>

            <fieldset className="min-w-0 space-y-3 border-0 border-t border-brand-border/35 p-0 pt-8">
              <legend className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-accent-strong">
                {copy.filterGroupZone}
              </legend>
              <label htmlFor="filter-zone" className={fieldLabel}>
                {copy.zoneLabel}
              </label>
              <div className="relative max-w-xl">
                <select id="filter-zone" name="zone" defaultValue={filters.zone ?? ""} className={`${fieldInput} appearance-none pr-11`}>
                  <option value="">{copy.filterZoneAll}</option>
                  {zones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
                <SelectChevron className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
              </div>
            </fieldset>

            <fieldset className="min-w-0 space-y-4 border-0 border-t border-brand-border/35 p-0 pt-8">
              <legend className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-accent-strong">
                {copy.filterGroupSize}
              </legend>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                <div>
                  <label htmlFor="filter-m2min" className={fieldLabel}>
                    {copy.filterM2Min}
                  </label>
                  <input
                    id="filter-m2min"
                    name="m2Min"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    placeholder="—"
                    defaultValue={filters.m2Min ?? ""}
                    className={fieldInput}
                  />
                </div>
                <span className="hidden pb-3 text-center text-sm font-medium text-brand-subtle sm:block" aria-hidden>
                  —
                </span>
                <div>
                  <label htmlFor="filter-m2max" className={fieldLabel}>
                    {copy.filterM2Max}
                  </label>
                  <input
                    id="filter-m2max"
                    name="m2Max"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    placeholder="—"
                    defaultValue={filters.m2Max ?? ""}
                    className={fieldInput}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="min-w-0 space-y-4 border-0 border-t border-brand-border/35 p-0 pt-8">
              <legend className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-accent-strong">
                {copy.filterGroupLayout}
              </legend>
              <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
                <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                  <div>
                    <label htmlFor="filter-recmin" className={fieldLabel}>
                      {copy.filterBedMin}
                    </label>
                    <input
                      id="filter-recmin"
                      name="recMin"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      placeholder="—"
                      defaultValue={filters.recMin ?? ""}
                      className={fieldInput}
                    />
                  </div>
                  <span className="hidden pb-3 text-center text-sm text-brand-subtle sm:block" aria-hidden>
                    —
                  </span>
                  <div>
                    <label htmlFor="filter-recmax" className={fieldLabel}>
                      {copy.filterBedMax}
                    </label>
                    <input
                      id="filter-recmax"
                      name="recMax"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      placeholder="—"
                      defaultValue={filters.recMax ?? ""}
                      className={fieldInput}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                  <div>
                    <label htmlFor="filter-banmin" className={fieldLabel}>
                      {copy.filterBathMin}
                    </label>
                    <input
                      id="filter-banmin"
                      name="banMin"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      placeholder="—"
                      defaultValue={filters.banMin ?? ""}
                      className={fieldInput}
                    />
                  </div>
                  <span className="hidden pb-3 text-center text-sm text-brand-subtle sm:block" aria-hidden>
                    —
                  </span>
                  <div>
                    <label htmlFor="filter-banmax" className={fieldLabel}>
                      {copy.filterBathMax}
                    </label>
                    <input
                      id="filter-banmax"
                      name="banMax"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      placeholder="—"
                      defaultValue={filters.banMax ?? ""}
                      className={fieldInput}
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="min-w-0 space-y-4 border-0 border-t border-brand-border/35 p-0 pt-8">
              <legend className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-accent-strong">
                {copy.filterGroupPrice}
              </legend>
              <p className="text-xs leading-relaxed text-brand-muted">{copy.filterPriceNote}</p>
              <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr_minmax(0,10rem)] lg:items-end lg:gap-4">
                <div>
                  <label htmlFor="filter-preciomin" className={fieldLabel}>
                    {copy.filterPriceMin}
                  </label>
                  <input
                    id="filter-preciomin"
                    name="precioMin"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    placeholder="—"
                    defaultValue={filters.precioMin ?? ""}
                    className={fieldInput}
                  />
                </div>
                <span className="hidden pb-3 text-center text-sm text-brand-subtle lg:block" aria-hidden>
                  —
                </span>
                <div>
                  <label htmlFor="filter-preciomax" className={fieldLabel}>
                    {copy.filterPriceMax}
                  </label>
                  <input
                    id="filter-preciomax"
                    name="precioMax"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    placeholder="—"
                    defaultValue={filters.precioMax ?? ""}
                    className={fieldInput}
                  />
                </div>
                <div className="lg:max-w-[11rem]">
                  <label htmlFor="filter-moneda" className={fieldLabel}>
                    {copy.filterCurrency}
                  </label>
                  <div className="relative">
                    <select
                      id="filter-moneda"
                      name="moneda"
                      defaultValue={filters.moneda ?? "MXN"}
                      className={`${fieldInput} appearance-none pr-11`}
                    >
                      <option value="MXN">{copy.filterCurrencyMXN}</option>
                      <option value="USD">{copy.filterCurrencyUSD}</option>
                    </select>
                    <SelectChevron className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                  </div>
                </div>
              </div>
            </fieldset>
          </div>

          <div className="flex flex-col gap-3 border-t border-brand-border/45 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex min-h-[2.75rem] flex-1 items-center justify-center rounded-full bg-brand-accent px-8 text-sm font-semibold text-brand-white shadow-[0_4px_14px_-4px_rgba(97,110,137,0.55)] transition hover:bg-brand-accent-strong sm:flex-none"
              >
                {copy.filterApply}
              </button>
              <Link
                href={catalogPageHref(locale, {})}
                className="inline-flex min-h-[2.75rem] flex-1 items-center justify-center rounded-full border border-brand-border/90 bg-transparent px-6 text-sm font-semibold text-brand-muted transition hover:border-brand-accent/50 hover:bg-brand-surface/80 hover:text-brand-text sm:flex-none"
              >
                {copy.filterReset}
              </Link>
            </div>
          </div>
        </form>
      </section>

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
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-accent">
                        {copy.zoneLabel}: {p.zone}
                      </p>
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
