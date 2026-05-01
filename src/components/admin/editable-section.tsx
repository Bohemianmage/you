"use client";

import type { ReactNode } from "react";

import { useSiteContentEditOptional } from "@/components/admin/site-content-edit-provider";

export function EditableSection({ sectionId, label, children }: { sectionId: string; label: string; children: ReactNode }) {
  const ctx = useSiteContentEditOptional();
  if (!ctx) return <>{children}</>;

  return (
    <div className="group relative">
      {children}
      <button
        type="button"
        className="absolute right-2 top-2 z-30 flex h-9 items-center rounded-full border border-brand-accent bg-brand-bg/95 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-accent shadow-md opacity-0 transition hover:bg-brand-accent hover:text-brand-white group-hover:opacity-100 focus:opacity-100"
        onClick={() => ctx.openSection(sectionId)}
      >
        {label}
      </button>
    </div>
  );
}
