import Link from "next/link";

import type { HomeCopy } from "@/i18n/home";

interface VirtualToursSectionProps {
  copy: HomeCopy["virtualTours"];
  contactHref: string;
  /** Optional Matterport or iframe embed URL (e.g. `NEXT_PUBLIC_VIRTUAL_TOUR_EMBED_URL`). */
  embedUrl?: string;
}

/**
 * Tours 3D — titular en versalitas / tracking amplio.
 */
export function VirtualToursSection({ copy, contactHref, embedUrl }: VirtualToursSectionProps) {
  return (
    <section id="virtual-tours" className="border-b border-brand-border bg-brand-surface py-16 sm:py-20" aria-labelledby="tours-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 rounded-sm border border-brand-border bg-brand-bg p-8 shadow-[0_1px_4px_rgba(0,0,0,0.12)] lg:flex-row lg:items-center lg:justify-between lg:p-10">
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
          <div className="aspect-video w-full max-w-md shrink-0 overflow-hidden rounded-sm border border-brand-border bg-brand-surface lg:max-w-sm">
            {embedUrl ? (
              <iframe title={copy.title} src={embedUrl} className="h-full w-full border-0" allowFullScreen loading="lazy" />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
