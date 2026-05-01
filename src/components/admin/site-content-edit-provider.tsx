"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { logoutAdmin } from "@/app/admin/actions";
import { saveSiteContent } from "@/app/actions/site-content";
import { AdminEditDrawer } from "@/components/admin/admin-edit-drawer";
import type { Locale } from "@/i18n/types";
import type { SiteContentFile } from "@/lib/site-content/types";

type EditContextValue = {
  working: SiteContentFile;
  patchWorking: (fn: (w: SiteContentFile) => SiteContentFile) => void;
  openSection: (id: string) => void;
  activeSection: string | null;
  closeDrawer: () => void;
  marketingLocale: Locale;
  setMarketingLocale: (l: Locale) => void;
  dirty: boolean;
  discard: () => void;
  save: () => Promise<void>;
  saveError: string | null;
  saving: boolean;
};

const SiteContentEditContext = createContext<EditContextValue | null>(null);

export function useSiteContentEditOptional() {
  return useContext(SiteContentEditContext);
}

function mapSaveError(e: string): string {
  const m: Record<string, string> = {
    invalid_json: "JSON inválido.",
    validation: "Revisá los datos.",
    write_failed: "No se pudo escribir el archivo.",
    github_unauthorized: "GitHub: token inválido.",
    github_forbidden: "GitHub: sin permiso.",
    github_not_found: "GitHub: repo o rama incorrectos.",
    github_conflict: "GitHub: conflicto al guardar.",
    github_validation: "GitHub: rechazó la petición.",
    github_rate_limit: "GitHub: límite de uso.",
    github_unknown: "GitHub: error desconocido.",
  };
  return m[e] ?? "No se pudo guardar.";
}

function SiteAdminToolbar({
  saveNoticeOpen,
  dismissSaveNotice,
}: {
  saveNoticeOpen: boolean;
  dismissSaveNotice: () => void;
}) {
  const ctx = useContext(SiteContentEditContext);
  if (!ctx) return null;
  const { dirty, discard, save, saving, saveError } = ctx;

  return (
    <>
      {saveNoticeOpen ? (
        <div className="fixed inset-0 z-[240] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
            aria-label="Cerrar"
            onClick={dismissSaveNotice}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="site-save-notice-title"
            className="relative z-10 w-full max-w-sm rounded-sm border border-brand-border bg-brand-bg p-6 shadow-xl ring-1 ring-brand-border/60"
          >
            <p id="site-save-notice-title" className="text-center font-heading text-base font-semibold text-brand-text">
              Cambios guardados
            </p>
            <button
              type="button"
              className="mt-5 w-full rounded-sm bg-brand-accent py-3 text-xs font-bold uppercase tracking-[0.14em] text-brand-white shadow-sm hover:bg-brand-accent-strong"
              onClick={dismissSaveNotice}
            >
              Entendido
            </button>
          </div>
        </div>
      ) : null}
      <div className="fixed bottom-0 left-0 right-0 z-[190] border-t border-brand-border bg-brand-bg/95 px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">Modo edición</p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/listas"
            className="rounded-sm border border-brand-border bg-brand-bg px-3 py-2 text-xs font-semibold text-brand-text no-underline hover:border-brand-accent"
          >
            Listas y catálogo
          </Link>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="rounded-sm border border-brand-border px-3 py-2 text-xs font-semibold text-brand-muted hover:text-brand-text"
            >
              Cerrar sesión
            </button>
          </form>
          <button
            type="button"
            className="rounded-sm border border-brand-border px-4 py-2 text-xs font-semibold text-brand-text disabled:opacity-40"
            disabled={!dirty || saving}
            onClick={discard}
          >
            Descartar
          </button>
          <button
            type="button"
            className="rounded-sm bg-brand-accent px-4 py-2 text-xs font-semibold text-brand-white shadow-sm disabled:opacity-40"
            disabled={!dirty || saving}
            onClick={() => void save()}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
      {saveError ? <p className="mx-auto mt-2 max-w-6xl text-center text-xs text-brand-accent-strong">{saveError}</p> : null}
      </div>
    </>
  );
}

export function SiteContentEditProvider({
  enabled,
  initialPersisted,
  children,
}: {
  enabled: boolean;
  initialPersisted: SiteContentFile;
  children: ReactNode;
}) {
  const router = useRouter();
  const baselineKey = useMemo(() => JSON.stringify(initialPersisted), [initialPersisted]);

  const [working, setWorking] = useState<SiteContentFile>(() => structuredClone(initialPersisted));
  const [dirty, setDirty] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [marketingLocale, setMarketingLocale] = useState<Locale>("es");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveNoticeOpen, setSaveNoticeOpen] = useState(false);

  useEffect(() => {
    if (!dirty) {
      setWorking(structuredClone(initialPersisted));
    }
  }, [baselineKey, initialPersisted, dirty]);

  const patchWorking = useCallback((fn: (w: SiteContentFile) => SiteContentFile) => {
    setWorking((prev) => fn(structuredClone(prev)));
    setDirty(true);
    setSaveError(null);
  }, []);

  const discard = useCallback(() => {
    setWorking(structuredClone(initialPersisted));
    setDirty(false);
    setSaveError(null);
    setSaveNoticeOpen(false);
  }, [initialPersisted]);

  const save = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    const res = await saveSiteContent(JSON.stringify(working));
    setSaving(false);
    if (!res.ok) {
      setSaveError(mapSaveError(res.error));
      return;
    }
    setDirty(false);
    setSaveNoticeOpen(true);
    router.refresh();
  }, [working, router]);

  const dismissSaveNotice = useCallback(() => setSaveNoticeOpen(false), []);

  const openSection = useCallback((id: string) => setActiveSection(id), []);
  const closeDrawer = useCallback(() => setActiveSection(null), []);

  const ctxValue = useMemo<EditContextValue>(
    () => ({
      working,
      patchWorking,
      openSection,
      activeSection,
      closeDrawer,
      marketingLocale,
      setMarketingLocale,
      dirty,
      discard,
      save,
      saveError,
      saving,
    }),
    [
      working,
      patchWorking,
      openSection,
      activeSection,
      closeDrawer,
      marketingLocale,
      dirty,
      discard,
      save,
      saveError,
      saving,
    ],
  );

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <SiteContentEditContext.Provider value={ctxValue}>
      <div className="min-h-full pb-28">{children}</div>
      <SiteAdminToolbar saveNoticeOpen={saveNoticeOpen} dismissSaveNotice={dismissSaveNotice} />
      <AdminEditDrawer />
    </SiteContentEditContext.Provider>
  );
}
