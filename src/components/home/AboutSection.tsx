import Image from "next/image";

import { withYouWordmark } from "@/components/brand/you-wordmark";
import { TeamMemberFlipCard } from "@/components/home/TeamMemberFlipCard";
import type { ClientLogo } from "@/lib/site-content/types";
import type { TeamMember } from "@/data/team";
import type { HomeCopy } from "@/i18n/home";
import type { Locale } from "@/i18n/types";

interface AboutSectionProps {
  locale: Locale;
  copy: HomeCopy["about"];
  teamMembers: readonly TeamMember[];
  clientLogos: readonly ClientLogo[];
  /** En modo admin: mensaje si aún no hay logos en `site-content.json`. */
  adminEditing?: boolean;
}

/**
 * Nosotros — misión, historia, equipo y logos de clientes.
 */
export function AboutSection({ locale, copy, teamMembers, clientLogos, adminEditing }: AboutSectionProps) {
  return (
    <section
      id="about"
      className="scroll-mt-[6.25rem] border-b border-brand-border bg-brand-bg py-16 sm:py-24 sm:scroll-mt-[6.25rem]"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-6xl space-y-16 px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl space-y-6 text-center lg:text-left">
          <h2 id="about-heading" className="font-heading text-3xl font-semibold tracking-tight text-brand-text sm:text-[2.35rem]">
            {copy.title}
          </h2>
          <p className="font-heading text-xl font-semibold text-brand-accent sm:text-2xl">{copy.tagline}</p>
          <div className="space-y-4 text-base leading-[1.75] text-brand-muted">
            {copy.intro.map((p) => (
              <p key={p}>{withYouWordmark(p)}</p>
            ))}
          </div>
        </header>

        <div className="mx-auto max-w-3xl space-y-5 border-t border-brand-border pt-12 lg:border-t-0 lg:pt-0">
          <h3 className="font-heading text-xl font-semibold text-brand-text sm:text-2xl">{copy.historyTitle}</h3>
          <div className="space-y-4 text-base leading-[1.75] text-brand-muted">
            {copy.history.map((p) => (
              <p key={p}>{withYouWordmark(p)}</p>
            ))}
          </div>
        </div>

        <div className="space-y-8 border-t border-brand-border pt-12">
          <h3 className="text-center font-heading text-xl font-semibold text-brand-text sm:text-2xl lg:text-left">
            {copy.teamTitle}
          </h3>
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <TeamMemberFlipCard key={member.id} member={member} locale={locale} />
            ))}
          </ul>
        </div>

        <div className="space-y-8 border-t border-brand-border pt-12">
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <h3 className="font-heading text-xl font-semibold text-brand-text sm:text-2xl">{copy.clientsTitle}</h3>
            <p className="text-sm leading-relaxed text-brand-muted">{copy.clientsSubtitle}</p>
          </div>

          {clientLogos.length > 0 ? (
            <ul className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-8">
              {clientLogos.map((logo) => (
                <li key={`${logo.src}-${logo.alt}`} className="flex h-14 max-w-[9rem] items-center justify-center sm:h-16 sm:max-w-[10rem]">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={200}
                    height={80}
                    className="max-h-14 w-auto max-w-full object-contain opacity-90 grayscale contrast-[1.05] transition hover:opacity-100 hover:grayscale-0 motion-reduce:transition-none sm:max-h-16"
                    unoptimized={logo.src.startsWith("http")}
                  />
                </li>
              ))}
            </ul>
          ) : adminEditing ? (
            <p className="mx-auto max-w-xl rounded-sm border border-dashed border-brand-border bg-brand-surface/80 px-6 py-8 text-center text-sm text-brand-muted">
              Añade logos en{" "}
              <code className="rounded bg-brand-border/25 px-1.5 py-0.5 text-xs text-brand-text">clientLogos</code> dentro de{" "}
              <code className="rounded bg-brand-border/25 px-1.5 py-0.5 text-xs text-brand-text">content/site-content.json</code>{" "}
              como array de <code className="text-xs">src</code> y <code className="text-xs">alt</code>. La edición visual en panel llegará después.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
