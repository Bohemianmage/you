import Link from "next/link";

/**
 * Primary hero with bilingual positioning line, headline, service promise, and CTAs.
 */
export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden border-b border-brand-muted/10 bg-brand-bg"
      aria-labelledby="hero-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(176,141,87,0.12),_transparent_55%)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-center lg:gap-16 lg:px-8 lg:py-24">
        <div className="flex-1 space-y-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-accent">
            <Link
              href="#featured-properties"
              className="inline underline-offset-4 hover:underline"
            >
              Looking for accommodation or your next real estate investment in
              México? Click here
            </Link>
          </p>
          <div className="space-y-4">
            <h1
              id="hero-heading"
              className="text-4xl font-semibold tracking-tight text-brand-ink sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]"
            >
              Find the perfect spot for YOU
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-brand-muted">
              Servicio profesional inmobiliario con sentido humano
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="#featured-properties"
              className="inline-flex items-center justify-center rounded-xl bg-brand-accent px-6 py-3 text-center text-sm font-semibold text-brand-white shadow-sm transition hover:bg-brand-accent/90"
            >
              Ver propiedades
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center justify-center rounded-xl border border-brand-muted/25 bg-brand-white px-6 py-3 text-center text-sm font-semibold text-brand-ink transition hover:border-brand-accent/40 hover:text-brand-accent"
            >
              Contactar asesor
            </Link>
          </div>
        </div>
        <div className="flex-1">
          <div className="aspect-[4/3] w-full rounded-2xl border border-brand-muted/15 bg-gradient-to-br from-brand-white via-brand-bg to-brand-accent/20 shadow-[0_24px_80px_-24px_rgba(17,24,39,0.25)]" />
        </div>
      </div>
    </section>
  );
}
