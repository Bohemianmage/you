import Image from "next/image";

import type { DownloadableItem } from "@/data/downloadables";
import type { HomeCopy } from "@/i18n/home";

interface DownloadablesSectionProps {
  copy: HomeCopy["downloadables"];
  items: readonly DownloadableItem[];
}

/**
 * Descargables — material comercial con descarga directa cuando hay archivo.
 */
export function DownloadablesSection({ copy, items }: DownloadablesSectionProps) {
  return (
    <section
      id="downloadables"
      className="scroll-mt-[6.5rem] border-b border-brand-border bg-brand-bg py-14 sm:py-16 sm:scroll-mt-28 md:py-20"
      aria-labelledby="downloadables-heading"
    >
      <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="downloadables-heading" className="font-heading text-xl font-semibold text-brand-text sm:text-2xl">
            {copy.title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-brand-muted">{copy.description}</p>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.id}>
              <article className="flex h-full flex-col overflow-hidden rounded-sm border border-brand-border bg-brand-surface shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                {item.imageSrc ? (
                  <div className="relative aspect-[16/9] bg-brand-bg">
                    <Image
                      src={item.imageSrc}
                      alt=""
                      fill
                      unoptimized={item.imageSrc.startsWith("http")}
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-heading text-lg font-semibold text-brand-text">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-muted">{item.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.fileUrl ? (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-sm bg-brand-accent px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-white transition hover:bg-brand-accent-strong"
                      >
                        {copy.downloadFileCta}
                      </a>
                    ) : (
                      <p className="text-xs text-brand-muted">{copy.noFileHint}</p>
                    )}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
