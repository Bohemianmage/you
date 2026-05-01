import Link from "next/link";

import type { Locale } from "@/i18n/types";

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChat({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Acciones claras arriba del listado: inicio y contacto con asesor.
 */
export function CatalogPageToolbar({
  locale,
  homeHref,
  contactHref,
  backHomeLabel,
  contactLabel,
}: {
  locale: Locale;
  homeHref: string;
  contactHref: string;
  backHomeLabel: string;
  contactLabel: string;
}) {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-brand-border/55 bg-gradient-to-br from-brand-surface/80 via-brand-bg to-brand-bg p-4 shadow-[0_6px_28px_-18px_rgba(26,30,97,0.25)] sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-end sm:gap-3 sm:p-4"
      role="navigation"
      aria-label={locale === "en" ? "Page shortcuts" : "Accesos rápidos"}
    >
      <Link
        href={homeHref}
        className="inline-flex min-h-[2.75rem] flex-1 items-center justify-center gap-2 rounded-full border border-brand-border/90 bg-brand-bg px-5 text-sm font-semibold text-brand-text shadow-sm transition hover:border-brand-accent/35 hover:bg-brand-surface sm:flex-none sm:px-6"
      >
        <IconHome className="shrink-0 text-brand-accent" />
        {backHomeLabel}
      </Link>
      <Link
        href={contactHref}
        className="inline-flex min-h-[2.75rem] flex-1 items-center justify-center gap-2 rounded-full bg-brand-accent px-5 text-sm font-semibold text-brand-white shadow-[0_4px_16px_-6px_rgba(26,30,97,0.38)] transition hover:bg-brand-accent-strong sm:flex-none sm:px-6"
      >
        <IconChat className="shrink-0 opacity-95" />
        {contactLabel}
      </Link>
    </div>
  );
}
