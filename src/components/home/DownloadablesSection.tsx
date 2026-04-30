import Link from "next/link";

/**
 * Lightweight placeholder for downloadable collateral (PDFs, dossiers) — nav parity.
 */
export function DownloadablesSection() {
  return (
    <section
      id="downloadables"
      className="border-b border-brand-muted/10 bg-brand-white py-14 sm:py-16"
      aria-labelledby="downloadables-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-dashed border-brand-muted/30 bg-brand-bg/80 px-6 py-10 text-center sm:px-10">
          <h2
            id="downloadables-heading"
            className="text-xl font-semibold text-brand-ink sm:text-2xl"
          >
            Descargables
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-brand-muted">
            Solicita brochures, fichas técnicas y material comercial. Te lo
            enviamos personalizado según tu zona y tipo de operación.
          </p>
          <Link
            href="#contact"
            className="mt-6 inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold text-brand-accent underline-offset-4 hover:underline"
          >
            Solicitar por contacto
          </Link>
        </div>
      </div>
    </section>
  );
}
