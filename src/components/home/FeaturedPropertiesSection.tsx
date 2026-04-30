import Link from "next/link";

import { FEATURED_PROPERTIES } from "@/data/properties";

/**
 * Grid of featured listings sourced from static seed data.
 */
export function FeaturedPropertiesSection() {
  return (
    <section
      id="featured-properties"
      className="border-b border-brand-muted/10 bg-brand-white py-16 sm:py-20"
      aria-labelledby="featured-heading"
    >
      <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2
              id="featured-heading"
              className="text-2xl font-semibold tracking-tight text-brand-ink sm:text-3xl"
            >
              Propiedades destacadas
            </h2>
            <p className="max-w-xl text-sm text-brand-muted">
              Una muestra de portafolio premium en las zonas más solicitadas.
            </p>
          </div>
          <Link
            href="#contact"
            className="text-sm font-semibold text-brand-accent hover:underline"
          >
            Agenda una visita
          </Link>
        </div>
        <ul className="grid gap-8 md:grid-cols-2">
          {FEATURED_PROPERTIES.map((property) => (
            <li key={property.id}>
              <article className="flex h-full flex-col rounded-2xl border border-brand-muted/15 bg-brand-bg/60 p-6 shadow-sm transition hover:border-brand-accent/25 hover:shadow-md">
                <div className="mb-4 aspect-[16/10] rounded-xl bg-gradient-to-br from-brand-muted/10 to-brand-accent/10" />
                <div className="flex flex-1 flex-col gap-3">
                  <span className="inline-flex w-fit rounded-full bg-brand-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-accent">
                    {property.status}
                  </span>
                  <h3 className="text-lg font-semibold leading-snug text-brand-ink">
                    {property.title}
                  </h3>
                  <p className="text-xl font-semibold text-brand-text">
                    {property.price}
                  </p>
                  <p className="text-sm leading-relaxed text-brand-muted">
                    {property.address}
                  </p>
                  <div className="mt-auto pt-4">
                    <Link
                      href="#virtual-tours"
                      className="inline-flex items-center justify-center rounded-xl border border-brand-accent/40 px-4 py-2 text-sm font-semibold text-brand-accent transition hover:bg-brand-accent hover:text-brand-white"
                    >
                      {property.ctaLabel}
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
