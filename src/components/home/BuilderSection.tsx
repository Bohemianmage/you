import { withYouWordmark } from "@/components/brand/you-wordmark";
import type { HomeCopy } from "@/i18n/home";

/**
 * Franja para línea constructora — misma marca, tratamiento visual distinto del bloque inmobiliario.
 * Por ahora solo mensaje “en proceso”.
 */
export function BuilderSection({ copy }: { copy: HomeCopy["builder"] }) {
  return (
    <section
      id="constructora"
      className="border-y border-brand-you/15 bg-gradient-to-b from-brand-you/[0.06] via-brand-surface/60 to-brand-bg py-16 sm:py-20 md:py-24"
      aria-labelledby="builder-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-sm border border-brand-you/20 bg-brand-bg/90 px-6 py-10 shadow-[0_8px_32px_-20px_rgba(26,30,97,0.25)] ring-1 ring-brand-border/40 sm:px-10 sm:py-12">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-you">{copy.kicker}</p>
              <h2 id="builder-heading" className="font-heading text-xl font-semibold tracking-tight text-brand-text sm:text-2xl">
                {withYouWordmark(copy.title)}
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-brand-muted">{copy.body}</p>
            </div>
            <span className="inline-flex shrink-0 items-center rounded-full border border-brand-you/25 bg-brand-you/[0.08] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-you">
              {copy.statusBadge}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
