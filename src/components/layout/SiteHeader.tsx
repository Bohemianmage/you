"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

import { iconClasses } from "@/components/icons/SocialIcons";
import { LangSwitcher, LangSwitcherFallback } from "@/components/layout/LangSwitcher";
import { MARKETING_SOCIAL_LINKS } from "@/constants/marketing-social";
import { homePath } from "@/i18n/home";
import type { NavItem } from "@/i18n/home";
import type { Locale } from "@/i18n/types";
import { canonicalHrefFromNavString, firstHashFragment } from "@/lib/browser-url";

const HOME_SECTION_IDS = ["about"] as const;

interface SiteHeaderProps {
  locale: Locale;
  navItems: readonly NavItem[];
}

function parseNavHref(href: string): URL {
  return new URL(href, "https://yousoluciones.com");
}

function scrollToSectionHash(hash: string) {
  const id = firstHashFragment(hash);
  if (!id) return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Sticky header — refined chrome: pill nav on desktop, drawer on small screens, blurred surface.
 * Scroll espaciado en anclas del home, estado activo por ruta/sección y panel móvil animado.
 */
export function SiteHeader({ locale, navItems }: SiteHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileNavMounted, setMobileNavMounted] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) {
      setActiveSectionId(null);
      return;
    }

    const headerOffset = 100;

    const pickSectionFromScroll = () => {
      let current: string | null = null;
      for (const id of HOME_SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= headerOffset) current = id;
      }
      setActiveSectionId(current);
    };

    const syncHash = () => {
      const raw = firstHashFragment(window.location.hash);
      if (raw === "about") {
        setActiveSectionId(raw);
        return;
      }
      pickSectionFromScroll();
    };

    pickSectionFromScroll();
    syncHash();

    window.addEventListener("scroll", pickSectionFromScroll, { passive: true });
    window.addEventListener("hashchange", syncHash);
    return () => {
      window.removeEventListener("scroll", pickSectionFromScroll);
      window.removeEventListener("hashchange", syncHash);
    };
  }, [isHome]);

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

  useEffect(() => {
    setMobileNavMounted(true);
  }, []);

  function handleInPageNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (typeof window === "undefined") return;
    const dest = parseNavHref(href);
    const here = `${window.location.pathname}${window.location.search}`;
    const destLoc = `${dest.pathname}${dest.search}`;
    if (destLoc !== here) return;
    const fragment = firstHashFragment(dest.hash);
    if (!fragment) {
      setMobileOpen(false);
      return;
    }
    e.preventDefault();
    scrollToSectionHash(`#${fragment}`);
    window.history.pushState(window.history.state, "", canonicalHrefFromNavString(href));
    setMobileOpen(false);
    setActiveSectionId(fragment);
  }

  function isNavItemActive(item: NavItem): boolean {
    const u = parseNavHref(item.href);
    if (u.pathname === "/contacto") {
      return pathname === "/contacto";
    }
    if (u.pathname.startsWith("/propiedades")) {
      return pathname.startsWith("/propiedades");
    }
    if (u.pathname === "/" && u.hash) {
      const id = firstHashFragment(u.hash);
      return isHome && activeSectionId === id;
    }
    return false;
  }

  const desktopPillBase =
    "block rounded-full px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.1em] no-underline transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none";
  const desktopPillActive =
    "scale-[1.02] bg-brand-accent text-brand-white shadow-[0_2px_10px_rgba(26,30,97,0.32)] ring-1 ring-brand-accent/45";
  const desktopPillIdle =
    "text-brand-text hover:bg-brand-bg hover:text-brand-accent-strong hover:shadow-sm active:scale-[0.98]";

  const mobileLinkBase =
    "block rounded-md px-3 py-3 text-[13px] font-bold uppercase tracking-[0.12em] text-brand-text no-underline transition-colors duration-200 ease-out motion-reduce:transition-none";
  const mobileLinkActive = "bg-brand-accent/12 text-brand-accent-strong ring-1 ring-brand-accent/25";
  const mobileLinkIdle = "hover:bg-brand-surface hover:text-brand-accent-strong";

  const mobileNavPanel = (
    <div
      id="mobile-nav-panel"
      className={`fixed inset-0 z-[200] lg:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!mobileOpen}
    >
      <button
        type="button"
        className={`absolute inset-0 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          mobileOpen ? "bg-brand-text/35 opacity-100 backdrop-blur-[3px]" : "opacity-0"
        }`}
        tabIndex={mobileOpen ? 0 : -1}
        aria-label={locale === "en" ? "Close menu" : "Cerrar menú"}
        onClick={() => setMobileOpen(false)}
      />
      <div className="absolute inset-0 flex justify-end">
        <div
          className={`relative flex h-full min-h-0 w-[min(100%,22rem)] flex-col border-l border-white/15 bg-brand-bg/88 shadow-[0_0_40px_rgba(26,30,97,0.18)] backdrop-blur-xl transition-transform duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label={locale === "en" ? "Main menu" : "Menú principal"}
        >
          <nav
            className="min-h-0 shrink-0 overflow-y-auto px-4 pb-3 pt-8 sm:px-5"
            aria-label="Principal móvil"
          >
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active = isNavItemActive(item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      scroll={false}
                      onClick={(e) => handleInPageNavClick(e, item.href)}
                      aria-current={active ? "page" : undefined}
                      className={`${mobileLinkBase} ${active ? mobileLinkActive : mobileLinkIdle}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div
            className="flex min-h-0 flex-1 flex-col border-t border-brand-border/45 bg-brand-surface/45"
            role="group"
            aria-label={locale === "en" ? "Social media" : "Redes sociales"}
          >
            <div className="flex min-h-0 flex-1 flex-row items-stretch gap-1.5 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:gap-2 sm:p-3 sm:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {MARKETING_SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center rounded-sm bg-brand-bg/55 py-4 text-brand-muted ring-1 ring-brand-border/40 transition hover:bg-brand-accent hover:text-brand-white hover:ring-brand-accent sm:py-6"
                  aria-label={label}
                >
                  <Icon className="h-[min(2.25rem,11vmin)] w-[min(2.25rem,11vmin)] max-h-12 max-w-12 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header
        className={`sticky top-0 border-b border-brand-border/70 bg-brand-bg/85 shadow-[0_4px_20px_-10px_rgba(47,46,46,0.09)] backdrop-blur-md ${
          mobileOpen ? "z-[201]" : "z-50"
        }`}
      >
      <div className="relative mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-1 sm:px-5 lg:gap-5 lg:px-6 xl:max-w-5xl">
        <Link
          href={homePath(locale)}
          className="group flex shrink-0 items-center font-semibold tracking-tight text-brand-text"
        >
          <Image
            src="/logo-you-mark.png"
            width={256}
            height={256}
            sizes="(max-width: 640px) 96px, 112px"
            alt="YOU Soluciones Inmobiliarias"
            className="h-[72px] w-auto max-w-[5.5rem] object-contain object-left transition-opacity duration-200 group-hover:opacity-[0.92] sm:h-[88px] sm:max-w-[6.5rem]"
            priority
          />
        </Link>

        <nav className="hidden lg:flex lg:flex-1 lg:justify-center" aria-label="Principal">
          <ul className="flex items-center gap-1 rounded-full bg-brand-surface/95 px-1 py-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-brand-border/55">
            {navItems.map((item) => {
              const active = isNavItemActive(item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    scroll={false}
                    onClick={(e) => handleInPageNavClick(e, item.href)}
                    aria-current={active ? "page" : undefined}
                    className={`${desktopPillBase} ${active ? desktopPillActive : desktopPillIdle}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center gap-1 md:flex">
            {MARKETING_SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                className="group flex h-8 w-8 items-center justify-center rounded-full bg-brand-surface/90 text-brand-muted ring-1 ring-brand-border/55 transition hover:bg-brand-accent hover:text-brand-white hover:ring-brand-accent"
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
            className="flex h-9 w-9 shrink-0 flex-col items-center justify-center gap-0.5 rounded-md border border-brand-border/80 bg-brand-surface/90 text-brand-text transition-colors duration-300 lg:hidden"
            aria-expanded={mobileOpen}
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
              className={`block h-0.5 w-5 rounded-full bg-current transition duration-300 ease-out motion-reduce:transition-none ${mobileOpen ? "translate-y-1.5 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-current transition duration-300 ease-out motion-reduce:transition-none ${mobileOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-current transition duration-300 ease-out motion-reduce:transition-none ${mobileOpen ? "-translate-y-1.5 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      </header>
      {mobileNavMounted ? createPortal(mobileNavPanel, document.body) : null}
    </>
  );
}
