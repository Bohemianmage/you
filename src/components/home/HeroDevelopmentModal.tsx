"use client";

import { useEffect, useId, useState } from "react";

import type { HomeCopy } from "@/i18n/home";

const DISMISS_STORAGE_KEY = "you-soft-launch-modal-dismissed";

interface HeroDevelopmentModalProps {
  copy: HomeCopy["modal"];
}

function readDismissed(): boolean {
  try {
    return typeof sessionStorage !== "undefined" && sessionStorage.getItem(DISMISS_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function persistDismissed(): void {
  try {
    sessionStorage.setItem(DISMISS_STORAGE_KEY, "1");
  } catch {
    /* private mode / unavailable */
  }
}

/**
 * Soft-launch notice — informs visitors that the site is still being refined.
 * Dismissal is remembered for the browser tab/session so in-page navigation (e.g. #downloadables) does not reopen it.
 */
export function HeroDevelopmentModal({ copy }: HeroDevelopmentModalProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (readDismissed()) return;
    // Open only on client after mount — avoids SSR/hydration mismatch; storage isn’t available on the server.
    queueMicrotask(() => setOpen(true));
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const dismiss = () => {
    persistDismissed();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-brand-text/45 backdrop-blur-[3px]"
        aria-label={copy.closeA11y}
        onClick={dismiss}
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
        <button
          type="button"
          onClick={dismiss}
          className="mt-8 w-full rounded-sm bg-brand-accent py-3 text-sm font-semibold text-brand-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition hover:bg-brand-accent-strong sm:w-auto sm:px-8"
        >
          {copy.close}
        </button>
      </div>
    </div>
  );
}
