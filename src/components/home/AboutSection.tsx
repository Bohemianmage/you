/**
 * Concise trust narrative for the Nosotros navigation target (legacy parity).
 */
export function AboutSection() {
  return (
    <section
      id="about"
      className="border-b border-brand-muted/10 bg-brand-white py-16 sm:py-20"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h2
            id="about-heading"
            className="text-2xl font-semibold tracking-tight text-brand-ink sm:text-3xl"
          >
            Nosotros
          </h2>
          <p className="text-base leading-relaxed text-brand-muted">
            En YOU Soluciones Inmobiliarias combinamos criterio de mercado,
            acompañamiento cercano y procesos claros para ayudarte a rentar,
            comprar o invertir con confianza en Ciudad de México y zonas
            corporativas clave.
          </p>
        </div>
      </div>
    </section>
  );
}
