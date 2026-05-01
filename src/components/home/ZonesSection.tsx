import Link from "next/link";

import type { HomeZone } from "@/data/zones";
import type { HomeCopy } from "@/i18n/home";
import type { Locale } from "@/i18n/types";
import { catalogPageHref } from "@/lib/catalog-query";

interface ZonesSectionProps {
  title: HomeCopy["zones"]["title"];
  zones: readonly HomeZone[];
  locale: Locale;
}

/**
 * Franja de zonas — enlaces al catálogo filtrado por zona.
 */
export function ZonesSection({ title, zones, locale }: ZonesSectionProps) {
  return (
    <section id="zones" className="border-b border-brand-border bg-brand-surface py-16 sm:py-20" aria-labelledby="zones-heading">
      <div className="mx-auto max-w-6xl space-y-10 px-4 text-center sm:px-6 lg:px-8">
        <h2
          id="zones-heading"
          className="font-heading text-2xl font-semibold uppercase tracking-wide text-brand-text sm:text-[1.65rem]"
        >
          {title}
        </h2>
        <ul className="flex flex-wrap justify-center gap-3">
          {zones.map((z) => {
            const zoneParam = z.filterZone ?? z.label;
            const href = catalogPageHref(locale, { region: zoneParam });
            return (
              <li key={z.label}>
                <Link
                  href={href}
                  className="inline-flex rounded-full border border-brand-border bg-brand-bg px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-brand-text shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition hover:border-brand-accent hover:bg-brand-accent/[0.06] hover:text-brand-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
                >
                  {z.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
