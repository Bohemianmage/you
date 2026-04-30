import Link from "next/link";

/**
 * Corporate office leasing callout with supportive credibility copy.
 */
export function OfficeSearchSection() {
  return (
    <section
      id="offices"
      className="border-b border-brand-muted/10 bg-brand-bg py-16 sm:py-20"
      aria-labelledby="offices-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="aspect-[4/3] w-full rounded-2xl border border-brand-muted/15 bg-gradient-to-bl from-brand-white via-brand-bg to-brand-accent/15 shadow-sm" />
          <div className="space-y-6">
            <h2
              id="offices-heading"
              className="text-2xl font-semibold tracking-tight text-brand-ink sm:text-3xl"
            >
              ¿Estás buscando oficina?
            </h2>
            <p className="text-base leading-relaxed text-brand-muted">
              Te ayudamos a encontrar el lugar perfecto para ti y tus
              colaboradores.
            </p>
            <p className="text-base leading-relaxed text-brand-text">
              Tenemos presencia en las zonas corporativas más solicitadas de la
              ciudad.
            </p>
            <Link
              href="#contact"
              className="inline-flex items-center justify-center rounded-xl border border-brand-ink bg-brand-ink px-6 py-3 text-sm font-semibold text-brand-white transition hover:bg-brand-ink/90"
            >
              Busquemos tu nueva oficina
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
