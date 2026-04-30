"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { Locale } from "@/i18n/types";

interface LangSwitcherProps {
  locale: Locale;
}

function buildHref(pathname: string, searchParams: URLSearchParams | null, target: Locale): string {
  const params = new URLSearchParams(searchParams?.toString() ?? "");
  if (target === "en") {
    params.set("lang", "en");
  } else {
    params.delete("lang");
  }
  const query = params.toString();
  const path = pathname || "/";
  return query ? `${path}?${query}` : path;
}

const pillShell =
  "flex items-center rounded-full bg-brand-surface/95 p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-brand-border/55";

const pillSegment =
  "min-w-[2.25rem] rounded-full px-2.5 py-1.5 text-center text-[11px] font-bold uppercase tracking-[0.14em] no-underline transition";

/** Preserves path + query when switching ES ↔ EN (requires Suspense boundary parent). */
export function LangSwitcher({ locale }: LangSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div
      role="group"
      aria-label={locale === "en" ? "Language" : "Idioma"}
      className={pillShell}
    >
      <Link
        href={buildHref(pathname ?? "/", searchParams, "es")}
        className={`${pillSegment} ${
          locale === "es"
            ? "bg-brand-accent text-brand-white shadow-sm"
            : "text-brand-muted hover:bg-brand-bg hover:text-brand-text"
        }`}
        hrefLang="es"
      >
        ES
      </Link>
      <Link
        href={buildHref(pathname ?? "/", searchParams, "en")}
        className={`${pillSegment} ${
          locale === "en"
            ? "bg-brand-accent text-brand-white shadow-sm"
            : "text-brand-muted hover:bg-brand-bg hover:text-brand-text"
        }`}
        hrefLang="en"
      >
        EN
      </Link>
    </div>
  );
}

export function LangSwitcherFallback({ locale }: LangSwitcherProps) {
  return (
    <div role="group" aria-label={locale === "en" ? "Language" : "Idioma"} className={pillShell}>
      <span
        className={`${pillSegment} select-none ${locale === "es" ? "bg-brand-accent text-brand-white shadow-sm" : "text-brand-muted"}`}
      >
        ES
      </span>
      <span
        className={`${pillSegment} select-none ${locale === "en" ? "bg-brand-accent text-brand-white shadow-sm" : "text-brand-muted"}`}
      >
        EN
      </span>
    </div>
  );
}
