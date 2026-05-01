"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

import { useLiveSite } from "@/components/layout/MarketingPageFrame";
import type { TeamMember } from "@/data/team";
import type { Locale } from "@/i18n/types";

function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function TeamMemberFlipCard({ member, locale }: { member: TeamMember; locale: Locale }) {
  const { contact } = useLiveSite();
  const [flipped, setFlipped] = useState(false);

  const toggle = useCallback(() => setFlipped((v) => !v), []);

  const flipBackHint = locale === "en" ? "Tap anywhere to flip back" : "Toca para volver";
  const flipFrontHint = locale === "en" ? "Tap for email & phone" : "Toca para correo y teléfono";
  const office = locale === "en" ? "Office" : "Oficina";

  const hasDirect =
    !!(member.email?.trim() || member.phoneHref?.trim() || member.phoneDisplay?.trim());

  return (
    <li className="[perspective:1000px]">
      <div
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        className="relative mx-auto h-[min(28rem,72vw)] w-full max-w-[20rem] cursor-pointer rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 sm:h-[22rem] sm:max-w-none"
        aria-label={flipped ? `${member.name} — ${flipBackHint}` : `${member.name} — ${flipFrontHint}`}
      >
        <div
          className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
        >
          <div className="absolute inset-0 flex flex-col overflow-hidden rounded-sm border border-brand-border bg-brand-bg shadow-[0_1px_4px_rgba(0,0,0,0.08)] [backface-visibility:hidden]">
            <div className="relative min-h-[55%] w-full flex-1 bg-gradient-to-br from-brand-surface to-brand-border/40 sm:min-h-0">
              {member.imageSrc ? (
                <Image
                  src={member.imageSrc}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="flex h-full min-h-[12rem] w-full items-center justify-center bg-gradient-to-br from-brand-accent/15 via-brand-surface to-brand-accent/10">
                  <span className="font-heading text-2xl font-semibold tracking-wide text-brand-accent">{memberInitials(member.name)}</span>
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <p className="font-heading text-base font-semibold text-brand-text">{member.name}</p>
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-brand-muted">{member.role[locale]}</p>
              <p className="mt-auto border-t border-brand-border/60 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-accent">{flipFrontHint}</p>
            </div>
          </div>

          <div className="absolute inset-0 flex flex-col justify-center gap-4 rounded-sm border border-brand-border bg-brand-surface p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="font-heading text-base font-semibold text-brand-text">{member.name}</p>
            {member.email?.trim() ? (
              <a
                href={`mailto:${member.email.trim()}`}
                className="break-all text-sm font-medium text-brand-accent underline-offset-2 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {member.email.trim()}
              </a>
            ) : null}
            {member.phoneHref?.trim() || member.phoneDisplay?.trim() ? (
              <a
                href={member.phoneHref?.trim() || `tel:${(member.phoneDisplay ?? "").replace(/\D/g, "")}`}
                className="text-sm font-medium text-brand-accent underline-offset-2 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {member.phoneDisplay?.trim() || member.phoneHref}
              </a>
            ) : null}
            {!hasDirect ? (
              <p className="text-sm leading-relaxed text-brand-muted">
                {office}:{" "}
                <a
                  href={contact.phoneHref}
                  className="font-semibold text-brand-accent underline-offset-2 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {contact.phoneDisplay}
                </a>
              </p>
            ) : null}
            <p className="mt-auto border-t border-brand-border/60 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-muted">{flipBackHint}</p>
          </div>
        </div>
      </div>
    </li>
  );
}
