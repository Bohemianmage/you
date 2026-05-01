"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { PropertyVisitBooking } from "@/components/propiedades/PropertyVisitBooking";
import { ListingTypeBadge } from "@/components/propiedades/ListingTypeBadge";
import type { FeaturedProperty } from "@/data/properties";
import type { HomeCopy } from "@/i18n/home";
import type { Locale } from "@/i18n/types";
import { CATALOG_PAGE_COPY, PROPERTY_DETAIL_COPY } from "@/i18n/marketing-pages";
import { inferListingDisplayType } from "@/lib/catalog-filters";
import { propertyCoverImage } from "@/lib/property-media";
import { featuredPropertyDetailHref, featuredPropertySegment } from "@/lib/property-routes";

const ROTATION_MS = 6500;

/** Ancho del slide; mitad del min() coincide con scroll-padding para peek simétrico y tarjeta centrada (`snap-center`). */
const SLIDE_WIDTH_CLASS = "w-[min(78vw,22rem)] shrink-0 snap-center";
/** Padding horizontal del carril = (viewport − ancho slide) / 2 → misma porción visible a izquierda y derecha del centro. */
const SCROLL_SYMMETRIC_PAD =
  "scroll-pl-[calc(50%_-_min(39vw,11rem))] scroll-pr-[calc(50%_-_min(39vw,11rem))]";

type ExtSlide = {
  property: FeaturedProperty;
  reactKey: string;
  extIndex: number;
  realIndex: number;
  isClone: boolean;
};

function buildExtSlides(properties: readonly FeaturedProperty[]): ExtSlide[] {
  const n = properties.length;
  if (n === 0) return [];
  if (n === 1) {
    const p = properties[0];
    return [{ property: p, reactKey: p.id, extIndex: 0, realIndex: 0, isClone: false }];
  }
  const last = properties[n - 1];
  const first = properties[0];
  return [
    { property: last, reactKey: `clone-prev-${last.id}`, extIndex: 0, realIndex: n - 1, isClone: true },
    ...properties.map((p, i) => ({
      property: p,
      reactKey: p.id,
      extIndex: i + 1,
      realIndex: i,
      isClone: false as const,
    })),
    { property: first, reactKey: `clone-next-${first.id}`, extIndex: n + 1, realIndex: 0, isClone: true },
  ];
}

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
 * Carrusel con tarjeta activa centrada, laterales con el mismo “peek” visible, clones para bucle,
 * y agenda debajo de la propiedad activa.
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
  const bookingCopy = PROPERTY_DETAIL_COPY[locale];
  const badgeCopy = CATALOG_PAGE_COPY[locale];
  const reducedMotion = usePrefersReducedMotion();
  const n = properties.length;
  const extSlides = useMemo(() => buildExtSlides(properties), [properties]);
  const extLen = extSlides.length;

  const [activeReal, setActiveReal] = useState(0);
  const [paused, setPaused] = useState(false);
  const [featuredInView, setFeaturedInView] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const settlingRef = useRef(false);
  const scrollSettleTimerRef = useRef<number | null>(null);

  const scrollToExt = useCallback(
    (extIdx: number, smooth: boolean) => {
      const el = itemRefs.current[extIdx];
      if (!el) return;
      el.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: reducedMotion || !smooth ? "auto" : "smooth",
      });
    },
    [reducedMotion],
  );

  const readNearestExtIndex = useCallback((): number => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || extLen === 0) return n > 1 ? 1 : 0;
    const cx = scrollEl.scrollLeft + scrollEl.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < extLen; i++) {
      const slide = itemRefs.current[i];
      if (!slide) continue;
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const dist = Math.abs(slideCenter - cx);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
  }, [extLen, n]);

  const settleInfiniteScroll = useCallback(() => {
    if (n <= 1) return;
    if (settlingRef.current) return;
    const idx = readNearestExtIndex();
    if (idx === 0) {
      settlingRef.current = true;
      scrollToExt(n, false);
      setActiveReal(n - 1);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          settlingRef.current = false;
        });
      });
      return;
    }
    if (idx === n + 1) {
      settlingRef.current = true;
      scrollToExt(1, false);
      setActiveReal(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          settlingRef.current = false;
        });
      });
      return;
    }
    if (idx >= 1 && idx <= n) {
      setActiveReal(idx - 1);
    }
  }, [n, readNearestExtIndex, scrollToExt]);

  const scheduleSettle = useCallback(() => {
    if (scrollSettleTimerRef.current != null) window.clearTimeout(scrollSettleTimerRef.current);
    scrollSettleTimerRef.current = window.setTimeout(() => {
      scrollSettleTimerRef.current = null;
      settleInfiniteScroll();
    }, 140);
  }, [settleInfiniteScroll]);

  const propertyIds = useMemo(() => properties.map((p) => p.id).join(","), [properties]);

  useLayoutEffect(() => {
    if (n === 0) return;
    if (n === 1) {
      setActiveReal(0);
      scrollToExt(0, false);
      return;
    }
    setActiveReal(0);
    scrollToExt(1, false);
  }, [n, propertyIds, scrollToExt]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, extLen);
  }, [extLen]);

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

  const goNext = useCallback(() => {
    if (n <= 1) return;
    if (activeReal >= n - 1) {
      scrollToExt(n + 1, true);
      return;
    }
    const nextReal = activeReal + 1;
    setActiveReal(nextReal);
    scrollToExt(nextReal + 1, true);
  }, [n, activeReal, scrollToExt]);

  const goPrev = useCallback(() => {
    if (n <= 1) return;
    if (activeReal <= 0) {
      scrollToExt(0, true);
      return;
    }
    const prevReal = activeReal - 1;
    setActiveReal(prevReal);
    scrollToExt(prevReal + 1, true);
  }, [n, activeReal, scrollToExt]);

  useEffect(() => {
    if (n <= 1 || reducedMotion || paused || !featuredInView) return;
    const id = window.setInterval(goNext, ROTATION_MS);
    return () => window.clearInterval(id);
  }, [n, reducedMotion, paused, featuredInView, goNext]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (settlingRef.current) return;
      scheduleSettle();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (scrollSettleTimerRef.current != null) window.clearTimeout(scrollSettleTimerRef.current);
    };
  }, [scheduleSettle, settleInfiniteScroll]);

  if (n === 0) return null;

  const activeExtTarget = n > 1 ? activeReal + 1 : 0;
  const activeProperty = properties[activeReal] ?? properties[0];
  const dotLabel = (slot: number) => featuredCopy.carouselGoToAria.replace("{{n}}", String(slot));

  return (
    <div className="space-y-8">
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
              onClick={goPrev}
              className="absolute left-1 top-[32%] z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-brand-border/80 bg-brand-bg/95 text-brand-text shadow-md backdrop-blur-sm transition hover:border-brand-accent/40 hover:text-brand-accent-strong sm:left-2 md:left-0"
              aria-label={featuredCopy.carouselPrevAria}
            >
              <CarouselChevron dir="prev" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-1 top-[32%] z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-brand-border/80 bg-brand-bg/95 text-brand-text shadow-md backdrop-blur-sm transition hover:border-brand-accent/40 hover:text-brand-accent-strong sm:right-2 md:right-0"
              aria-label={featuredCopy.carouselNextAria}
            >
              <CarouselChevron dir="next" />
            </button>
          </>
        ) : null}

        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-visible scroll-pl-4 scroll-pr-4 pb-2 pt-1 [scrollbar-width:none] sm:gap-4 sm:scroll-pl-6 sm:scroll-pr-6 md:px-0 [&::-webkit-scrollbar]:hidden"
          aria-label={featuredCopy.title}
        >
          {extSlides.map((slide, i) => {
            const detailHref = featuredPropertyDetailHref(locale, slide.property);
            const cover = propertyCoverImage(slide.property) ?? null;
            const isActive = !slide.isClone && slide.extIndex === activeExtTarget;
            return (
              <div
                key={slide.reactKey}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className={SLIDE_WIDTH_CLASS}
              >
                <article
                  className={`flex h-full flex-col overflow-hidden rounded-sm border bg-brand-bg shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition-[transform,box-shadow,opacity,border-color] duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] motion-reduce:transition-none ${
                    isActive
                      ? "scale-100 border-brand-accent opacity-100 ring-2 ring-brand-accent/35"
                      : "scale-[0.96] border-brand-border opacity-[0.92]"
                  }`}
                >
                  <Link
                    href={detailHref}
                    className="group block text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
                  >
                    <div className="relative aspect-[16/10] bg-gradient-to-br from-brand-surface to-brand-border/60">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={slide.property.title}
                          fill
                          unoptimized={cover.startsWith("http")}
                          className="object-cover transition duration-300 group-hover:scale-[1.02]"
                          sizes="(max-width: 768px) 78vw, 22rem"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(47,46,46,0.08),transparent)]" />
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <ListingTypeBadge
                          kind={inferListingDisplayType({
                            listingType: slide.property.listingType,
                            status: slide.property.status,
                            title: slide.property.title,
                            specs: slide.property.specs,
                            ebOperations: slide.property.ebOperations,
                          })}
                          labels={{ rent: badgeCopy.listingBadgeRent, sale: badgeCopy.listingBadgeSale }}
                        />
                      </div>
                      <h3 className="font-heading text-lg font-semibold leading-snug text-brand-text group-hover:text-brand-accent-strong">
                        {slide.property.title}
                      </h3>
                      <p className="font-heading text-2xl font-semibold text-brand-text">{slide.property.price}</p>
                      <p className="text-sm leading-relaxed text-brand-muted">{slide.property.address}</p>
                    </div>
                  </Link>
                  <div className="mt-auto flex flex-col gap-2 border-t border-brand-border/50 px-6 pb-6 pt-4 sm:flex-row sm:flex-wrap">
                    <Link
                      href={detailHref}
                      className="inline-flex flex-1 items-center justify-center rounded-sm bg-brand-accent px-5 py-2.5 text-center text-xs font-bold uppercase tracking-[0.14em] text-brand-white transition hover:bg-brand-accent-strong sm:flex-none"
                    >
                      {featuredCopy.detailCta}
                    </Link>
                    {slide.property.tourUrl ? (
                      <a
                        href={slide.property.tourUrl}
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

        {n > 1 ? (
          <div className="mt-6 flex justify-center gap-2">
            {properties.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-current={i === activeReal ? true : undefined}
                aria-label={dotLabel(i + 1)}
                onClick={() => {
                  setActiveReal(i);
                  scrollToExt(i + 1, true);
                }}
                className={`h-2 rounded-full transition-all ${
                  i === activeReal ? "w-8 bg-brand-accent" : "w-2 bg-brand-border hover:bg-brand-subtle"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>

      {activeProperty ? (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <PropertyVisitBooking
            key={activeProperty.id}
            locale={locale}
            catalogId={activeProperty.id}
            segment={featuredPropertySegment(activeProperty)}
            copy={bookingCopy}
          />
        </div>
      ) : null}
    </div>
  );
}
