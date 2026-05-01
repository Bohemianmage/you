import Link from "next/link";

import { withYouWordmark } from "@/components/brand/you-wordmark";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { localeQuery } from "@/i18n/home";
import { resolveMarketingLocale } from "@/lib/marketing-locale";
import { PROPOSAL_PAGE_COPY } from "@/i18n/marketing-pages";
import type { Metadata } from "next";

interface PropuestaPageProps {
  searchParams?: Promise<{ lang?: string }>;
}

export async function generateMetadata({ searchParams }: PropuestaPageProps): Promise<Metadata> {
  const params = searchParams ? await searchParams : undefined;
  const locale = await resolveMarketingLocale(params?.lang);
  const title = PROPOSAL_PAGE_COPY[locale].title;
  return {
    title,
    description:
      locale === "en"
        ? "How YOU supports owners selling or leasing properties — virtual tours, photography, legal orientation, and portals."
        : "Cómo YOU apoya a propietarios en venta o renta: tours virtuales, fotografía, asesoría y portales.",
  };
}

export default async function NuestraPropuestaPage({ searchParams }: PropuestaPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const locale = await resolveMarketingLocale(params?.lang);
  const copy = PROPOSAL_PAGE_COPY[locale];
  const q = localeQuery(locale);
  const contactHref = `/contacto${q}`;
  const catalogHref = `/propiedades${q}`;

  return (
    <MarketingLayout locale={locale}>
      <article className="border-b border-brand-border bg-brand-bg px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-10">
          <header className="space-y-4">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl">{copy.title}</h1>
            <p className="text-base leading-relaxed text-brand-muted">{copy.lead}</p>
          </header>
          <ul className="space-y-4 border-l-2 border-brand-accent pl-6">
            {copy.bullets.map((line) => (
              <li key={line} className="text-sm leading-relaxed text-brand-text">
                {line}
              </li>
            ))}
          </ul>
          <p className="text-sm leading-relaxed text-brand-muted">{copy.officesNote}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={contactHref}
              className="inline-flex items-center justify-center rounded-sm bg-brand-accent px-8 py-3.5 text-sm font-semibold text-brand-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition hover:bg-brand-accent-strong"
            >
              {withYouWordmark(copy.contactCta)}
            </Link>
            <Link
              href={catalogHref}
              className="inline-flex items-center justify-center rounded-sm border border-brand-accent px-8 py-3.5 text-sm font-semibold text-brand-accent transition hover:bg-brand-accent/10"
            >
              {copy.catalogCta}
            </Link>
          </div>
        </div>
      </article>
    </MarketingLayout>
  );
}
