import type { HomeCopy } from "@/i18n/home";

interface ZonesSectionProps {
  title: HomeCopy["zones"]["title"];
  zones: readonly string[];
}

/**
 * Franja de zonas — titulares en negrita y ritmo neutro claro / gris suave.
 */
export function ZonesSection({ title, zones }: ZonesSectionProps) {
  return (
    <section id="zones" className="border-b border-brand-border bg-brand-surface py-16 sm:py-20" aria-labelledby="zones-heading">
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <h2 id="zones-heading" className="font-heading text-2xl font-semibold uppercase tracking-wide text-brand-text sm:text-[1.65rem]">
          {title}
        </h2>
        <ul className="flex flex-wrap gap-3">
          {zones.map((zone) => (
            <li key={zone}>
              <span className="inline-flex rounded-sm border border-brand-border bg-brand-bg px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-brand-text shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                {zone}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
