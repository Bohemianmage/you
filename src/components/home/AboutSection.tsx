/**
 * Nosotros — centered editorial paragraph on white (same rhythm as Wix content columns).
 */
export function AboutSection() {
  return (
    <section id="about" className="border-b border-brand-border bg-brand-bg py-16 sm:py-20" aria-labelledby="about-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h2 id="about-heading" className="font-heading text-3xl font-semibold tracking-tight text-brand-text sm:text-[2rem]">
            Nosotros
          </h2>
          <p className="text-base leading-[1.75] text-brand-muted">
            En YOU Soluciones Inmobiliarias combinamos criterio de mercado, acompañamiento cercano y procesos claros para
            ayudarte a rentar, comprar o invertir con confianza en Ciudad de México y zonas corporativas clave.
          </p>
        </div>
      </div>
    </section>
  );
}
