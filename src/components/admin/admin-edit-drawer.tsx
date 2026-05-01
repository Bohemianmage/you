"use client";

import { useEffect, useMemo, useState } from "react";

import { SECTION_EDIT_META } from "@/components/admin/site-edit-registry";
import { useSiteContentEditOptional } from "@/components/admin/site-content-edit-provider";
import { SITE_CONTACT } from "@/constants/site-contact";
import type { HomeCopy } from "@/i18n/home";
import { HOME_COPY } from "@/i18n/home";
import type { Locale } from "@/i18n/types";
import { mergeHomeCopy, mergeSiteContact } from "@/lib/site-content/merge-public";
import type { SiteContentFile } from "@/lib/site-content/types";

function readField(
  locale: Locale,
  section: keyof HomeCopy,
  fieldKey: string,
  working: SiteContentFile,
): string {
  if (section === "hero" && fieldKey === "announcement") {
    return mergeHomeCopy(locale, HOME_COPY[locale], working).hero.announcement;
  }

  const defaults = HOME_COPY[locale][section];
  const defRec = typeof defaults === "object" && defaults !== null ? (defaults as Record<string, unknown>) : {};
  const patchRoot = (working.homeCopyByLocale?.[locale] ?? {}) as Record<string, unknown>;
  const patchSec = (patchRoot[section] ?? {}) as Record<string, unknown>;
  const v = patchSec[fieldKey] ?? defRec[fieldKey];
  if (Array.isArray(v)) return v.join("\n");
  return v != null ? String(v) : "";
}

export function AdminEditDrawer() {
  const ctx = useSiteContentEditOptional();
  const [draft, setDraft] = useState<Record<string, string>>({});

  const active = ctx?.activeSection ?? null;
  const locale = ctx?.marketingLocale ?? "es";
  const working = ctx?.working;

  const meta = active && active !== "contact" ? SECTION_EDIT_META[active] : null;

  useEffect(() => {
    if (!ctx || !active || !working) return;

    if (active === "contact") {
      const m = mergeSiteContact(working);
      setDraft({
        addressLine: m.addressLine,
        phoneDisplay: m.phoneDisplay,
        phoneHref: m.phoneHref,
      });
      return;
    }

    if (!meta) {
      setDraft({});
      return;
    }

    const next: Record<string, string> = {};
    for (const f of meta.fields) {
      const compound = `${String(f.section)}.${f.key}`;
      next[compound] = readField(locale, f.section, f.key, working);
    }
    setDraft(next);
  }, [ctx, active, locale, working, meta]);

  const title = useMemo(() => {
    if (active === "contact") return "Contacto (pie y bloque)";
    return meta?.title ?? "Editar";
  }, [active, meta]);

  if (!ctx || !active) return null;

  const edit = ctx;

  function apply() {
    if (active === "contact") {
      edit.patchWorking((w) => ({
        ...w,
        contact: {
          ...w.contact,
          addressLine: draft.addressLine ?? "",
          phoneDisplay: draft.phoneDisplay ?? "",
          phoneHref: draft.phoneHref ?? "",
        },
      }));
      edit.closeDrawer();
      return;
    }

    if (!meta) return;

    const bySection: Partial<Record<keyof HomeCopy, Record<string, unknown>>> = {};
    for (const f of meta.fields) {
      const compound = `${String(f.section)}.${f.key}`;
      const raw = draft[compound] ?? "";
      let val: unknown = raw;
      if (f.lines) {
        val = raw
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      const sec = f.section;
      if (!bySection[sec]) bySection[sec] = {};
      bySection[sec]![f.key] = val;
    }

    edit.patchWorking((w) => {
      const next = structuredClone(w);
      const hl = { ...(next.homeCopyByLocale ?? {}) };
      const curLoc = { ...((hl[locale] as Record<string, unknown> | undefined) ?? {}) };

      for (const [sec, patch] of Object.entries(bySection)) {
        const sk = sec as keyof HomeCopy;
        const prev = (curLoc[sk] as Record<string, unknown> | undefined) ?? {};
        curLoc[sk] = { ...prev, ...patch };
      }

      hl[locale] = curLoc;
      next.homeCopyByLocale = hl as SiteContentFile["homeCopyByLocale"];
      return next;
    });
    edit.closeDrawer();
  }

  return (
    <div className="fixed inset-0 z-[210] flex justify-end">
      <button type="button" className="flex-1 bg-black/40 backdrop-blur-[1px]" aria-label="Cerrar panel" onClick={edit.closeDrawer} />
      <aside className="flex h-full w-full max-w-md flex-col border-l border-brand-border bg-brand-bg shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-brand-border px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">
              {locale.toUpperCase()} · {active}
            </p>
            <h2 className="font-heading text-lg font-semibold text-brand-text">{title}</h2>
          </div>
          <button
            type="button"
            className="rounded-sm border border-brand-border px-2 py-1 text-xs text-brand-muted hover:text-brand-text"
            onClick={edit.closeDrawer}
          >
            ✕
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {active === "contact" ? (
            <>
              <label className="block text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">
                Dirección
                <textarea
                  rows={3}
                  value={draft.addressLine ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, addressLine: e.target.value }))}
                  className="mt-2 w-full rounded-sm border border-brand-border bg-brand-bg px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">
                Teléfono (visible)
                <input
                  type="text"
                  value={draft.phoneDisplay ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, phoneDisplay: e.target.value }))}
                  className="mt-2 w-full rounded-sm border border-brand-border bg-brand-bg px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">
                Enlace (tel:…)
                <input
                  type="text"
                  value={draft.phoneHref ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, phoneHref: e.target.value }))}
                  placeholder={SITE_CONTACT.phoneHref}
                  className="mt-2 w-full rounded-sm border border-brand-border bg-brand-bg px-3 py-2 text-sm"
                />
              </label>
            </>
          ) : meta ? (
            meta.fields.map((f) => {
              const compound = `${String(f.section)}.${f.key}`;
              return (
                <label key={compound} className="block text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">
                  <span className="text-brand-subtle">{String(f.section)}</span> · {f.label}
                  {f.multiline || f.lines ? (
                    <textarea
                      rows={f.lines ? 6 : 3}
                      value={draft[compound] ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, [compound]: e.target.value }))}
                      className="mt-2 w-full rounded-sm border border-brand-border bg-brand-bg px-3 py-2 text-sm"
                    />
                  ) : (
                    <input
                      type="text"
                      value={draft[compound] ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, [compound]: e.target.value }))}
                      className="mt-2 w-full rounded-sm border border-brand-border bg-brand-bg px-3 py-2 text-sm"
                    />
                  )}
                </label>
              );
            })
          ) : (
            <p className="text-sm text-brand-muted">Sección no editable desde aquí.</p>
          )}
        </div>

        <footer className="border-t border-brand-border px-5 py-4">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-sm border border-brand-border px-4 py-2 text-sm font-semibold text-brand-text"
              onClick={edit.closeDrawer}
            >
              Cancelar
            </button>
            <button type="button" className="rounded-sm bg-brand-accent px-4 py-2 text-sm font-semibold text-brand-white" onClick={apply}>
              Aplicar
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}
