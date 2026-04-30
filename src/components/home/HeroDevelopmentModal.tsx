"use client";

import { useEffect, useId, useState } from "react";

import { SITE_CONTACT } from "@/constants/site-contact";
import type { HomeCopy } from "@/i18n/home";

interface HeroDevelopmentModalProps {
  copy: HomeCopy["modal"];
  /** Short labels for inline contact (reuse footer wording where possible). */
  phoneLabel: string;
}

/**
 * Soft-launch notice — informs visitors that the site is still being refined and surfaces office contact.
 */
export function HeroDevelopmentModal({ copy, phoneLabel }: HeroDevelopmentModalProps) {
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
        className="absolute inset-0 bg-brand-text/45 backdrop-blur-[3px]"
        aria-label={copy.closeA11y}
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[101] w-full max-w-md rounded-sm border border-brand-border bg-brand-bg p-6 shadow-[0_8px_32px_rgba(0,0,0,0.18)] sm:max-w-lg sm:p-8"
      >
        <h2 id={titleId} className="font-heading text-xl font-semibold text-brand-text sm:text-2xl">
          {copy.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-brand-muted">{copy.message}</p>
        <div className="mt-6 rounded-sm border border-brand-border bg-brand-surface px-4 py-3 text-sm text-brand-muted">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-accent">{copy.contactHeading}</p>
          <address className="mt-2 not-italic leading-relaxed">{SITE_CONTACT.addressLine}</address>
          <p className="mt-2">
            {phoneLabel}{" "}
            <a href={SITE_CONTACT.phoneHref} className="font-semibold text-brand-accent hover:text-brand-accent-strong">
              {SITE_CONTACT.phoneDisplay}
            </a>
          </p>
        </div>
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
