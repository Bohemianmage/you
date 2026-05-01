"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSiteContentEditOptional } from "@/components/admin/site-content-edit-provider";
import { AdminListDisclosureRow } from "@/components/admin/admin-list-disclosure";
import { SiteAssetUploadButton } from "@/components/admin/SiteAssetUploadButton";
import { TeamPhotoFramingEditor } from "@/components/admin/TeamPhotoFramingEditor";
import type { CatalogProperty } from "@/data/catalog-properties";
import type { DownloadableItem } from "@/data/downloadables";
import type { TeamMember } from "@/data/team";
import type { AdminEditorSeed } from "@/lib/site-content/editor-seed";
import type { SiteContentFile } from "@/lib/site-content/types";

type TabId = "team" | "featured" | "downloadables" | "advisors";

function newTeamId(): string {
  return `member-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyTeamMember(): TeamMember {
  return {
    id: newTeamId(),
    name: "",
    role: { es: "", en: "" },
  };
}

function newDownloadableId(): string {
  return `dl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyDownloadable(): DownloadableItem {
  return { id: newDownloadableId(), title: "", description: "" };
}

function reorderArray<T>(items: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return [...items];
  const next = [...items];
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
}

/** Conserva orden; elimina duplicados e IDs que ya no están en el inventario EasyBroker. */
function normalizeFeaturedIds(ids: readonly string[], catalog: readonly CatalogProperty[]): string[] {
  const catalogIds = new Set(catalog.map((c) => c.id));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (!catalogIds.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function normalizeAdvisorMap(map: Record<string, string>, catalog: readonly CatalogProperty[]): Record<string, string> {
  const catalogIds = new Set(catalog.map((c) => c.id));
  const out: Record<string, string> = {};
  for (const [catalogId, advisorId] of Object.entries(map)) {
    const a = advisorId?.trim();
    if (!catalogIds.has(catalogId) || !a) continue;
    out[catalogId] = a;
  }
  return out;
}

const tabBtn =
  "rounded-sm border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-200 ease-out motion-reduce:transition-none";
const tabActive = "border-brand-accent bg-brand-accent/15 text-brand-accent-strong";
const tabIdle = "border-brand-border bg-brand-bg text-brand-muted hover:border-brand-accent hover:text-brand-accent";

const labelClass = "block text-xs font-bold uppercase tracking-[0.12em] text-brand-muted";
const inputClass =
  "mt-2 w-full rounded-sm border border-brand-border bg-brand-bg px-3 py-2 text-sm outline-none ring-brand-accent focus:border-brand-accent focus:ring-1";

const dragHandleClass =
  "mr-2 inline-flex shrink-0 cursor-grab select-none items-center justify-center rounded-sm border border-transparent px-1 py-1 text-brand-muted hover:border-brand-border hover:bg-brand-surface hover:text-brand-text active:cursor-grabbing";

export function AdminListsEditor({ seed }: { seed: AdminEditorSeed }) {
  const edit = useSiteContentEditOptional();
  const [tab, setTab] = useState<TabId>("team");
  const [downloadLocale, setDownloadLocale] = useState<"es" | "en">("es");

  const [team, setTeam] = useState<TeamMember[]>(() => seed.team.map((m) => structuredClone(m)));
  /** Evita que editar el slug cierre la fila; no se persiste en JSON. */
  const [teamStableIds, setTeamStableIds] = useState<string[]>(() => seed.team.map((m) => m.id));
  const [featuredCatalogIds, setFeaturedCatalogIds] = useState<string[]>(() => [...seed.featuredCatalogIds]);
  const catalog = seed.catalog;
  const [downloadablesEs, setDownloadablesEs] = useState<DownloadableItem[]>(() => seed.downloadablesEs.map((d) => ({ ...d })));
  const [downloadablesEn, setDownloadablesEn] = useState<DownloadableItem[]>(() => seed.downloadablesEn.map((d) => ({ ...d })));
  const [dlStableKeys, setDlStableKeys] = useState<{ es: string[]; en: string[] }>(() => ({
    es: seed.downloadablesEs.map((d) => d.id),
    en: seed.downloadablesEn.map((d) => d.id),
  }));


  const [dragTeamIdx, setDragTeamIdx] = useState<number | null>(null);
  const [dragFeaturedIdx, setDragFeaturedIdx] = useState<number | null>(null);
  const [dragDlIdx, setDragDlIdx] = useState<number | null>(null);

  const [advisorMap, setAdvisorMap] = useState<Record<string, string>>(() => ({ ...seed.propertyAdvisorByCatalogId }));
  const [advisorSearch, setAdvisorSearch] = useState("");

  const [expandedRows, setExpandedRows] = useState<Set<string>>(() => new Set());
  const toggleRow = useCallback((key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const baselineSigRef = useRef<string | null>(null);
  useEffect(() => {
    if (!edit?.patchWorking) {
      baselineSigRef.current = null;
      return;
    }
    const normalizedFeatured = normalizeFeaturedIds(featuredCatalogIds, catalog);
    const normalizedAdvisors = normalizeAdvisorMap(advisorMap, catalog);
    const sig = JSON.stringify({
      team,
      featuredCatalogIds: normalizedFeatured,
      downloadablesByLocale: { es: downloadablesEs, en: downloadablesEn },
      propertyAdvisorByCatalogId: normalizedAdvisors,
    });
    if (baselineSigRef.current === null) {
      baselineSigRef.current = sig;
      return;
    }
    if (sig === baselineSigRef.current) return;
    edit.patchWorking((w) => {
      const next: SiteContentFile = {
        ...w,
        team,
        featuredCatalogIds: normalizedFeatured,
        downloadablesByLocale: { es: downloadablesEs, en: downloadablesEn },
      };
      delete next.featuredByLocale;
      if (Object.keys(normalizedAdvisors).length > 0) {
        next.propertyAdvisorByCatalogId = normalizedAdvisors;
      } else {
        delete next.propertyAdvisorByCatalogId;
      }
      return next;
    });
    baselineSigRef.current = sig;
  }, [edit, team, featuredCatalogIds, catalog, downloadablesEs, downloadablesEn, advisorMap]);

  function updateTeam(i: number, patch: Partial<TeamMember>) {
    setTeam((prev) => prev.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  }

  function updateTeamRole(index: number, localeKey: "es" | "en", value: string) {
    setTeam((prev) =>
      prev.map((m, j) =>
        j === index
          ? {
              ...m,
              role: { ...m.role, [localeKey]: value },
            }
          : m,
      ),
    );
  }

  const downloadList = downloadLocale === "es" ? downloadablesEs : downloadablesEn;
  const setDownloadList = downloadLocale === "es" ? setDownloadablesEs : setDownloadablesEn;

  function updateDownloadable(idx: number, patch: Partial<DownloadableItem>) {
    setDownloadList((prev) => prev.map((d, j) => (j === idx ? { ...d, ...patch } : d)));
  }

  const catalogById = useMemo(() => new Map(catalog.map((c) => [c.id, c])), [catalog]);

  const featuredPool = useMemo(
    () =>
      catalog.filter((c) => c.active !== false && !featuredCatalogIds.includes(c.id)),
    [catalog, featuredCatalogIds],
  );

  const advisorCatalogRows = useMemo(() => {
    const q = advisorSearch.trim().toLowerCase();
    return catalog
      .filter((c) => c.active !== false)
      .filter((c) => {
        if (!q) return true;
        return c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
      })
      .sort((a, b) => a.title.localeCompare(b.title, "es"));
  }, [catalog, advisorSearch]);

  return (
    <div className="mt-10 space-y-8">
      {edit?.saveError ? (
        <p className="rounded-sm border border-brand-accent/40 bg-brand-accent/10 px-4 py-3 text-sm text-brand-accent-strong">{edit.saveError}</p>
      ) : null}

      <div className="flex flex-wrap gap-2 rounded-sm border border-brand-border/80 bg-brand-surface/30 p-1">
        <button type="button" className={`${tabBtn} ${tab === "team" ? tabActive : tabIdle}`} onClick={() => setTab("team")}>
          Equipo
        </button>
        <button type="button" className={`${tabBtn} ${tab === "featured" ? tabActive : tabIdle}`} onClick={() => setTab("featured")}>
          Destacadas
        </button>
        <button type="button" className={`${tabBtn} ${tab === "downloadables" ? tabActive : tabIdle}`} onClick={() => setTab("downloadables")}>
          Descargables
        </button>
        <button type="button" className={`${tabBtn} ${tab === "advisors" ? tabActive : tabIdle}`} onClick={() => setTab("advisors")}>
          Asesores en propiedades
        </button>
      </div>

      {tab === "team" ? (
        <div className="space-y-6">
          <ul className="space-y-4">
            {team.map((member, i) => {
              const stableId = teamStableIds[i] ?? member.id;
              const rowKey = `team:${stableId}`;
              return (
              <li
                key={stableId}
                className={`rounded-sm border border-brand-border bg-brand-bg pb-2 shadow-sm transition ${dragTeamIdx === i ? "opacity-55" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = Number(e.dataTransfer.getData("text/plain"));
                  setDragTeamIdx(null);
                  if (Number.isNaN(from)) return;
                  setTeam((prev) => reorderArray(prev, from, i));
                  setTeamStableIds((prev) => reorderArray(prev, from, i));
                }}
              >
                <AdminListDisclosureRow
                  open={expandedRows.has(rowKey)}
                  onToggle={() => toggleRow(rowKey)}
                  dragHandle={
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label="Arrastrar para reordenar"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", String(i));
                        e.dataTransfer.effectAllowed = "move";
                        setDragTeamIdx(i);
                      }}
                      onDragEnd={() => setDragTeamIdx(null)}
                      className={dragHandleClass}
                    >
                      <span aria-hidden className="text-base leading-none tracking-tight">
                        ⋮⋮
                      </span>
                    </span>
                  }
                  title={
                    <span className="font-heading text-sm font-semibold text-brand-text">
                      {member.name.trim() || `Persona ${i + 1}`}
                    </span>
                  }
                  actions={
                    <button
                      type="button"
                      className="text-xs font-bold uppercase tracking-[0.12em] text-brand-accent hover:underline"
                      onClick={() => {
                        setTeam((prev) => prev.filter((_, j) => j !== i));
                        setTeamStableIds((prev) => prev.filter((_, j) => j !== i));
                      }}
                    >
                      Quitar
                    </button>
                  }
                >
                <div className="grid gap-6 border-t border-brand-border/60 pt-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-8">
                  <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    ID
                    <input type="text" value={member.id} onChange={(e) => updateTeam(i, { id: e.target.value })} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    Nombre
                    <input type="text" value={member.name} onChange={(e) => updateTeam(i, { name: e.target.value })} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    Rol (ES)
                    <input type="text" value={member.role.es} onChange={(e) => updateTeamRole(i, "es", e.target.value)} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    Rol (EN)
                    <input type="text" value={member.role.en} onChange={(e) => updateTeamRole(i, "en", e.target.value)} className={inputClass} />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Imagen (ruta bajo /public, opcional)
                    <input
                      type="text"
                      value={member.imageSrc ?? ""}
                      onChange={(e) => updateTeam(i, { imageSrc: e.target.value || undefined })}
                      placeholder="/team/ejemplo.jpg"
                      className={inputClass}
                    />
                    <SiteAssetUploadButton kind="image" subfolder="team" onUploaded={(url) => updateTeam(i, { imageSrc: url })} />
                  </label>
                  <label className={labelClass}>
                    Correo
                    <input
                      type="email"
                      value={member.email ?? ""}
                      onChange={(e) => updateTeam(i, { email: e.target.value || undefined })}
                      placeholder="nombre@ejemplo.com"
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Teléfono visible
                    <input
                      type="text"
                      value={member.phoneDisplay ?? ""}
                      onChange={(e) => updateTeam(i, { phoneDisplay: e.target.value || undefined })}
                      placeholder="55-1234-5678"
                      className={inputClass}
                    />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Teléfono enlace (tel:)
                    <input
                      type="text"
                      value={member.phoneHref ?? ""}
                      onChange={(e) => updateTeam(i, { phoneHref: e.target.value || undefined })}
                      placeholder="tel:+5255..."
                      className={inputClass}
                    />
                  </label>
                  </div>
                  <aside className="lg:sticky lg:top-24">
                    <TeamPhotoFramingEditor member={member} onPatch={(patch) => updateTeam(i, patch)} />
                  </aside>
                </div>
                </AdminListDisclosureRow>
              </li>
            );
            })}
          </ul>
          <button
            type="button"
            className="rounded-sm border border-dashed border-brand-border px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-accent hover:bg-brand-accent/10"
            onClick={() => {
              const m = emptyTeamMember();
              setTeam((prev) => [...prev, m]);
              setTeamStableIds((prev) => [...prev, m.id]);
            }}
          >
            + Agregar persona
          </button>
        </div>
      ) : null}

      {tab === "featured" ? (
        <div className="space-y-8">
          <p className="text-sm text-brand-muted">
            Orden de propiedades <strong className="text-brand-text">EasyBroker</strong> en el inicio. Los datos de cada ficha vienen del feed.
          </p>

          <div>
            <h3 className="font-heading text-sm font-semibold text-brand-text">Orden en el inicio</h3>
            <ul className="mt-4 space-y-4">
              {featuredCatalogIds.length === 0 ? (
                <li className="rounded-sm border border-dashed border-brand-border bg-brand-bg px-4 py-6 text-sm text-brand-muted">
                  Ninguna propiedad destacada. Agrega una desde el listado inferior.
                </li>
              ) : null}
              {featuredCatalogIds.map((id, idx) => {
                const prop = catalogById.get(id);
                const rowKey = `feat:${id}`;
                return (
                  <li
                    key={`${id}-${idx}`}
                    className={`rounded-sm border border-brand-border bg-brand-bg pb-2 shadow-sm transition ${dragFeaturedIdx === idx ? "opacity-55" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const from = Number(e.dataTransfer.getData("text/plain"));
                      setDragFeaturedIdx(null);
                      if (Number.isNaN(from)) return;
                      setFeaturedCatalogIds((prev) => reorderArray(prev, from, idx));
                    }}
                  >
                    <AdminListDisclosureRow
                      open={expandedRows.has(rowKey)}
                      onToggle={() => toggleRow(rowKey)}
                      dragHandle={
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label="Arrastrar para reordenar"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", String(idx));
                            e.dataTransfer.effectAllowed = "move";
                            setDragFeaturedIdx(idx);
                          }}
                          onDragEnd={() => setDragFeaturedIdx(null)}
                          className={`${dragHandleClass} mt-0.5`}
                        >
                          <span aria-hidden className="text-base leading-none tracking-tight">
                            ⋮⋮
                          </span>
                        </span>
                      }
                      title={
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-brand-text">{prop?.title ?? `(sin catálogo: ${id})`}</span>
                          <span className="block truncate text-xs text-brand-muted">{id}</span>
                        </span>
                      }
                      actions={
                        <button
                          type="button"
                          className="text-xs font-bold uppercase tracking-[0.12em] text-brand-accent hover:underline"
                          onClick={() => setFeaturedCatalogIds((prev) => prev.filter((x) => x !== id))}
                        >
                          Quitar
                        </button>
                      }
                    >
                      <p className="border-t border-brand-border/60 pt-4 text-xs text-brand-muted">
                        Si cambias datos en EasyBroker, actualiza esta página para verlos aquí.
                      </p>
                    </AdminListDisclosureRow>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold text-brand-text">Agregar desde el catálogo</h3>
            <ul className="mt-4 space-y-2">
              {featuredPool.length === 0 ? (
                <li className="text-sm text-brand-muted">No hay más propiedades para agregar.</li>
              ) : (
                featuredPool.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-brand-border/80 bg-brand-surface/40 px-3 py-2"
                  >
                    <span className="text-sm text-brand-text">{c.title}</span>
                    <button
                      type="button"
                      className="rounded-full bg-brand-accent px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-white transition hover:bg-brand-accent-strong"
                      onClick={() => setFeaturedCatalogIds((prev) => [...prev, c.id])}
                    >
                      Destacar
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}

      {tab === "advisors" ? (
        <div className="space-y-6">
          <p className="text-sm text-brand-muted">
            Asigna un miembro del <strong className="text-brand-text">Equipo</strong> a cada propiedad del catálogo EasyBroker para activar la agenda en la ficha
            y el envío de correos al asesor (necesita <strong className="text-brand-text">correo</strong> en su ficha).
          </p>
          <label className={labelClass}>
            Buscar en catálogo
            <input
              type="search"
              value={advisorSearch}
              onChange={(e) => setAdvisorSearch(e.target.value)}
              placeholder="Título o ID…"
              className={inputClass}
            />
          </label>
          <ul className="max-h-[min(560px,70vh)] space-y-2 overflow-y-auto pr-1">
            {advisorCatalogRows.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 rounded-sm border border-brand-border/80 bg-brand-surface/40 px-3 py-2">
                <span className="min-w-0 flex-1 text-sm font-medium text-brand-text">
                  <span className="line-clamp-2">{c.title}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-brand-muted">{c.id}</span>
                </span>
                <select
                  value={advisorMap[c.id] ?? ""}
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    setAdvisorMap((prev) => {
                      const next = { ...prev };
                      if (!v) delete next[c.id];
                      else next[c.id] = v;
                      return next;
                    });
                  }}
                  className="min-w-[200px] rounded-sm border border-brand-border bg-brand-bg px-3 py-2 text-xs font-semibold text-brand-text outline-none focus:border-brand-accent"
                >
                  <option value="">Sin asignar</option>
                  {team.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name.trim() || m.id}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {tab === "downloadables" ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 rounded-sm border border-brand-border/80 bg-brand-surface/30 p-1">
            <button type="button" className={`${tabBtn} ${downloadLocale === "es" ? tabActive : tabIdle}`} onClick={() => setDownloadLocale("es")}>
              Español
            </button>
            <button type="button" className={`${tabBtn} ${downloadLocale === "en" ? tabActive : tabIdle}`} onClick={() => setDownloadLocale("en")}>
              English
            </button>
          </div>
          <ul className="space-y-4">
            {downloadList.map((item, idx) => {
              const stableDlId = dlStableKeys[downloadLocale][idx] ?? item.id;
              const rowKey = `dl:${downloadLocale}:${stableDlId}`;
              return (
              <li
                key={stableDlId}
                className={`rounded-sm border border-brand-border bg-brand-bg pb-2 shadow-sm transition ${dragDlIdx === idx ? "opacity-55" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = Number(e.dataTransfer.getData("text/plain"));
                  setDragDlIdx(null);
                  if (Number.isNaN(from)) return;
                  setDownloadList((prev) => reorderArray(prev, from, idx));
                  const loc = downloadLocale;
                  setDlStableKeys((prev) => ({
                    ...prev,
                    [loc]: reorderArray(prev[loc], from, idx),
                  }));
                }}
              >
                <AdminListDisclosureRow
                  open={expandedRows.has(rowKey)}
                  onToggle={() => toggleRow(rowKey)}
                  dragHandle={
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label="Arrastrar para reordenar"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", String(idx));
                        e.dataTransfer.effectAllowed = "move";
                        setDragDlIdx(idx);
                      }}
                      onDragEnd={() => setDragDlIdx(null)}
                      className={dragHandleClass}
                    >
                      <span aria-hidden className="text-base leading-none tracking-tight">
                        ⋮⋮
                      </span>
                    </span>
                  }
                  title={
                    <span className="font-heading text-sm font-semibold text-brand-text">
                      {item.title.trim() || `Ítem ${idx + 1}`}
                    </span>
                  }
                  actions={
                    <button
                      type="button"
                      className="text-xs font-bold uppercase tracking-[0.12em] text-brand-accent hover:underline"
                      onClick={() => {
                        const loc = downloadLocale;
                        setDownloadList((prev) => prev.filter((_, j) => j !== idx));
                        setDlStableKeys((prev) => ({
                          ...prev,
                          [loc]: prev[loc].filter((_, j) => j !== idx),
                        }));
                      }}
                    >
                      Quitar
                    </button>
                  }
                >
                <div className="grid gap-4 border-t border-brand-border/60 pt-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    ID
                    <input type="text" value={item.id} onChange={(e) => updateDownloadable(idx, { id: e.target.value })} className={inputClass} />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Título
                    <input type="text" value={item.title} onChange={(e) => updateDownloadable(idx, { title: e.target.value })} className={inputClass} />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Descripción
                    <textarea rows={3} value={item.description} onChange={(e) => updateDownloadable(idx, { description: e.target.value })} className={inputClass} />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    URL archivo (PDF, etc.)
                    <input
                      type="text"
                      value={item.fileUrl ?? ""}
                      onChange={(e) => updateDownloadable(idx, { fileUrl: e.target.value || undefined })}
                      placeholder="/docs/brochure.pdf"
                      className={inputClass}
                    />
                    <SiteAssetUploadButton kind="pdf" subfolder="downloadables" onUploaded={(url) => updateDownloadable(idx, { fileUrl: url })} />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Imagen tarjeta (opcional)
                    <input
                      type="text"
                      value={item.imageSrc ?? ""}
                      onChange={(e) => updateDownloadable(idx, { imageSrc: e.target.value || undefined })}
                      className={inputClass}
                    />
                    <SiteAssetUploadButton
                      kind="image"
                      subfolder="downloadables"
                      label="Subir miniatura"
                      onUploaded={(url) => updateDownloadable(idx, { imageSrc: url })}
                    />
                  </label>
                </div>
                </AdminListDisclosureRow>
              </li>
            );
            })}
          </ul>
          <button
            type="button"
            className="rounded-sm border border-dashed border-brand-border px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-accent hover:bg-brand-accent/10"
            onClick={() => {
              const d = emptyDownloadable();
              const loc = downloadLocale;
              setDownloadList((prev) => [...prev, d]);
              setDlStableKeys((prev) => ({
                ...prev,
                [loc]: [...prev[loc], d.id],
              }));
            }}
          >
            + Agregar descargable
          </button>
        </div>
      ) : null}

    </div>
  );
}
