import Link from "next/link";

import type { SiteContact } from "@/constants/site-contact";
import { TEXT_LINK_INLINE } from "@/lib/link-styles";
import type { HomeCopy, NavItem } from "@/i18n/home";

interface SiteFooterProps {
  navItems: readonly NavItem[];
  footerCopy: HomeCopy["footer"];
  contact: SiteContact;
}

/**
 * Pie — fondo claro, borde y texto carbón (`--brand-bg` / `--brand-text`).
 */
export function SiteFooter({ navItems, footerCopy, contact }: SiteFooterProps) {
  return (
    <footer className="relative border-t border-brand-border bg-brand-bg text-brand-text">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-5">
            <p className="font-heading text-xl font-semibold leading-snug text-brand-text sm:text-2xl">
              {footerCopy.tagline}
            </p>
            <address className="not-italic text-sm font-medium leading-relaxed text-brand-muted">{contact.addressLine}</address>
            <p className="text-sm text-brand-muted">
              {footerCopy.phoneLabel}{" "}
              <a href={contact.phoneHref} className={TEXT_LINK_INLINE}>
                {contact.phoneDisplay}
              </a>
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[13px] font-bold uppercase tracking-[0.12em] text-brand-text no-underline transition hover:text-brand-accent"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <p className="border-t border-brand-border pt-8 text-[11px] uppercase tracking-[0.14em] text-brand-subtle">
          © {new Date().getFullYear()} YOU Soluciones Inmobiliarias. {footerCopy.copyright}
        </p>
      </div>
    </footer>
  );
}
