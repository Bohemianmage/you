import Image from "next/image";
import Link from "next/link";

import type { HomeCopy } from "@/i18n/home";

interface OfficeSearchSectionProps {
  copy: HomeCopy["offices"];
  proposalHref: string;
}

/**
 * Office section — mirrors reference hierarchy (OFICINA headline + body + accent button).
 */
export function OfficeSearchSection({ copy, proposalHref }: OfficeSearchSectionProps) {
  return (
    <section id="offices" className="border-b border-brand-border bg-brand-surface py-16 sm:py-20 md:py-24" aria-labelledby="offices-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-brand-border bg-brand-bg shadow-[0_1px_4px_rgba(0,0,0,0.15)]">
            {copy.imageSrc ? (
              <Image
                src={copy.imageSrc}
                alt={copy.title}
                fill
                unoptimized={copy.imageSrc.startsWith("http")}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-surface via-brand-border/50 to-brand-accent/10 p-6 text-center">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-subtle">{copy.imageLabel}</span>
              </div>
            )}
          </div>
          <div className="space-y-6">
            <h2 id="offices-heading" className="font-heading text-3xl font-semibold uppercase tracking-wide text-brand-text">
              {copy.title}
            </h2>
            <p className="text-base leading-relaxed text-brand-muted">{copy.description}</p>
            <p className="text-base leading-relaxed text-brand-text">{copy.supportText}</p>
            <Link
              href={proposalHref}
              className="inline-flex items-center justify-center rounded-sm bg-brand-accent px-8 py-3.5 text-sm font-semibold text-brand-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition hover:bg-brand-accent-strong"
            >
              {copy.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
