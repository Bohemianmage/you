import Link from "next/link";

/**
 * Promotional strip for Matterport-style 3D experiences.
 */
export function VirtualToursSection() {
  return (
    <section
      id="virtual-tours"
      className="border-b border-brand-muted/10 bg-brand-bg py-16 sm:py-20"
      aria-labelledby="tours-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 overflow-hidden rounded-2xl border border-brand-muted/15 bg-brand-white p-8 shadow-sm lg:flex-row lg:items-center lg:justify-between lg:p-12">
          <div className="max-w-xl space-y-4">
            <h2
              id="tours-heading"
              className="text-2xl font-semibold tracking-tight text-brand-ink sm:text-3xl"
            >
              Descubre nuestras experiencias 3D
            </h2>
            <p className="text-base leading-relaxed text-brand-muted">
              Recorre propiedades seleccionadas con recorridos virtuales de alta
              calidad, disponibles para ti cuando quieras explorarlas.
            </p>
            <Link
              href="#contact"
              className="inline-flex w-fit items-center justify-center rounded-xl bg-brand-ink px-6 py-3 text-sm font-semibold text-brand-white transition hover:bg-brand-ink/90"
            >
              Ver tours virtuales
            </Link>
          </div>
          <div className="aspect-video w-full max-w-md shrink-0 rounded-xl bg-gradient-to-tr from-brand-accent/30 via-brand-bg to-brand-muted/20 lg:max-w-sm" />
        </div>
      </div>
    </section>
  );
}
