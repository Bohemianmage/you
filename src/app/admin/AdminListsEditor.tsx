"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSiteContentEditOptional } from "@/components/admin/site-content-edit-provider";
import { AdminListDisclosureRow } from "@/components/admin/admin-list-disclosure";
import { SiteAssetUploadButton } from "@/components/admin/SiteAssetUploadButton";
import type { CatalogProperty } from "@/data/catalog-properties";
import type { DownloadableItem } from "@/data/downloadables";
import type { TeamMember } from "@/data/team";
import type { AdminEditorSeed } from "@/lib/site-content/editor-seed";
import type { SiteContentFile } from "@/lib/site-content/types";
import type { TeamImageFocusPreset } from "@/lib/team-image-framing";
import { clampTeamImageZoom, TEAM_IMAGE_FOCUS_OPTIONS } from "@/lib/team-image-framing";

const DEFAULT_TEAM_IMAGE_FOCUS: TeamImageFocusPreset = "center";

type TabId = "team" | "featured" | "catalog" | "downloadables";

function newTeamId(): string {
  return `member-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function newPropertyId(): string {
  return `prop-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyTeamMember(): TeamMember {
  return {
    id: newTeamId(),
    name: "",
    role: { es: "", en: "" },
  };
}

function emptyCatalog(): CatalogProperty {
  return {
    id: newPropertyId(),
    title: "",
    price: "",
    specs: "",
    zone: "",
  };
}

function newDownloadableId(): string {
  return `dl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function optionalInt(raw: string): number | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const n = parseInt(t, 10);
  return Number.isFinite(n) ? n : undefined;
}

function optionalFloat(raw: string): number | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
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

/** Conserva orden; elimina duplicados e IDs que ya no están en el catálogo. */
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

const tabBtn =
  "rounded-sm border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-200 ease-out motion-reduce:transition-none";
const tabActive = "border-brand-accent bg-brand-accent/15 text-brand-accent-strong";
const tabIdle = "border-brand-border bg-brand-bg text-brand-muted hover:border-brand-accent hover:text-brand-accent";

const labelClass = "block text-xs font-bold uppercase tracking-[0.12em] text-brand-muted";
const inputClass =
  "mt-2 w-full rounded-sm border border-brand-border bg-brand-bg px-3 py-2 text-sm outline-none ring-brand-accent focus:border-brand-accent focus:ring-1";

const dragHandleClass =
  "mr-2 inline-flex shrink-0 cursor-grab select-none items-center justify-center rounded-sm border border-transparent px-1 py-1 text-brand-muted hover:border-brand-border hover:bg-brand-surface hover:text-brand-text active:cursor-grabbing";

const pillWrap =
  "inline-flex rounded-full border border-brand-border bg-brand-surface/90 p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]";
const pillSegment =
  "rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition sm:text-[11px]";

export function AdminListsEditor({ seed, persistedBaseline }: { seed: AdminEditorSeed; persistedBaseline: SiteContentFile }) {
  const edit = useSiteContentEditOptional();
  const [tab, setTab] = useState<TabId>("team");
  const [downloadLocale, setDownloadLocale] = useState<"es" | "en">("es");

  const [team, setTeam] = useState<TeamMember[]>(() => seed.team.map((m) => structuredClone(m)));
  const [featuredCatalogIds, setFeaturedCatalogIds] = useState<string[]>(() => [...seed.featuredCatalogIds]);
  const [catalog, setCatalog] = useState<CatalogProperty[]>(() => seed.catalog.map((p) => ({ ...p })));
  const [downloadablesEs, setDownloadablesEs] = useState<DownloadableItem[]>(() => seed.downloadablesEs.map((d) => ({ ...d })));
  const [downloadablesEn, setDownloadablesEn] = useState<DownloadableItem[]>(() => seed.downloadablesEn.map((d) => ({ ...d })));


  const [dragTeamIdx, setDragTeamIdx] = useState<number | null>(null);
  const [dragFeaturedIdx, setDragFeaturedIdx] = useState<number | null>(null);
  const [dragCatalogIdx, setDragCatalogIdx] = useState<number | null>(null);
  const [dragDlIdx, setDragDlIdx] = useState<number | null>(null);

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
    const sig = JSON.stringify({
      team,
      featuredCatalogIds: normalizedFeatured,
      catalogProperties: catalog,
      downloadablesByLocale: { es: downloadablesEs, en: downloadablesEn },
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
        catalogProperties: catalog,
        downloadablesByLocale: { es: downloadablesEs, en: downloadablesEn },
      };
      delete next.featuredByLocale;
      return next;
    });
    baselineSigRef.current = sig;
  }, [edit, team, featuredCatalogIds, catalog, downloadablesEs, downloadablesEn]);

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

  function updateCatalog(idx: number, patch: Partial<CatalogProperty>) {
    setCatalog((prev) => prev.map((p, j) => (j === idx ? { ...p, ...patch } : p)));
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

  return (
    <div className="mt-10 space-y-8">
      {edit?.saveError ? (
        <p className="rounded-sm border border-brand-accent/40 bg-brand-accent/10 px-4 py-3 text-sm text-brand-accent-strong">{edit.saveError}</p>
      ) : null}

      <p className="text-sm text-brand-muted">Los cambios se guardan con la barra inferior del sitio.</p>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={`${tabBtn} ${tab === "team" ? tabActive : tabIdle}`} onClick={() => setTab("team")}>
          Equipo
        </button>
        <button type="button" className={`${tabBtn} ${tab === "featured" ? tabActive : tabIdle}`} onClick={() => setTab("featured")}>
          Destacadas
        </button>
        <button type="button" className={`${tabBtn} ${tab === "catalog" ? tabActive : tabIdle}`} onClick={() => setTab("catalog")}>
          Catálogo
        </button>
        <button type="button" className={`${tabBtn} ${tab === "downloadables" ? tabActive : tabIdle}`} onClick={() => setTab("downloadables")}>
          Descargables
        </button>
      </div>

      {tab === "team" ? (
        <div className="space-y-6">
          <p className="text-sm text-brand-muted">
            Cada fila va cerrada por defecto: abrila para editar. Arrastrá con ⋮⋮ para reordenar.
          </p>
          <ul className="space-y-4">
            {team.map((member, i) => {
              const rowKey = `team:${member.id}`;
              return (
              <li
                key={member.id}
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
                      onClick={() => setTeam((prev) => prev.filter((_, j) => j !== i))}
                    >
                      Quitar
                    </button>
                  }
                >
                <div className="grid gap-4 border-t border-brand-border/60 pt-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    ID (slug interno)
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
                    Encuadre de la foto
                    <select
                      value={member.imageFocus ?? DEFAULT_TEAM_IMAGE_FOCUS}
                      onChange={(e) => updateTeam(i, { imageFocus: e.target.value as TeamImageFocusPreset })}
                      className={`${inputClass} mt-2`}
                    >
                      {TEAM_IMAGE_FOCUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.value === "center" ? "Centro (predeterminado)" : o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={labelClass}>
                    Posición CSS (opcional)
                    <input
                      type="text"
                      value={member.imageObjectPosition ?? ""}
                      onChange={(e) => updateTeam(i, { imageObjectPosition: e.target.value.trim() || undefined })}
                      placeholder="ej. 52% 35%"
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Zoom foto (%)
                    <input
                      type="number"
                      min={100}
                      max={140}
                      step={1}
                      value={member.imageZoom ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (!raw.trim()) {
                          updateTeam(i, { imageZoom: undefined });
                          return;
                        }
                        const n = Number(raw);
                        if (!Number.isFinite(n)) return;
                        updateTeam(i, { imageZoom: clampTeamImageZoom(n) });
                      }}
                      placeholder="100–140"
                      className={inputClass}
                    />
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
                </AdminListDisclosureRow>
              </li>
            );
            })}
          </ul>
          <button
            type="button"
            className="rounded-sm border border-dashed border-brand-border px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-accent hover:bg-brand-accent/10"
            onClick={() => setTeam((prev) => [...prev, emptyTeamMember()])}
          >
            + Agregar persona
          </button>
        </div>
      ) : null}

      {tab === "featured" ? (
        <div className="space-y-8">
          <p className="text-sm text-brand-muted">
            Las tarjetas del inicio salen del <strong className="text-brand-text">catálogo</strong>. Podés expandir cada fila para ver el ID; arrastrá ⋮⋮ para ordenar. Los textos de la sección se editan en el sitio.
          </p>

          <div>
            <h3 className="font-heading text-sm font-semibold text-brand-text">Orden en el inicio</h3>
            <ul className="mt-4 space-y-4">
              {featuredCatalogIds.length === 0 ? (
                <li className="rounded-sm border border-dashed border-brand-border bg-brand-bg px-4 py-6 text-sm text-brand-muted">
                  Ninguna propiedad destacada. Agregá desde el listado inferior.
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
                        Los datos de la tarjeta se editan en la pestaña <strong className="text-brand-text">Catálogo</strong> (misma propiedad).
                      </p>
                    </AdminListDisclosureRow>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold text-brand-text">Agregar desde el catálogo</h3>
            <p className="mt-1 text-xs text-brand-muted">Solo propiedades marcadas como activas y aún no destacadas.</p>
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

      {tab === "catalog" ? (
        <div className="space-y-6">
          <p className="text-sm text-brand-muted">
            Define fichas de <strong className="text-brand-text">/propiedades</strong>. Expandí cada fila para editar; el estado Activo/Inactivo y ⋮⋮ quedan siempre visibles en la cabecera.
          </p>
          <ul className="space-y-4">
            {catalog.map((prop, idx) => {
              const rowKey = `cat:${prop.id}`;
              return (
              <li
                key={`${prop.id}-${idx}`}
                className={`rounded-sm border border-brand-border bg-brand-bg pb-2 shadow-sm transition ${dragCatalogIdx === idx ? "opacity-55" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = Number(e.dataTransfer.getData("text/plain"));
                  setDragCatalogIdx(null);
                  if (Number.isNaN(from)) return;
                  setCatalog((prev) => reorderArray(prev, from, idx));
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
                        setDragCatalogIdx(idx);
                      }}
                      onDragEnd={() => setDragCatalogIdx(null)}
                      className={dragHandleClass}
                    >
                      <span aria-hidden className="text-base leading-none tracking-tight">
                        ⋮⋮
                      </span>
                    </span>
                  }
                  title={
                    <span className="min-w-0">
                      <span className="block truncate font-heading text-sm font-semibold text-brand-text">
                        {prop.title.trim() || `Propiedad ${idx + 1}`}
                      </span>
                      <span className="block truncate text-xs text-brand-muted">{prop.zone}</span>
                    </span>
                  }
                  actions={
                    <>
                      <div className={pillWrap} role="group" aria-label="Estado de publicación">
                        <button
                          type="button"
                          className={`${pillSegment} ${prop.active !== false ? "bg-brand-accent text-brand-white shadow-sm" : "text-brand-muted hover:bg-brand-bg"}`}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            updateCatalog(idx, { active: true });
                          }}
                        >
                          Activo
                        </button>
                        <button
                          type="button"
                          className={`${pillSegment} ${prop.active === false ? "bg-brand-accent-strong text-brand-white shadow-sm" : "text-brand-muted hover:bg-brand-bg"}`}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            updateCatalog(idx, { active: false });
                            setFeaturedCatalogIds((prev) => prev.filter((fid) => fid !== prop.id));
                          }}
                        >
                          Inactivo
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-xs font-bold uppercase tracking-[0.12em] text-brand-accent hover:underline"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          const id = prop.id;
                          setCatalog((prev) => prev.filter((_, j) => j !== idx));
                          setFeaturedCatalogIds((prev) => prev.filter((x) => x !== id));
                        }}
                      >
                        Quitar
                      </button>
                    </>
                  }
                >
                <div className="grid gap-4 border-t border-brand-border/60 pt-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    ID
                    <input type="text" value={prop.id} onChange={(e) => updateCatalog(idx, { id: e.target.value })} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    Slug URL (opcional)
                    <input
                      type="text"
                      value={prop.slug ?? ""}
                      onChange={(e) => updateCatalog(idx, { slug: e.target.value || undefined })}
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Zona
                    <input type="text" value={prop.zone} onChange={(e) => updateCatalog(idx, { zone: e.target.value })} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    Estado (ficha, opcional)
                    <input
                      type="text"
                      value={prop.status ?? ""}
                      onChange={(e) => updateCatalog(idx, { status: e.target.value || undefined })}
                      className={inputClass}
                    />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Título
                    <input type="text" value={prop.title} onChange={(e) => updateCatalog(idx, { title: e.target.value })} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    Precio
                    <input type="text" value={prop.price} onChange={(e) => updateCatalog(idx, { price: e.target.value })} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    Superficie / recámaras (texto)
                    <input type="text" value={prop.specs} onChange={(e) => updateCatalog(idx, { specs: e.target.value })} className={inputClass} />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Dirección (ficha, opcional)
                    <textarea rows={2} value={prop.address ?? ""} onChange={(e) => updateCatalog(idx, { address: e.target.value || undefined })} className={inputClass} />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Descripción ficha (opcional)
                    <textarea rows={5} value={prop.description ?? ""} onChange={(e) => updateCatalog(idx, { description: e.target.value || undefined })} className={inputClass} />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Imagen principal (/public/… o URL)
                    <input
                      type="text"
                      value={prop.imageSrc ?? ""}
                      onChange={(e) => updateCatalog(idx, { imageSrc: e.target.value || undefined })}
                      className={inputClass}
                    />
                    <SiteAssetUploadButton kind="image" subfolder="catalog" onUploaded={(url) => updateCatalog(idx, { imageSrc: url })} />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Galería — una URL por línea
                    <textarea
                      rows={4}
                      value={prop.imageGallery?.join("\n") ?? ""}
                      onChange={(e) => {
                        const lines = e.target.value
                          .split("\n")
                          .map((l) => l.trim())
                          .filter(Boolean);
                        updateCatalog(idx, { imageGallery: lines.length ? lines : undefined });
                      }}
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Colonia / barrio (ficha)
                    <input
                      type="text"
                      value={prop.neighborhood ?? ""}
                      onChange={(e) => updateCatalog(idx, { neighborhood: e.target.value || undefined })}
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Tipo de propiedad
                    <input
                      type="text"
                      value={prop.propertyType ?? ""}
                      onChange={(e) => updateCatalog(idx, { propertyType: e.target.value || undefined })}
                      placeholder="Casa, PH…"
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Recámaras (número)
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={prop.bedrooms ?? ""}
                      onChange={(e) => updateCatalog(idx, { bedrooms: optionalInt(e.target.value) })}
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Baños (permite 5.5)
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={prop.bathrooms ?? ""}
                      onChange={(e) => updateCatalog(idx, { bathrooms: optionalFloat(e.target.value) })}
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    m² construcción
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={prop.areaM2 ?? ""}
                      onChange={(e) => updateCatalog(idx, { areaM2: optionalFloat(e.target.value) })}
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    m² terreno
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={prop.lotAreaM2 ?? ""}
                      onChange={(e) => updateCatalog(idx, { lotAreaM2: optionalFloat(e.target.value) })}
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    m² jardín
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={prop.gardenM2 ?? ""}
                      onChange={(e) => updateCatalog(idx, { gardenM2: optionalFloat(e.target.value) })}
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Cajones estacionamiento
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={prop.parkingSpots ?? ""}
                      onChange={(e) => updateCatalog(idx, { parkingSpots: optionalInt(e.target.value) })}
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Año construcción
                    <input
                      type="number"
                      min={1800}
                      max={2100}
                      step={1}
                      value={prop.yearBuilt ?? ""}
                      onChange={(e) => updateCatalog(idx, { yearBuilt: optionalInt(e.target.value) })}
                      className={inputClass}
                    />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Folleto PDF (URL)
                    <input
                      type="text"
                      value={prop.brochureUrl ?? ""}
                      onChange={(e) => updateCatalog(idx, { brochureUrl: e.target.value || undefined })}
                      className={inputClass}
                    />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Tour URL (opcional)
                    <input type="text" value={prop.tourUrl ?? ""} onChange={(e) => updateCatalog(idx, { tourUrl: e.target.value || undefined })} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    CTA tours (opcional)
                    <input type="text" value={prop.ctaLabel ?? ""} onChange={(e) => updateCatalog(idx, { ctaLabel: e.target.value || undefined })} className={inputClass} />
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
            onClick={() => setCatalog((prev) => [...prev, emptyCatalog()])}
          >
            + Agregar al catálogo
          </button>
        </div>
      ) : null}

      {tab === "downloadables" ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <button type="button" className={`${tabBtn} ${downloadLocale === "es" ? tabActive : tabIdle}`} onClick={() => setDownloadLocale("es")}>
              Español
            </button>
            <button type="button" className={`${tabBtn} ${downloadLocale === "en" ? tabActive : tabIdle}`} onClick={() => setDownloadLocale("en")}>
              English
            </button>
          </div>
          <p className="text-sm text-brand-muted">Expandí cada ítem para editar PDF o miniatura. Arrastrá ⋮⋮ para ordenar.</p>
          <ul className="space-y-4">
            {downloadList.map((item, idx) => {
              const rowKey = `dl:${downloadLocale}:${item.id}`;
              return (
              <li
                key={`${item.id}-${idx}`}
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
                      onClick={() => setDownloadList((prev) => prev.filter((_, j) => j !== idx))}
                    >
                      Quitar
                    </button>
                  }
                >
                <div className="grid gap-4 border-t border-brand-border/60 pt-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    ID (estable)
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
            onClick={() => setDownloadList((prev) => [...prev, emptyDownloadable()])}
          >
            + Agregar descargable
          </button>
        </div>
      ) : null}

    </div>
  );
}
