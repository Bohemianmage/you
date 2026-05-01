"use client";

import { useEffect, useState } from "react";

const DEFAULT_SRC = "/videos/hero-mexico-city.mp4";

/**
 * Video de fondo del bloque principal del hero (silenciado, loop).
 * Respeta `prefers-reduced-motion`: muestra degradado estático sin reproducir.
 */
export function HeroBackdropVideo({ src = DEFAULT_SRC }: { src?: string }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (reduceMotion) {
    return (
      <div
        className="absolute inset-0 bg-gradient-to-br from-brand-surface via-brand-border/45 to-brand-accent/25"
        aria-hidden
      />
    );
  }

  return (
    <video
      className="absolute inset-0 h-full min-h-full w-full min-w-full object-cover"
      src={src}
      muted
      playsInline
      loop
      autoPlay
      preload="metadata"
      aria-hidden
    />
  );
}
