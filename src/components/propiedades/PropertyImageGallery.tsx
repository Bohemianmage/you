"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

const swipePx = 56;

export function PropertyImageGallery({
  images,
  alt,
}: {
  images: readonly string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const n = images.length;

  const go = useCallback(
    (delta: number) => {
      if (n <= 1) return;
      setIndex((i) => (i + delta + n) % n);
    },
    [n],
  );

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null || n <= 1) return;
    const end = e.changedTouches[0]?.clientX ?? start;
    const d = end - start;
    if (Math.abs(d) < swipePx) return;
    go(d < 0 ? 1 : -1);
  };

  if (n === 0) return null;

  const src = images[index];
  const remote = src.startsWith("http");

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-[16/10] overflow-hidden rounded-sm border border-brand-border shadow-[0_1px_4px_rgba(0,0,0,0.2)]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          src={src}
          alt={`${alt} — ${index + 1} / ${n}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 896px"
          priority={index === 0}
          unoptimized={remote}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(47,46,46,0.06),transparent)]" />
        {n > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 z-[1] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-brand-border/80 bg-brand-bg/90 text-lg font-semibold text-brand-text shadow-md backdrop-blur-sm transition hover:bg-brand-accent hover:text-brand-white md:inline-flex"
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 z-[1] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-brand-border/80 bg-brand-bg/90 text-lg font-semibold text-brand-text shadow-md backdrop-blur-sm transition hover:bg-brand-accent hover:text-brand-white md:inline-flex"
              aria-label="Siguiente"
            >
              ›
            </button>
          </>
        ) : null}
      </div>
      {n > 1 ? (
        <div className="flex justify-center gap-2" role="tablist" aria-label="Galería">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === index}
              className={`h-2 w-2 rounded-full transition ${idx === index ? "scale-110 bg-brand-accent" : "bg-brand-border hover:bg-brand-muted"}`}
              onClick={() => setIndex(idx)}
              aria-label={`Imagen ${idx + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
