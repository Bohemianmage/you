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
 * Sticky site header with brand mark, in-page navigation, and social links.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-muted/15 bg-brand-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-brand-ink"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-accent/15 text-sm font-bold text-brand-accent"
            aria-hidden
          >
            YOU
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-brand-ink">Soluciones</span>
            <span className="block text-xs font-normal text-brand-muted">
              Inmobiliarias
            </span>
          </span>
        </Link>

        <nav
          className="order-last flex w-full justify-center gap-6 text-sm font-medium text-brand-text md:order-none md:w-auto md:justify-end"
          aria-label="Principal"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-brand-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-xs font-medium text-brand-muted">
          {SOCIAL_PLACEHOLDERS.map((s, i) => (
            <span key={s.label} className="flex items-center gap-3">
              {i > 0 ? <span className="text-brand-muted/40" aria-hidden>|</span> : null}
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-brand-accent"
              >
                {s.label}
              </a>
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
