import Link from "next/link";

import type { HomeCopy } from "@/i18n/home";

interface DownloadablesSectionProps {
  copy: HomeCopy["downloadables"];
}

/**
 * Descargables placeholder — dashed / outlined treatment suggests supplementary docs like Wix secondary panels.
 */
export function DownloadablesSection({ copy }: DownloadablesSectionProps) {
  return (
    <section id="downloadables" className="border-b border-brand-border bg-brand-bg py-14 sm:py-16 md:py-20" aria-labelledby="downloadables-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-sm border border-dashed border-brand-border bg-brand-surface px-6 py-10 text-center sm:px-10">
          <h2 id="downloadables-heading" className="font-heading text-xl font-semibold text-brand-text sm:text-2xl">
            {copy.title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-brand-muted">{copy.description}</p>
          <Link
            href="#contact"
            className="mt-6 inline-flex items-center justify-center rounded-sm border border-brand-accent px-6 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-accent transition hover:bg-brand-accent hover:text-brand-white"
          >
            {copy.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
