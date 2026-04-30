import { ZONES } from "@/data/zones";

/**
 * Highlights high-appreciation neighborhoods as pill chips.
 */
export function ZonesSection() {
  return (
    <section
      id="zones"
      className="border-b border-brand-muted/10 bg-brand-bg py-16 sm:py-20"
      aria-labelledby="zones-heading"
    >
      <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <h2
            id="zones-heading"
            className="text-2xl font-semibold tracking-tight text-brand-ink sm:text-3xl"
          >
            Zonas de mayor plusvalía
          </h2>
          <p className="text-base leading-relaxed text-brand-muted">
            Encuentra el inmueble que estás buscando en las zonas de mayor
            plusvalía de la ciudad.
          </p>
        </div>
        <ul className="flex flex-wrap gap-3">
          {ZONES.map((zone) => (
            <li key={zone}>
              <span className="inline-flex rounded-full border border-brand-muted/20 bg-brand-white px-4 py-2 text-sm font-medium text-brand-text shadow-sm">
                {zone}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
