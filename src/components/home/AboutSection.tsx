import Image from "next/image";
import Link from "next/link";

import {
  IconFacebook,
  IconLinkedIn,
  IconTwitter,
  iconClasses,
} from "@/components/icons/SocialIcons";
import { SITE_CONTACT } from "@/constants/site-contact";
import type { TeamMember } from "@/data/team";
import { TEAM_MEMBERS } from "@/data/team";
import type { HomeCopy } from "@/i18n/home";
import type { Locale } from "@/i18n/types";

interface AboutSectionProps {
  locale: Locale;
  copy: HomeCopy["about"];
  footerCopy: HomeCopy["footer"];
  contactHref: string;
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
 * Nosotros — contenido alineado con Wix about-1 (misión, historia, equipo, clientes + contacto).
 */
export function AboutSection({ locale, copy, footerCopy, contactHref }: AboutSectionProps) {
  return (
    <section id="about" className="border-b border-brand-border bg-brand-bg py-16 sm:py-24" aria-labelledby="about-heading">
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
            {TEAM_MEMBERS.map((member) => (
              <TeamMemberCard key={member.id} member={member} locale={locale} />
            ))}
          </ul>
        </div>

        <div className="grid gap-10 border-t border-brand-border pt-12 lg:grid-cols-[1fr_minmax(280px,360px)] lg:items-start lg:gap-14">
          <div className="space-y-3 text-center lg:text-left">
            <h3 className="font-heading text-xl font-semibold text-brand-text sm:text-2xl">{copy.clientsTitle}</h3>
            <p className="text-sm leading-relaxed text-brand-muted">{copy.clientsSubtitle}</p>
          </div>
          <aside className="rounded-sm border border-brand-border bg-brand-surface p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)] ring-1 ring-brand-border/40">
            <h4 className="font-heading text-sm font-semibold uppercase tracking-[0.14em] text-brand-accent">{copy.contactTitle}</h4>
            <address className="mt-4 text-sm font-medium leading-relaxed text-brand-muted not-italic">{SITE_CONTACT.addressLine}</address>
            <p className="mt-4 text-sm text-brand-muted">
              {footerCopy.phoneLabel}{" "}
              <a href={SITE_CONTACT.phoneHref} className="font-semibold text-brand-accent hover:text-brand-accent-strong">
                {SITE_CONTACT.phoneDisplay}
              </a>
            </p>
            <Link
              href={contactHref}
              className="mt-6 inline-flex w-full items-center justify-center rounded-sm bg-brand-accent px-5 py-3 text-center text-xs font-bold uppercase tracking-[0.12em] text-brand-white shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition hover:bg-brand-accent-strong sm:w-auto"
            >
              {copy.contactFormCta}
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
