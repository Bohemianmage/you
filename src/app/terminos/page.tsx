import Link from "next/link";

import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { LEGAL_PAGES_COPY } from "@/i18n/legal-pages";
import { homePath, localeQuery, marketingNav } from "@/i18n/home";
import { resolveMarketingLocale } from "@/lib/marketing-locale";
import { TEXT_LINK_INLINE } from "@/lib/link-styles";
import type { Metadata } from "next";

interface PageProps {
  searchParams?: Promise<{ lang?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = searchParams ? await searchParams : undefined;
  const locale = await resolveMarketingLocale(sp?.lang);
  const c = LEGAL_PAGES_COPY[locale];
  return {
    title: c.termsTitle,
    description: locale === "en" ? "Terms of use — YOU Soluciones Inmobiliarias." : "Términos de uso — YOU Soluciones Inmobiliarias.",
  };
}

export default async function TerminosPage({ searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : undefined;
  const locale = await resolveMarketingLocale(sp?.lang);
  const q = localeQuery(locale);
  const c = LEGAL_PAGES_COPY[locale];
  const nav = marketingNav(locale);

  return (
    <MarketingLayout locale={locale}>
      <div className="border-b border-brand-border bg-brand-bg px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <nav className="text-sm font-semibold">
            <Link href={homePath(locale)} className={TEXT_LINK_INLINE}>
              {locale === "en" ? "Home" : "Inicio"}
            </Link>
          </nav>
          <h1 className="mt-6 font-heading text-3xl font-semibold tracking-tight text-brand-text">{c.termsTitle}</h1>
          <p className="mt-4 text-sm leading-relaxed text-brand-muted">{c.termsLead}</p>

          <div className="mt-10 space-y-10">
            {c.termsSections.map((s) => (
              <section key={s.heading}>
                <h2 className="font-heading text-lg font-semibold text-brand-text">{s.heading}</h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-brand-text">
                  {s.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-12 text-sm text-brand-muted">
            <Link href={`/privacidad${q}`} className={TEXT_LINK_INLINE}>
              {locale === "en" ? "Privacy notice" : "Aviso de privacidad"}
            </Link>
          </p>

          <ul className="mt-8 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-brand-accent hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MarketingLayout>
  );
}
