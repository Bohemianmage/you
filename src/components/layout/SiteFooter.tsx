import Link from "next/link";

import { withYouWordmark } from "@/components/brand/you-wordmark";
import { iconClasses } from "@/components/icons/SocialIcons";
import { MARKETING_SOCIAL_LINKS } from "@/constants/marketing-social";
import type { SiteContact } from "@/constants/site-contact";
import { TEXT_LINK_INLINE } from "@/lib/link-styles";
import { localeQuery, type HomeCopy, type NavItem } from "@/i18n/home";
import type { Locale } from "@/i18n/types";

interface SiteFooterProps {
  locale: Locale;
  navItems: readonly NavItem[];
  footerCopy: HomeCopy["footer"];
  contact: SiteContact;
}

/** Enlaces columna derecha — misma base y hover que el resto de marketing. */
const FOOTER_ASIDE_LINK =
  "text-[12px] font-bold uppercase tracking-[0.14em] text-brand-muted no-underline transition-colors hover:text-brand-accent-strong";

/**
 * Pie — tipografía clara, redes y navegación en ritmo de marca.
 */
export function SiteFooter({ locale, navItems, footerCopy, contact }: SiteFooterProps) {
  return (
    <footer className="relative mt-auto border-t border-brand-border bg-gradient-to-b from-brand-surface/90 via-brand-bg to-brand-bg text-brand-text">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-accent/25 to-transparent" aria-hidden />
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_auto] lg:items-start lg:gap-16">
          <div className="space-y-8">
            <p className="font-heading text-xl font-semibold leading-snug tracking-tight text-brand-text sm:text-2xl">
              {withYouWordmark(footerCopy.tagline)}
            </p>
            <address className="max-w-md not-italic text-sm font-medium leading-relaxed text-brand-muted">{contact.addressLine}</address>
            <p className="text-sm text-brand-muted">
              {footerCopy.phoneLabel}{" "}
              <a href={contact.phoneHref} className={TEXT_LINK_INLINE}>
                {contact.phoneDisplay}
              </a>
            </p>
            <p className="text-sm text-brand-muted">
              <a href={contact.emailHref} className={TEXT_LINK_INLINE}>
                {contact.emailDisplay}
              </a>
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {MARKETING_SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-surface text-brand-muted ring-1 ring-brand-border/60 transition hover:bg-brand-accent hover:text-brand-white hover:ring-brand-accent"
                >
                  <span className="sr-only">{label}</span>
                  <Icon className={iconClasses()} />
                </a>
              ))}
            </div>
          </div>

          <nav className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-3 lg:flex-col lg:items-end lg:gap-4" aria-label="Pie">
            <Link href={`/nuestra-propuesta${localeQuery(locale)}`} className={FOOTER_ASIDE_LINK}>
              {footerCopy.proposalLinkLabel}
            </Link>
            <Link href={`/terminos${localeQuery(locale)}`} className={FOOTER_ASIDE_LINK}>
              {footerCopy.termsLinkLabel}
            </Link>
            <Link href={`/privacidad${localeQuery(locale)}`} className={FOOTER_ASIDE_LINK}>
              {footerCopy.privacyLinkLabel}
            </Link>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={FOOTER_ASIDE_LINK}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-brand-border/80 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] uppercase tracking-[0.16em] text-brand-subtle">
            {withYouWordmark(`© ${new Date().getFullYear()} YOU Soluciones Inmobiliarias. ${footerCopy.copyright}`)}
          </p>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">CDMX · México</p>
        </div>

        <div className="border-t border-brand-border/60 pt-8 text-center">
          <p className="text-[11px] leading-relaxed text-brand-muted">
            {locale === "en" ? (
              <>
                Site developed by{" "}
                <a
                  href="https://www.codiva.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${TEXT_LINK_INLINE} font-semibold`}
                >
                  Codiva
                </a>
              </>
            ) : (
              <>
                Sitio desarrollado por{" "}
                <a
                  href="https://www.codiva.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${TEXT_LINK_INLINE} font-semibold`}
                >
                  Codiva
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
