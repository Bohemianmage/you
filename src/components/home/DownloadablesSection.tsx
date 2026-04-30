import Link from "next/link";

import type { DownloadableItem } from "@/data/downloadables";
import type { HomeCopy } from "@/i18n/home";
import { appendContactParams } from "@/lib/contact-url";

interface DownloadablesSectionProps {
  copy: HomeCopy["downloadables"];
  items: readonly DownloadableItem[];
  contactHref: string;
}

/**
 * Descargables — fichas comerciales solicitadas por contacto (paridad con Wix).
 */
export function DownloadablesSection({ copy, items, contactHref }: DownloadablesSectionProps) {
  return (
    <section id="downloadables" className="border-b border-brand-border bg-brand-bg py-14 sm:py-16 md:py-20" aria-labelledby="downloadables-heading">
      <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="downloadables-heading" className="font-heading text-xl font-semibold text-brand-text sm:text-2xl">
            {copy.title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-brand-muted">{copy.description}</p>
          <Link
            href={contactHref}
            className="mt-6 inline-flex items-center justify-center rounded-sm border border-brand-accent px-6 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-accent transition hover:bg-brand-accent hover:text-brand-white"
          >
            {copy.cta}
          </Link>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.id}>
              <article className="flex h-full flex-col rounded-sm border border-brand-border bg-brand-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <h3 className="font-heading text-lg font-semibold text-brand-text">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-muted">{item.description}</p>
                <Link
                  href={appendContactParams(contactHref, { topic: "descargables", item: item.id })}
                  className="mt-4 inline-flex w-fit items-center justify-center rounded-sm bg-brand-accent px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-white transition hover:bg-brand-accent-strong"
                >
                  {copy.requestItemCta}
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
