import Image from "next/image";
import Link from "next/link";

import { homePath } from "@/i18n/home";
import type { NavItem } from "@/i18n/home";
import type { Locale } from "@/i18n/types";

/** Official YOU Soluciones Inmobiliarias social profiles. */
const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/yousimx" },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCpehP2_hvHX0WPcLQK-ki3Q",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/yousolucionesinmobiliarias/",
  },
] as const;

interface SiteHeaderProps {
  locale: Locale;
  navItems: readonly NavItem[];
  languageLabel: string;
}

/**
 * Sticky header — Wix uses white (#color_11), dark nav text (#color_15), hover toward #color_17.
 */
export function SiteHeader({ locale, navItems, languageLabel }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-brand-bg/95 shadow-[0_1px_4px_rgba(0,0,0,0.06)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href={homePath(locale)} className="group flex items-center gap-3 font-semibold tracking-tight text-brand-text">
          <Image
            src="/logo-you.svg"
            width={44}
            height={44}
            alt="YOU Soluciones Inmobiliarias"
            className="h-11 w-11 rounded-sm border border-brand-border bg-brand-white shadow-sm transition group-hover:border-brand-accent"
          />
          <span className="hidden leading-tight sm:block">
            <span className="block font-heading text-lg text-brand-text">Soluciones</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-muted">
              Inmobiliarias
            </span>
          </span>
        </Link>

        <nav
          className="order-last flex w-full justify-center gap-6 text-xs font-bold uppercase tracking-[0.14em] text-brand-text md:order-none md:w-auto md:justify-end md:gap-8 md:text-[13px]"
          aria-label="Principal"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-brand-accent-hover"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-muted">
          {SOCIAL_LINKS.map((s, i) => (
            <span key={s.label} className="flex items-center gap-2">
              {i > 0 ? (
                <span className="select-none text-brand-border" aria-hidden>
                  ·
                </span>
              ) : null}
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent">
                {s.label}
              </a>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">
          <span>{languageLabel}:</span>
          <Link
            href="/?lang=es"
            className={locale === "es" ? "text-brand-accent" : "hover:text-brand-accent"}
          >
            ES
          </Link>
          <span className="text-brand-border">/</span>
          <Link
            href="/?lang=en"
            className={locale === "en" ? "text-brand-accent" : "hover:text-brand-accent"}
          >
            EN
          </Link>
        </div>
      </div>
    </header>
  );
}
