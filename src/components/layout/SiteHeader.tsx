"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

import { IconFacebook, IconInstagram, IconYoutube, iconClasses } from "@/components/icons/SocialIcons";
import { LangSwitcher, LangSwitcherFallback } from "@/components/layout/LangSwitcher";
import { homePath } from "@/i18n/home";
import type { NavItem } from "@/i18n/home";
import type { Locale } from "@/i18n/types";

const HEADER_SOCIAL = [
  { label: "Facebook", href: "https://www.facebook.com/yousimx", Icon: IconFacebook },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCpehP2_hvHX0WPcLQK-ki3Q",
    Icon: IconYoutube,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/yousolucionesinmobiliarias/",
    Icon: IconInstagram,
  },
] as const;

interface SiteHeaderProps {
  locale: Locale;
  navItems: readonly NavItem[];
}

/**
 * Sticky header — refined chrome: pill nav on desktop, drawer on small screens, blurred surface.
 */
export function SiteHeader({ locale, navItems }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border/70 bg-brand-bg/85 shadow-[0_8px_30px_-12px_rgba(47,46,46,0.12)] backdrop-blur-md">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:gap-6 lg:px-8">
        <Link
          href={homePath(locale)}
          className="group flex shrink-0 items-center font-semibold tracking-tight text-brand-text"
        >
          <Image
            src="/logo-you-full.png"
            width={280}
            height={88}
            sizes="(max-width: 640px) 160px, 220px"
            alt="YOU. Soluciones inmobiliarias"
            className="h-9 w-auto max-w-[10.5rem] object-contain object-left transition-opacity group-hover:opacity-[0.92] sm:h-11 sm:max-w-[13.75rem]"
            priority
          />
        </Link>

        <nav className="hidden lg:flex lg:flex-1 lg:justify-center" aria-label="Principal">
          <ul className="flex items-center gap-0.5 rounded-full bg-brand-surface/95 px-1 py-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-brand-border/55">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-brand-text no-underline transition hover:bg-brand-bg hover:text-brand-accent-strong hover:shadow-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1.5 md:flex">
            {HEADER_SOCIAL.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                className="group flex h-9 w-9 items-center justify-center rounded-full bg-brand-surface/90 text-brand-muted ring-1 ring-brand-border/55 transition hover:bg-brand-accent hover:text-brand-white hover:ring-brand-accent"
              >
                <span className="sr-only">{label}</span>
                <Icon className={iconClasses()} />
              </a>
            ))}
          </div>

          <Suspense fallback={<LangSwitcherFallback locale={locale} />}>
            <LangSwitcher locale={locale} />
          </Suspense>

          <button
            type="button"
            className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-brand-border/80 bg-brand-surface/90 text-brand-text lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={
              mobileOpen
                ? locale === "en"
                  ? "Close menu"
                  : "Cerrar menú"
                : locale === "en"
                  ? "Open menu"
                  : "Abrir menú"
            }
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span
              className={`block h-0.5 w-5 rounded-full bg-current transition ${mobileOpen ? "translate-y-1.5 rotate-45" : ""}`}
            />
            <span className={`block h-0.5 w-5 rounded-full bg-current transition ${mobileOpen ? "opacity-0" : ""}`} />
            <span
              className={`block h-0.5 w-5 rounded-full bg-current transition ${mobileOpen ? "-translate-y-1.5 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`border-t border-brand-border/60 bg-brand-bg/98 lg:hidden ${mobileOpen ? "block" : "hidden"}`}
      >
        <nav className="mx-auto max-w-6xl space-y-1 px-4 py-4 sm:px-6" aria-label="Principal móvil">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-3 text-[13px] font-bold uppercase tracking-[0.12em] text-brand-text no-underline transition hover:bg-brand-surface hover:text-brand-accent-strong"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex items-center justify-center gap-3 border-t border-brand-border/60 pt-4">
            {HEADER_SOCIAL.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-surface text-brand-muted ring-1 ring-brand-border/55 transition hover:bg-brand-accent hover:text-brand-white"
                aria-label={label}
              >
                <Icon className={iconClasses()} />
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
