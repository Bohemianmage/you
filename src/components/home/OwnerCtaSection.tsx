import Link from "next/link";

import type { HomeCopy } from "@/i18n/home";

interface OwnerCtaSectionProps {
  copy: HomeCopy["owner"];
}

/**
 * Owner CTA — Wix uses uppercase small heading + text button on neutral ground.
 */
export function OwnerCtaSection({ copy }: OwnerCtaSectionProps) {
  return (
    <section id="owner" className="border-b border-brand-border bg-brand-bg py-16 sm:py-20" aria-labelledby="owner-heading">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <h2 id="owner-heading" className="font-heading text-lg font-semibold uppercase tracking-[0.12em] text-brand-muted sm:text-xl">
          {copy.title}
        </h2>
        <Link
          href="#contact"
          className="mt-8 inline-flex items-center justify-center rounded-sm bg-brand-accent px-10 py-3 text-xs font-bold uppercase tracking-[0.16em] text-brand-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition hover:bg-brand-accent-strong"
        >
          {copy.cta}
        </Link>
      </div>
    </section>
  );
}
