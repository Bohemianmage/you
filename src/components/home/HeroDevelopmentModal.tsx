"use client";

import { useEffect, useId, useState } from "react";

import type { HomeCopy } from "@/i18n/home";

interface HeroDevelopmentModalProps {
  copy: HomeCopy["modal"];
}

/**
 * Modal shown over the hero to communicate that the new site is still being finished.
 */
export function HeroDevelopmentModal({ copy }: HeroDevelopmentModalProps) {
  const [open, setOpen] = useState(true);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-brand-text/40 backdrop-blur-[2px]"
        aria-label={copy.closeA11y}
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[101] w-full max-w-md rounded-sm border border-brand-border bg-brand-bg p-6 shadow-[0_8px_32px_rgba(0,0,0,0.18)] sm:p-8"
      >
        <h2 id={titleId} className="font-heading text-xl font-semibold text-brand-text sm:text-2xl">
          {copy.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-brand-muted">{copy.message}</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-6 w-full rounded-sm bg-brand-accent py-3 text-sm font-semibold text-brand-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition hover:bg-brand-accent-strong sm:w-auto sm:px-8"
        >
          {copy.close}
        </button>
      </div>
    </div>
  );
}
