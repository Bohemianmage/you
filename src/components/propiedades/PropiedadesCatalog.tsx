"use client";

import Image from "next/image";
import Link from "next/link";

import { useSiteContentEditOptional } from "@/components/admin/site-content-edit-provider";
import type { CatalogProperty } from "@/data/catalog-properties";
import { CATALOG_PAGE_COPY } from "@/i18n/marketing-pages";
import type { Locale } from "@/i18n/types";
import { catalogDetailHref } from "@/lib/property-routes";
import { mergePublicCatalogFromFile } from "@/lib/site-content/merge-public";
import type { SiteContentFile } from "@/lib/site-content/types";

type CatalogCopy = (typeof CATALOG_PAGE_COPY)[Locale];

export function PropiedadesCatalog({
  locale,
  serverCatalog,
  copy,
  contactHref,
}: {
  locale: Locale;
  serverCatalog: CatalogProperty[];
  copy: CatalogCopy;
  contactHref: string;
}) {
  const edit = useSiteContentEditOptional();
  const catalog = edit ? mergePublicCatalogFromFile(edit.working as SiteContentFile) : serverCatalog;

  return (
    <div className="space-y-10">
      {edit ? (
        <p className="text-xs text-brand-muted">
          <Link href="/admin/listas" className="font-semibold text-brand-accent no-underline hover:underline">
            Editar catálogo y fichas
          </Link>{" "}
          (pestaña Catálogo en el panel).
        </p>
      ) : null}
      <ul className="grid gap-8 md:grid-cols-2">
        {catalog.map((p) => {
          const detailHref = catalogDetailHref(locale, p);
          return (
            <li key={p.id}>
              <article className="flex h-full flex-col overflow-hidden rounded-sm border border-brand-border bg-brand-surface shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
                <Link href={detailHref} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2">
                  <div className="relative aspect-[16/10] bg-gradient-to-br from-brand-bg to-brand-border/40">
                    {p.imageSrc ? (
                      <Image
                        src={p.imageSrc}
                        alt={p.title}
                        fill
                        unoptimized={p.imageSrc.startsWith("http")}
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
                    <h2 className="mt-2 font-heading text-xl font-semibold text-brand-text group-hover:text-brand-accent-strong">{p.title}</h2>
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
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
