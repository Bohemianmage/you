import Image from "next/image";
import Link from "next/link";

import { HeroBackdropVideo } from "@/components/home/HeroBackdropVideo";
import { HeroDevelopmentModal } from "@/components/home/HeroDevelopmentModal";
import { HomeHashLink } from "@/components/layout/HomeHashLink";
import type { HomeCopy } from "@/i18n/home";
import type { Locale } from "@/i18n/types";

interface HeroSectionProps {
  locale: Locale;
  copy: HomeCopy["hero"];
  modalCopy: HomeCopy["modal"];
  catalogHref: string;
  contactHref: string;
  /** Chip superior — URL canónica con un solo fragmento (p. ej. sección descargables). */
  announcementHref: string;
}

function HeroHeadingTitle({ title, locale }: { title: string; locale: Locale }) {
  if (locale !== "en") return title;
  const suf = " YOU";
  const i = title.lastIndexOf(suf);
  if (i === -1) return title;
  return (
    <>
      {title.slice(0, i)}
      <span className="font-bold text-brand-you"> YOU</span>
    </>
  );
}

/**
 * Hero — video de ciudad de fondo (bloque principal), aviso superior y CTAs.
 */
export function HeroSection({ locale, copy, modalCopy, catalogHref, contactHref, announcementHref }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-brand-border bg-brand-bg" aria-labelledby="hero-heading">
      <HeroDevelopmentModal copy={modalCopy} />
      <div className="relative z-20 border-b border-brand-border bg-brand-surface px-4 py-3.5 text-center sm:px-6">
        <p className="mx-auto max-w-4xl text-[13px] font-semibold leading-snug text-brand-text sm:text-sm">
          <HomeHashLink
            href={announcementHref}
            className="inline-flex flex-wrap items-center justify-center gap-x-2 rounded-full border border-brand-accent/20 bg-brand-accent/[0.06] px-4 py-2 text-brand-accent-strong transition hover:border-brand-accent/35 hover:bg-brand-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
          >
            {copy.announcement}
          </HomeHashLink>
        </p>
      </div>

      <div className="relative isolate min-h-[28rem] overflow-hidden sm:min-h-[32rem] lg:min-h-[36rem]">
        <HeroBackdropVideo poster={copy.imageSrc} />
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-b from-brand-bg/88 via-brand-bg/72 to-brand-bg/80 lg:bg-gradient-to-r lg:from-brand-bg/90 lg:via-brand-bg/78 lg:to-brand-bg/65"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:flex-row lg:items-center lg:gap-14 lg:px-8 lg:py-20">
          <div className="flex-1 space-y-8">
            <div className="space-y-5">
              <h1
                id="hero-heading"
                className="font-heading text-[2.1rem] font-semibold leading-[1.12] tracking-tight text-brand-text sm:text-5xl lg:text-[3.15rem]"
              >
                <HeroHeadingTitle title={copy.title} locale={locale} />
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
                className="inline-flex items-center justify-center rounded-sm border border-brand-accent bg-brand-bg/90 px-7 py-3.5 text-center text-sm font-semibold text-brand-accent shadow-sm backdrop-blur-sm transition hover:bg-brand-accent/12"
              >
                {copy.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="flex w-full flex-1 justify-center lg:justify-end">
            <div className="flex w-full max-w-md flex-col items-center justify-center gap-4 rounded-sm border border-white/25 bg-brand-bg/40 px-8 py-10 shadow-[0_8px_32px_rgba(47,46,46,0.12)] backdrop-blur-md backdrop-saturate-150">
              <Image
                src="/logo-you-full.png"
                alt="YOU Soluciones Inmobiliarias"
                width={320}
                height={140}
                className="h-auto w-full max-w-[min(100%,280px)] object-contain"
                priority
              />
              <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-brand-accent">{copy.imageBadge}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
