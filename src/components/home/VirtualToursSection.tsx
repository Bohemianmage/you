import Link from "next/link";

import { VirtualToursBackdropVideo } from "@/components/home/VirtualToursBackdropVideo";
import type { HomeCopy } from "@/i18n/home";

interface VirtualToursSectionProps {
  copy: HomeCopy["virtualTours"];
  contactHref: string;
  /** Optional Matterport or iframe embed URL (e.g. `NEXT_PUBLIC_VIRTUAL_TOUR_EMBED_URL`). */
  embedUrl?: string;
}

/**
 * Tours 3D — video de fondo en toda la sección; iframe opcional encima.
 */
export function VirtualToursSection({ copy, contactHref, embedUrl }: VirtualToursSectionProps) {
  return (
    <section
      id="virtual-tours"
      className="relative isolate min-h-[28rem] overflow-hidden border-b border-brand-border py-16 sm:min-h-[24rem] sm:py-20"
      aria-labelledby="tours-heading"
    >
      <VirtualToursBackdropVideo />
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-br from-brand-bg/92 via-brand-bg/86 to-brand-bg/78"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 rounded-sm border border-brand-border/80 bg-brand-bg/55 p-8 shadow-[0_8px_36px_-18px_rgba(26,30,97,0.18)] backdrop-blur-md lg:flex-row lg:items-center lg:justify-between lg:p-10">
          <div className="max-w-xl space-y-4">
            <h2 id="tours-heading" className="font-heading text-lg font-semibold uppercase tracking-[0.12em] text-brand-muted sm:text-xl">
              {copy.title}
            </h2>
            <p className="text-sm leading-relaxed text-brand-muted">{copy.description}</p>
            <Link
              href={contactHref}
              className="inline-flex w-fit items-center justify-center rounded-sm bg-brand-accent px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-brand-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition hover:bg-brand-accent-strong"
            >
              {copy.cta}
            </Link>
          </div>
          {embedUrl ? (
            <div className="aspect-video w-full max-w-md shrink-0 overflow-hidden rounded-sm border border-brand-border bg-brand-surface shadow-[0_4px_24px_rgba(0,0,0,0.12)] lg:max-w-sm">
              <iframe title={copy.title} src={embedUrl} className="h-full w-full border-0" allowFullScreen loading="lazy" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
