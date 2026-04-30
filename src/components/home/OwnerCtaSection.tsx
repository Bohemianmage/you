import Link from "next/link";

/**
 * Conversion-focused prompt for owners considering sale or lease.
 */
export function OwnerCtaSection() {
  return (
    <section
      id="owner"
      className="border-b border-brand-muted/10 bg-brand-white py-16 sm:py-20"
      aria-labelledby="owner-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-brand-muted/15 bg-brand-bg px-8 py-12 text-center shadow-sm sm:px-12">
          <h2
            id="owner-heading"
            className="text-2xl font-semibold tracking-tight text-brand-ink sm:text-3xl"
          >
            ¿Quieres vender o rentar tu propiedad?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-brand-muted">
            Valoramos, promovemos y acompañamos cada etapa con transparencia y
            cercanía humana.
          </p>
          <Link
            href="#contact"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-brand-accent px-8 py-3 text-sm font-semibold text-brand-white transition hover:bg-brand-accent/90"
          >
            Da clic aquí
          </Link>
        </div>
      </div>
    </section>
  );
}
