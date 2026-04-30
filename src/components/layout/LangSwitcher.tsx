"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { Locale } from "@/i18n/types";

interface LangSwitcherProps {
  locale: Locale;
  languageLabel: string;
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

/** Preserves path + query when switching ES ↔ EN (requires Suspense boundary parent). */
export function LangSwitcher({ locale, languageLabel }: LangSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted">
      <span className="hidden text-brand-subtle sm:inline">{languageLabel}</span>
      <div className="flex items-center rounded-full bg-brand-surface/90 px-1 py-0.5 ring-1 ring-brand-border/50">
        <Link
          href={buildHref(pathname ?? "/", searchParams, "es")}
          className={`rounded-full px-2.5 py-1 no-underline transition ${
            locale === "es"
              ? "bg-brand-accent text-brand-white shadow-sm"
              : "text-brand-muted hover:text-brand-text"
          }`}
          hrefLang="es"
        >
          ES
        </Link>
        <Link
          href={buildHref(pathname ?? "/", searchParams, "en")}
          className={`rounded-full px-2.5 py-1 no-underline transition ${
            locale === "en"
              ? "bg-brand-accent text-brand-white shadow-sm"
              : "text-brand-muted hover:text-brand-text"
          }`}
          hrefLang="en"
        >
          EN
        </Link>
      </div>
    </div>
  );
}

export function LangSwitcherFallback({ locale, languageLabel }: LangSwitcherProps) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted">
      <span className="hidden text-brand-subtle sm:inline">{languageLabel}</span>
      <div className="flex items-center rounded-full bg-brand-surface/90 px-2 py-1 ring-1 ring-brand-border/50">
        <span className={locale === "es" ? "px-2 text-brand-accent" : "px-2 opacity-50"}>ES</span>
        <span className="text-brand-border">/</span>
        <span className={locale === "en" ? "px-2 text-brand-accent" : "px-2 opacity-50"}>EN</span>
      </div>
    </div>
  );
}
