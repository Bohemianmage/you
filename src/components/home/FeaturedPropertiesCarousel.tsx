"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ListingTypeBadge } from "@/components/propiedades/ListingTypeBadge";
import type { FeaturedProperty } from "@/data/properties";
import type { HomeCopy } from "@/i18n/home";
import type { Locale } from "@/i18n/types";
import { inferListingDisplayType } from "@/lib/catalog-filters";
import { CATALOG_PAGE_COPY } from "@/i18n/marketing-pages";
import { propertyCoverImage } from "@/lib/property-media";
import { featuredPropertyDetailHref } from "@/lib/property-routes";

const ROTATION_MS = 6500;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

function CarouselChevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      {dir === "prev" ? <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /> : null}
      {dir === "next" ? <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /> : null}
    </svg>
  );
}

/**
 * Carrusel con rotación suave; se pausa al hover o al enfocar controles (accesible).
 */
export function FeaturedPropertiesCarousel({
  locale,
  featuredCopy,
  properties,
}: {
  locale: Locale;
  featuredCopy: HomeCopy["featured"];
  properties: readonly FeaturedProperty[];
}) {
  const badgeCopy = CATALOG_PAGE_COPY[locale];
  const reducedMotion = usePrefersReducedMotion();
  const n = properties.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % n), [n]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + n) % n), [n]);

  useEffect(() => {
    if (n <= 1 || reducedMotion || paused) return;
    const id = window.setInterval(next, ROTATION_MS);
    return () => window.clearInterval(id);
  }, [n, reducedMotion, paused, next]);

  useEffect(() => {
    setIndex((i) => (n === 0 ? 0 : i % n));
  }, [n]);

  if (n === 0) return null;

  const dotLabel = (slot: number) => featuredCopy.carouselGoToAria.replace("{{n}}", String(slot));

  return (
    <div
      className="relative mx-auto max-w-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      {n > 1 ? (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-0 top-[38%] z-10 flex h-11 w-11 -translate-x-2 -translate-y-1/2 items-center justify-center rounded-full border border-brand-border/80 bg-brand-bg/95 text-brand-text shadow-md backdrop-blur-sm transition hover:border-brand-accent/40 hover:text-brand-accent-strong sm:-translate-x-4 md:-translate-x-7"
            aria-label={featuredCopy.carouselPrevAria}
          >
            <CarouselChevron dir="prev" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-0 top-[38%] z-10 flex h-11 w-11 translate-x-2 -translate-y-1/2 items-center justify-center rounded-full border border-brand-border/80 bg-brand-bg/95 text-brand-text shadow-md backdrop-blur-sm transition hover:border-brand-accent/40 hover:text-brand-accent-strong sm:translate-x-4 md:translate-x-7"
            aria-label={featuredCopy.carouselNextAria}
          >
            <CarouselChevron dir="next" />
          </button>
        </>
      ) : null}

      <div className="overflow-hidden rounded-sm px-1">
        <div
          className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {properties.map((property) => {
            const detailHref = featuredPropertyDetailHref(locale, property);
            const cover = propertyCoverImage(property);
            return (
              <div key={property.id} className="min-w-full shrink-0 px-2 sm:px-4">
                <article className="flex h-full flex-col overflow-hidden rounded-sm border border-brand-border bg-brand-bg shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                  <Link
                    href={detailHref}
                    className="group block text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
                  >
                    <div className="relative aspect-[16/10] bg-gradient-to-br from-brand-surface to-brand-border/60">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={property.title}
                          fill
                          unoptimized={cover.startsWith("http")}
                          className="object-cover transition duration-300 group-hover:scale-[1.02]"
                          sizes="(max-width: 768px) 100vw, 768px"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(47,46,46,0.08),transparent)]" />
                    </div>
                    <div className="flex flex-1 flex-col gap-4 p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <ListingTypeBadge
                          kind={inferListingDisplayType({
                            listingType: property.listingType,
                            status: property.status,
                            title: property.title,
                          })}
                          labels={{ rent: badgeCopy.listingBadgeRent, sale: badgeCopy.listingBadgeSale }}
                        />
                      </div>
                      <h3 className="font-heading text-lg font-semibold leading-snug text-brand-text group-hover:text-brand-accent-strong">
                        {property.title}
                      </h3>
                      <p className="font-heading text-2xl font-semibold text-brand-text">{property.price}</p>
                      <p className="text-sm leading-relaxed text-brand-muted">{property.address}</p>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-accent">{property.status}</p>
                    </div>
                  </Link>
                  <div className="mt-auto flex flex-col gap-2 border-t border-brand-border/50 px-6 pb-6 pt-4 sm:flex-row sm:flex-wrap">
                    <Link
                      href={detailHref}
                      className="inline-flex flex-1 items-center justify-center rounded-sm bg-brand-accent px-5 py-2.5 text-center text-xs font-bold uppercase tracking-[0.14em] text-brand-white transition hover:bg-brand-accent-strong sm:flex-none"
                    >
                      {featuredCopy.detailCta}
                    </Link>
                    {property.tourUrl ? (
                      <a
                        href={property.tourUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-1 items-center justify-center rounded-sm border border-brand-accent bg-transparent px-5 py-2.5 text-center text-xs font-bold uppercase tracking-[0.14em] text-brand-accent transition hover:bg-brand-accent hover:text-brand-white sm:flex-none"
                      >
                        {featuredCopy.virtualTourCta}
                      </a>
                    ) : null}
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      {n > 1 ? (
        <div className="mt-6 flex justify-center gap-2" aria-label={featuredCopy.title}>
          {properties.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-current={i === index ? true : undefined}
              aria-label={dotLabel(i + 1)}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-8 bg-brand-accent" : "w-2 bg-brand-border hover:bg-brand-subtle"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
