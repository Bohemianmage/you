"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { ListingTypeBadge } from "@/components/propiedades/ListingTypeBadge";
import type { FeaturedProperty } from "@/data/properties";
import type { HomeCopy } from "@/i18n/home";
import type { Locale } from "@/i18n/types";
import { inferListingDisplayType } from "@/lib/catalog-filters";
import { CATALOG_PAGE_COPY } from "@/i18n/marketing-pages";
import { propertyCoverImage } from "@/lib/property-media";
import { featuredPropertyDetailHref } from "@/lib/property-routes";

const ROTATION_MS = 6500;

/** Ancho de cada tarjeta: deja ~6–8% de vista previa a cada lado del slide activo. */
const SLIDE_WIDTH_CLASS =
  "w-[min(88vw,26rem)] sm:w-[min(52vw,28rem)] md:w-[min(48vw,30rem)] lg:w-[min(42rem,calc(100vw-14rem))]";

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

function FeaturedCardBody({
  property,
  badgeCopy,
  detailHref,
  cover,
  interactive,
}: {
  property: FeaturedProperty;
  badgeCopy: (typeof CATALOG_PAGE_COPY)["es"];
  detailHref: string;
  cover: string | null;
  interactive: boolean;
}) {
  const inner = (
    <>
      <div className="relative aspect-[16/10] bg-gradient-to-br from-brand-surface to-brand-border/60">
        {cover ? (
          <Image
            src={cover}
            alt={property.title}
            fill
            unoptimized={cover.startsWith("http")}
            className={`object-cover ${interactive ? "transition duration-300 group-hover:scale-[1.02]" : "opacity-95"}`}
            sizes="(max-width: 768px) 88vw, 50vw"
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
        <h3
          className={`font-heading text-lg font-semibold leading-snug text-brand-text ${interactive ? "group-hover:text-brand-accent-strong" : ""}`}
        >
          {property.title}
        </h3>
        <p className="font-heading text-2xl font-semibold text-brand-text">{property.price}</p>
        <p className="text-sm leading-relaxed text-brand-muted">{property.address}</p>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-accent">{property.status}</p>
      </div>
    </>
  );

  if (interactive) {
    return (
      <Link
        href={detailHref}
        className="group block text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
      >
        {inner}
      </Link>
    );
  }

  return <div className="text-left">{inner}</div>;
}

/**
 * Carrusel con slide central completa y vecinos a la vista; tap en lateral centra, luego se abre la ficha.
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
  /** Solo centrado horizontal y autoplay cuando una parte visible del bloque está en el viewport. */
  const [featuredInView, setFeaturedInView] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const next = useCallback(() => setIndex((i) => (i + 1) % n), [n]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + n) % n), [n]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setFeaturedInView(entry.isIntersecting && entry.intersectionRatio >= 0.12);
      },
      { root: null, threshold: [0, 0.12, 0.25, 0.5, 0.75, 1] },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (n <= 1 || reducedMotion || paused || !featuredInView) return;
    const id = window.setInterval(next, ROTATION_MS);
    return () => window.clearInterval(id);
  }, [n, reducedMotion, paused, featuredInView, next]);

  useEffect(() => {
    setIndex((i) => (n === 0 ? 0 : i % n));
  }, [n]);

  useEffect(() => {
    if (!featuredInView) return;
    const el = itemRefs.current[index];
    el?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [index, reducedMotion, featuredInView]);

  if (n === 0) return null;

  const dotLabel = (slot: number) => featuredCopy.carouselGoToAria.replace("{{n}}", String(slot));

  return (
    <div
      ref={containerRef}
      className="relative mx-auto max-w-6xl"
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
            className="absolute left-1 top-[36%] z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-brand-border/80 bg-brand-bg/95 text-brand-text shadow-md backdrop-blur-sm transition hover:border-brand-accent/40 hover:text-brand-accent-strong sm:left-2 md:left-0"
            aria-label={featuredCopy.carouselPrevAria}
          >
            <CarouselChevron dir="prev" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-1 top-[36%] z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-brand-border/80 bg-brand-bg/95 text-brand-text shadow-md backdrop-blur-sm transition hover:border-brand-accent/40 hover:text-brand-accent-strong sm:right-2 md:right-0"
            aria-label={featuredCopy.carouselNextAria}
          >
            <CarouselChevron dir="next" />
          </button>
        </>
      ) : null}

      <div
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-visible scroll-px-4 pb-2 pt-1 [scrollbar-width:none] sm:gap-4 md:px-2 [&::-webkit-scrollbar]:hidden"
        aria-label={featuredCopy.title}
      >
        {properties.map((property, i) => {
          const detailHref = featuredPropertyDetailHref(locale, property);
          const cover = propertyCoverImage(property) ?? null;
          const centered = i === index;
          return (
            <div
              key={property.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={`${SLIDE_WIDTH_CLASS} shrink-0 snap-center first:ml-3 last:mr-3 sm:first:ml-4 sm:last:mr-4`}
            >
              {centered ? (
                <article className="flex h-full flex-col overflow-hidden rounded-sm border border-brand-border bg-brand-bg shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                  <FeaturedCardBody property={property} badgeCopy={badgeCopy} detailHref={detailHref} cover={cover} interactive />
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
              ) : (
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  className="group block h-full w-full rounded-sm border border-brand-border/70 bg-brand-bg/95 text-left shadow-sm transition hover:border-brand-accent/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
                  aria-label={featuredCopy.carouselCenterAria}
                >
                  <article className="pointer-events-none flex h-full flex-col overflow-hidden rounded-sm">
                    <FeaturedCardBody property={property} badgeCopy={badgeCopy} detailHref={detailHref} cover={cover} interactive={false} />
                    <div className="border-t border-brand-border/40 px-6 py-3 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">
                      {featuredCopy.carouselTapToCenter}
                    </div>
                  </article>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {n > 1 ? (
        <div className="mt-6 flex justify-center gap-2">
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
