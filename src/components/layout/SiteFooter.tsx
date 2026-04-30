import Link from "next/link";

/**
 * Closing band with brand line, legal-style contact block, and jump-to-nav.
 */
export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-brand-muted/15 bg-brand-white">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-4">
            <p className="text-lg font-medium leading-relaxed text-brand-text">
              Comienza a escribir una nueva historia con nosotros.
            </p>
            <address className="not-italic text-sm leading-relaxed text-brand-muted">
              Roberto Gayol 82-4 Int. 2, Cd. Satélite, 53100 Naucalpan de Juárez,
              Méx.
            </address>
            <p className="text-sm text-brand-muted">
              Teléfono:{" "}
              <a
                href="tel:+525592217328"
                className="font-medium text-brand-accent hover:underline"
              >
                55-92-21-73-28
              </a>
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-medium text-brand-text">
            <Link href="#about" className="hover:text-brand-accent">
              Nosotros
            </Link>
            <Link href="#featured-properties" className="hover:text-brand-accent">
              Propiedades
            </Link>
            <Link href="#downloadables" className="hover:text-brand-accent">
              Descargables
            </Link>
          </div>
        </div>
        <p className="text-xs text-brand-muted">
          © {new Date().getFullYear()} YOU Soluciones Inmobiliarias. Todos los
          derechos reservados.
        </p>
      </div>
    </footer>
  );
}
