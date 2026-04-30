import Link from "next/link";

/** Primary navigation entries aligned with the legacy Wix IA. */
const NAV_ITEMS = [
  { href: "#about", label: "Nosotros" },
  { href: "#featured-properties", label: "Propiedades" },
  { href: "#downloadables", label: "Descargables" },
  { href: "#contact", label: "Contacto" },
] as const;

/** Visual-only social placeholders (URLs can be wired when profiles are confirmed). */
const SOCIAL_PLACEHOLDERS = [
  { label: "Facebook", href: "https://www.facebook.com/" },
  { label: "YouTube", href: "https://www.youtube.com/" },
  { label: "Instagram", href: "https://www.instagram.com/" },
] as const;

/**
 * Sticky header — Wix uses white (#color_11), dark nav text (#color_15), hover toward #color_17.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-brand-bg/95 shadow-[0_1px_4px_rgba(0,0,0,0.06)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3 font-semibold tracking-tight text-brand-text">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-sm border border-brand-border bg-brand-white text-xs font-bold uppercase tracking-wide text-brand-accent shadow-sm transition group-hover:border-brand-accent"
            aria-hidden
          >
            YOU
          </span>
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
          {NAV_ITEMS.map((item) => (
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
          {SOCIAL_PLACEHOLDERS.map((s, i) => (
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
      </div>
    </header>
  );
}
