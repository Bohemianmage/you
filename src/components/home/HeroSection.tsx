import Link from "next/link";

import { HeroDevelopmentModal } from "@/components/home/HeroDevelopmentModal";
import type { HomeCopy } from "@/i18n/home";

interface HeroSectionProps {
  copy: HomeCopy["hero"];
  modalCopy: HomeCopy["modal"];
  catalogHref: string;
  contactHref: string;
}

/**
 * Hero — lienzo claro, titular Montserrat, acento pizarra `#616E89`.
 */
export function HeroSection({ copy, modalCopy, catalogHref, contactHref }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-brand-border bg-brand-bg" aria-labelledby="hero-heading">
      <HeroDevelopmentModal copy={modalCopy} />
      <div className="border-b border-brand-border bg-brand-surface px-4 py-3.5 text-center sm:px-6">
        <p className="mx-auto max-w-4xl text-[13px] font-semibold leading-snug text-brand-text sm:text-sm">
          <Link
            href={catalogHref}
            className="inline-flex flex-wrap items-center justify-center gap-x-2 rounded-full border border-brand-accent/20 bg-brand-accent/[0.06] px-4 py-2 text-brand-accent-strong transition hover:border-brand-accent/35 hover:bg-brand-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
          >
            {copy.announcement}
          </Link>
        </p>
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-14 sm:px-6 sm:py-16 lg:flex-row lg:items-center lg:gap-14 lg:px-8 lg:py-20">
        <div className="flex-1 space-y-8">
          <div className="space-y-5">
            <h1
              id="hero-heading"
              className="font-heading text-[2.1rem] font-semibold leading-[1.12] tracking-tight text-brand-text sm:text-5xl lg:text-[3.15rem]"
            >
              {copy.title}
            </h1>
            <p className="max-w-xl text-[13px] font-bold uppercase leading-relaxed tracking-[0.24em] text-brand-muted sm:text-sm">
              {copy.subtitle}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={catalogHref}
              className="inline-flex items-center justify-center rounded-sm bg-brand-accent px-7 py-3.5 text-center text-sm font-semibold text-brand-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition hover:bg-brand-accent-strong"
            >
              {copy.primaryCta}
            </Link>
            <Link
              href={contactHref}
              className="inline-flex items-center justify-center rounded-sm border border-brand-accent bg-transparent px-7 py-3.5 text-center text-sm font-semibold text-brand-accent transition hover:bg-[rgba(97,110,137,0.08)]"
            >
              {copy.secondaryCta}
            </Link>
          </div>
        </div>

        <div className="flex-1">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-sm border border-brand-border bg-brand-surface shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
            <div className="flex h-full w-full flex-col justify-end bg-gradient-to-br from-brand-surface via-brand-border/40 to-brand-accent/15 p-6">
              <p className="font-heading text-lg font-semibold text-brand-text">YOU Soluciones Inmobiliarias</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-accent">{copy.imageBadge}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
