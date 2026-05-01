import Image from "next/image";

import {
  IconFacebook,
  IconLinkedIn,
  IconTwitter,
  iconClasses,
} from "@/components/icons/SocialIcons";
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

function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function TeamMemberCard({ member, locale }: { member: TeamMember; locale: Locale }) {
  const social = member.social;
  const hasSocial =
    social && (social.facebook || social.twitter || social.linkedin);

  return (
    <li className="flex flex-col overflow-hidden rounded-sm border border-brand-border bg-brand-bg shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
      <div className="relative aspect-[4/5] bg-gradient-to-br from-brand-surface to-brand-border/40">
        {member.imageSrc ? (
          <Image
            src={member.imageSrc}
            alt={member.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-accent/15 via-brand-surface to-brand-accent/10">
            <span className="font-heading text-2xl font-semibold tracking-wide text-brand-accent">
              {memberInitials(member.name)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h4 className="font-heading text-base font-semibold text-brand-text">{member.name}</h4>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-brand-muted">{member.role[locale]}</p>
        </div>
        {hasSocial ? (
          <div className="mt-auto flex gap-2 border-t border-brand-border/60 pt-3">
            {social!.facebook ? (
              <a
                href={social!.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full p-2 text-brand-muted ring-1 ring-brand-border/60 transition hover:bg-brand-accent hover:text-brand-white hover:ring-brand-accent"
                aria-label={`${member.name} — Facebook`}
              >
                <IconFacebook className={iconClasses("sm")} />
              </a>
            ) : null}
            {social!.twitter ? (
              <a
                href={social!.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full p-2 text-brand-muted ring-1 ring-brand-border/60 transition hover:bg-brand-accent hover:text-brand-white hover:ring-brand-accent"
                aria-label={`${member.name} — X`}
              >
                <IconTwitter className={iconClasses("sm")} />
              </a>
            ) : null}
            {social!.linkedin ? (
              <a
                href={social!.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full p-2 text-brand-muted ring-1 ring-brand-border/60 transition hover:bg-brand-accent hover:text-brand-white hover:ring-brand-accent"
                aria-label={`${member.name} — LinkedIn`}
              >
                <IconLinkedIn className={iconClasses("sm")} />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  );
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
              <p key={p}>{p}</p>
            ))}
          </div>
        </header>

        <div className="mx-auto max-w-3xl space-y-5 border-t border-brand-border pt-12 lg:border-t-0 lg:pt-0">
          <h3 className="font-heading text-xl font-semibold text-brand-text sm:text-2xl">{copy.historyTitle}</h3>
          <div className="space-y-4 text-base leading-[1.75] text-brand-muted">
            {copy.history.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>

        <div className="space-y-8 border-t border-brand-border pt-12">
          <h3 className="text-center font-heading text-xl font-semibold text-brand-text sm:text-2xl lg:text-left">
            {copy.teamTitle}
          </h3>
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} locale={locale} />
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
              (array de <code className="text-xs">src</code> y <code className="text-xs">alt</code>). La edición visual en panel llegará después.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
