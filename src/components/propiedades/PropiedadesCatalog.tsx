"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { useSiteContentEditOptional } from "@/components/admin/site-content-edit-provider";
import type { CatalogProperty } from "@/data/catalog-properties";
import { filterCatalogProperties } from "@/lib/catalog-filters";
import {
  catalogPageHref,
  type CatalogQueryFilters,
  type ListingTypeFilter,
} from "@/lib/catalog-query";
import { CATALOG_PAGE_COPY } from "@/i18n/marketing-pages";
import type { Locale } from "@/i18n/types";
import { propertyCoverImage } from "@/lib/property-media";
import { catalogDetailHref } from "@/lib/property-routes";
import { mergePublicCatalogFromFile } from "@/lib/site-content/merge-public";
import type { SiteContentFile } from "@/lib/site-content/types";

type CatalogCopy = (typeof CATALOG_PAGE_COPY)[Locale];

function filterChipClass(active: boolean): string {
  const base =
    "inline-flex items-center justify-center rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition motion-reduce:transition-none";
  if (active) {
    return `${base} border-brand-accent bg-brand-accent text-brand-white shadow-[0_2px_10px_rgba(97,110,137,0.35)]`;
  }
  return `${base} border-brand-border/80 bg-brand-bg text-brand-text hover:border-brand-accent/40 hover:bg-brand-surface`;
}

const fieldLabel = "mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted";
const fieldInput =
  "w-full rounded-sm border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] ring-0 transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/25";

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

  const hrefTipo = (t: ListingTypeFilter) => catalogPageHref(locale, { ...filters, tipo: t });
  const filterFormKey = JSON.stringify(filters);

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

      <div className="flex flex-col gap-4 border-b border-brand-border/70 pb-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted">{copy.filterHeading}</p>
        <div className="flex flex-wrap gap-2">
          <Link href={hrefTipo("")} className={filterChipClass(tipo === "")}>
            {copy.filterAll}
          </Link>
          <Link href={hrefTipo("rent")} className={filterChipClass(tipo === "rent")}>
            {copy.filterRent}
          </Link>
          <Link href={hrefTipo("sale")} className={filterChipClass(tipo === "sale")}>
            {copy.filterSale}
          </Link>
        </div>
      </div>

      <section className="rounded-sm border border-brand-border/80 bg-brand-surface/60 p-5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] sm:p-6">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.12em] text-brand-text">
          {copy.filtersDetailHeading}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-brand-muted">{copy.filterPriceNote}</p>

        <form key={filterFormKey} method="get" action="/propiedades" className="mt-6 space-y-6">
          {locale === "en" ? <input type="hidden" name="lang" value="en" /> : null}
          {(filters.tipo === "rent" || filters.tipo === "sale") ? (
            <input type="hidden" name="tipo" value={filters.tipo} />
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="filter-zone" className={fieldLabel}>
                {copy.zoneLabel}
              </label>
              <select
                id="filter-zone"
                name="zone"
                defaultValue={filters.zone ?? ""}
                className={fieldInput}
              >
                <option value="">{copy.filterZoneAll}</option>
                {zones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-m2min" className={fieldLabel}>
                {copy.filterM2Min}
              </label>
              <input
                id="filter-m2min"
                name="m2Min"
                type="number"
                min={0}
                step={1}
                defaultValue={filters.m2Min ?? ""}
                className={fieldInput}
              />
            </div>
            <div>
              <label htmlFor="filter-m2max" className={fieldLabel}>
                {copy.filterM2Max}
              </label>
              <input
                id="filter-m2max"
                name="m2Max"
                type="number"
                min={0}
                step={1}
                defaultValue={filters.m2Max ?? ""}
                className={fieldInput}
              />
            </div>

            <div>
              <label htmlFor="filter-recmin" className={fieldLabel}>
                {copy.filterBedMin}
              </label>
              <input
                id="filter-recmin"
                name="recMin"
                type="number"
                min={0}
                step={1}
                defaultValue={filters.recMin ?? ""}
                className={fieldInput}
              />
            </div>
            <div>
              <label htmlFor="filter-recmax" className={fieldLabel}>
                {copy.filterBedMax}
              </label>
              <input
                id="filter-recmax"
                name="recMax"
                type="number"
                min={0}
                step={1}
                defaultValue={filters.recMax ?? ""}
                className={fieldInput}
              />
            </div>

            <div>
              <label htmlFor="filter-banmin" className={fieldLabel}>
                {copy.filterBathMin}
              </label>
              <input
                id="filter-banmin"
                name="banMin"
                type="number"
                min={0}
                step={1}
                defaultValue={filters.banMin ?? ""}
                className={fieldInput}
              />
            </div>
            <div>
              <label htmlFor="filter-banmax" className={fieldLabel}>
                {copy.filterBathMax}
              </label>
              <input
                id="filter-banmax"
                name="banMax"
                type="number"
                min={0}
                step={1}
                defaultValue={filters.banMax ?? ""}
                className={fieldInput}
              />
            </div>

            <div>
              <label htmlFor="filter-preciomin" className={fieldLabel}>
                {copy.filterPriceMin}
              </label>
              <input
                id="filter-preciomin"
                name="precioMin"
                type="number"
                min={0}
                step="any"
                defaultValue={filters.precioMin ?? ""}
                className={fieldInput}
              />
            </div>
            <div>
              <label htmlFor="filter-preciomax" className={fieldLabel}>
                {copy.filterPriceMax}
              </label>
              <input
                id="filter-preciomax"
                name="precioMax"
                type="number"
                min={0}
                step="any"
                defaultValue={filters.precioMax ?? ""}
                className={fieldInput}
              />
            </div>
            <div>
              <label htmlFor="filter-moneda" className={fieldLabel}>
                {copy.filterCurrency}
              </label>
              <select
                id="filter-moneda"
                name="moneda"
                defaultValue={filters.moneda ?? "MXN"}
                className={fieldInput}
              >
                <option value="MXN">{copy.filterCurrencyMXN}</option>
                <option value="USD">{copy.filterCurrencyUSD}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-brand-border/60 pt-5">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-sm bg-brand-accent px-6 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-white transition hover:bg-brand-accent-strong"
            >
              {copy.filterApply}
            </button>
            <Link
              href={catalogPageHref(locale, {})}
              className="inline-flex items-center justify-center rounded-sm border border-brand-border px-6 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-text transition hover:border-brand-accent hover:text-brand-accent-strong"
            >
              {copy.filterReset}
            </Link>
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
                  <div className="mt-auto flex flex-col gap-2 border-t border-brand-border/60 px-6 pb-6 pt-4 sm:flex-row sm:flex-wrap">
                    <Link
                      href={detailHref}
                      className="inline-flex flex-1 items-center justify-center rounded-sm bg-brand-accent px-5 py-2.5 text-center text-xs font-bold uppercase tracking-[0.14em] text-brand-white transition hover:bg-brand-accent-strong sm:flex-none"
                    >
                      {copy.viewListingCta}
                    </Link>
                    <Link
                      href={contactHref}
                      className="inline-flex flex-1 items-center justify-center rounded-sm border border-brand-accent px-5 py-2.5 text-center text-xs font-bold uppercase tracking-[0.14em] text-brand-accent transition hover:bg-brand-accent hover:text-brand-white sm:flex-none"
                    >
                      {copy.contactCta}
                    </Link>
                    {p.tourUrl ? (
                      <a
                        href={p.tourUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-1 items-center justify-center rounded-sm border border-brand-accent px-5 py-2.5 text-center text-xs font-bold uppercase tracking-[0.14em] text-brand-accent transition hover:bg-brand-accent hover:text-brand-white sm:flex-none"
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
