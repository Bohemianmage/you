"use client";

import { useEffect, useState } from "react";

const TOURS_BG_SRC = "/videos/virtual-tours-bg.mp4";

/**
 * Video de fondo de la sección de recorridos virtuales (silenciado, loop).
 * Respeta `prefers-reduced-motion`.
 */
export function VirtualToursBackdropVideo() {
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
        className="absolute inset-0 bg-gradient-to-br from-brand-surface via-brand-border/40 to-brand-accent/20"
        aria-hidden
      />
    );
  }

  return (
    <video
      className="absolute inset-0 h-full min-h-full w-full min-w-full object-cover"
      src={TOURS_BG_SRC}
      muted
      playsInline
      loop
      autoPlay
      preload="metadata"
      aria-hidden
    />
  );
}
