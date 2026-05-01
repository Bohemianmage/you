"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { saveSiteContent } from "@/app/actions/site-content";
import { SiteAssetUploadButton } from "@/components/admin/SiteAssetUploadButton";
import type { CatalogProperty } from "@/data/catalog-properties";
import type { DownloadableItem } from "@/data/downloadables";
import type { TeamMember } from "@/data/team";
import type { AdminEditorSeed } from "@/lib/site-content/editor-seed";
import type { SiteContentFile } from "@/lib/site-content/types";

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
  "rounded-sm border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition";
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

function mapSaveErr(code: string): string {
  const m: Record<string, string> = {
    invalid_json: "JSON inválido.",
    validation: "Validación incorrecta.",
    write_failed: "No se pudo guardar en archivo.",
    github_unauthorized: "GitHub: token.",
    github_forbidden: "GitHub: permiso.",
    github_not_found: "GitHub: repo/rama.",
    github_conflict: "GitHub: conflicto.",
    github_validation: "GitHub: rechazado.",
    github_rate_limit: "GitHub: límite.",
    github_unknown: "GitHub: error.",
  };
  return m[code] ?? "Error al guardar.";
}

export function AdminListsEditor({ seed, persistedBaseline }: { seed: AdminEditorSeed; persistedBaseline: SiteContentFile }) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("team");
  const [downloadLocale, setDownloadLocale] = useState<"es" | "en">("es");

  const [team, setTeam] = useState<TeamMember[]>(() => seed.team.map((m) => structuredClone(m)));
  const [featuredCatalogIds, setFeaturedCatalogIds] = useState<string[]>(() => [...seed.featuredCatalogIds]);
  const [catalog, setCatalog] = useState<CatalogProperty[]>(() => seed.catalog.map((p) => ({ ...p })));
  const [downloadablesEs, setDownloadablesEs] = useState<DownloadableItem[]>(() => seed.downloadablesEs.map((d) => ({ ...d })));
  const [downloadablesEn, setDownloadablesEn] = useState<DownloadableItem[]>(() => seed.downloadablesEn.map((d) => ({ ...d })));

  const [pending, startTransition] = useTransition();
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const [dragTeamIdx, setDragTeamIdx] = useState<number | null>(null);
  const [dragFeaturedIdx, setDragFeaturedIdx] = useState<number | null>(null);
  const [dragCatalogIdx, setDragCatalogIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!saveModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSaveModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [saveModalOpen]);

  const payloadJson = useMemo(() => {
    const base = structuredClone(persistedBaseline);
    const normalizedFeatured = normalizeFeaturedIds(featuredCatalogIds, catalog);
    const body: SiteContentFile = {
      ...base,
      version: 1,
      team,
      featuredCatalogIds: normalizedFeatured,
      catalogProperties: catalog,
      downloadablesByLocale: { es: downloadablesEs, en: downloadablesEn },
    };
    delete body.featuredByLocale;
    return JSON.stringify(body);
  }, [persistedBaseline, team, featuredCatalogIds, catalog, downloadablesEs, downloadablesEn]);

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

  function updateSocial(i: number, field: keyof NonNullable<TeamMember["social"]>, value: string) {
    setTeam((prev) =>
      prev.map((m, j) => {
        if (j !== i) return m;
        const social = { ...m.social, [field]: value };
        return { ...m, social };
      }),
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
      {saveErr ? (
        <p className="rounded-sm border border-brand-accent/40 bg-brand-accent/10 px-4 py-3 text-sm text-brand-accent-strong">{saveErr}</p>
      ) : null}

      <p className="text-sm text-brand-muted">
        Contacto, textos del pie, aviso del hero y copy de secciones del home se editan en el sitio con la barra inferior (&quot;Modo edición&quot;).
      </p>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={`${tabBtn} ${tab === "team" ? tabActive : tabIdle}`} onClick={() => setTab("team")}>
          Equipo
        </button>
        <button type="button" className={`${tabBtn} ${tab === "featured" ? tabActive : tabIdle}`} onClick={() => setTab("featured")}>
          Destacadas (inicio)
        </button>
        <button type="button" className={`${tabBtn} ${tab === "catalog" ? tabActive : tabIdle}`} onClick={() => setTab("catalog")}>
          Catálogo /propiedades
        </button>
        <button type="button" className={`${tabBtn} ${tab === "downloadables" ? tabActive : tabIdle}`} onClick={() => setTab("downloadables")}>
          Descargables
        </button>
      </div>

      {tab === "team" ? (
        <div className="space-y-6">
          <p className="text-sm text-brand-muted">
            Arrastrá con el asa ⋮⋮ para reordenar. Las redes sociales son opcionales (URLs completas).
          </p>
          <ul className="space-y-8">
            {team.map((member, i) => (
              <li
                key={member.id}
                className={`rounded-sm border border-brand-border bg-brand-bg p-6 shadow-sm transition ${dragTeamIdx === i ? "opacity-55" : ""}`}
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
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-1">
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
                    <span className="font-heading text-sm font-semibold text-brand-text">Persona {i + 1}</span>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-bold uppercase tracking-[0.12em] text-brand-accent hover:underline"
                    onClick={() => setTeam((prev) => prev.filter((_, j) => j !== i))}
                  >
                    Quitar
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
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
                    Facebook URL
                    <input
                      type="text"
                      value={member.social?.facebook ?? ""}
                      onChange={(e) => updateSocial(i, "facebook", e.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Twitter/X URL
                    <input
                      type="text"
                      value={member.social?.twitter ?? ""}
                      onChange={(e) => updateSocial(i, "twitter", e.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    LinkedIn URL
                    <input
                      type="text"
                      value={member.social?.linkedin ?? ""}
                      onChange={(e) => updateSocial(i, "linkedin", e.target.value)}
                      className={inputClass}
                    />
                  </label>
                </div>
              </li>
            ))}
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
            Las tarjetas del inicio usan los datos del <strong className="text-brand-text">catálogo</strong>. Elegí qué propiedades activas mostrar y ordenalas arrastrando ⋮⋮. Los textos de la sección se editan en el sitio.
          </p>

          <div>
            <h3 className="font-heading text-sm font-semibold text-brand-text">Orden en el inicio</h3>
            <ul className="mt-4 space-y-3">
              {featuredCatalogIds.length === 0 ? (
                <li className="rounded-sm border border-dashed border-brand-border bg-brand-bg px-4 py-6 text-sm text-brand-muted">
                  Ninguna propiedad destacada. Agregá desde el listado inferior.
                </li>
              ) : null}
              {featuredCatalogIds.map((id, idx) => {
                const prop = catalogById.get(id);
                return (
                  <li
                    key={`${id}-${idx}`}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-sm border border-brand-border bg-brand-bg px-4 py-3 shadow-sm transition ${dragFeaturedIdx === idx ? "opacity-55" : ""}`}
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
                    <div className="flex min-w-0 flex-1 items-start gap-2">
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
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-brand-text">{prop?.title ?? `(sin catálogo: ${id})`}</p>
                        <p className="text-xs text-brand-muted">{id}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-bold uppercase tracking-[0.12em] text-brand-accent hover:underline"
                      onClick={() => setFeaturedCatalogIds((prev) => prev.filter((x) => x !== id))}
                    >
                      Quitar
                    </button>
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
            Define fichas de <strong className="text-brand-text">/propiedades</strong>. El interruptor <strong className="text-brand-text">Activo</strong> controla si la propiedad se publica y si puede destacarse en el inicio. Reordená con ⋮⋮.
          </p>
          <ul className="space-y-8">
            {catalog.map((prop, idx) => (
              <li
                key={`${prop.id}-${idx}`}
                className={`rounded-sm border border-brand-border bg-brand-bg p-6 shadow-sm transition ${dragCatalogIdx === idx ? "opacity-55" : ""}`}
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
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
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
                    <span className="font-heading text-sm font-semibold text-brand-text">Propiedad {idx + 1}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className={pillWrap} role="group" aria-label="Estado de publicación">
                      <button
                        type="button"
                        className={`${pillSegment} ${prop.active !== false ? "bg-brand-accent text-brand-white shadow-sm" : "text-brand-muted hover:bg-brand-bg"}`}
                        onClick={() => updateCatalog(idx, { active: true })}
                      >
                        Activo
                      </button>
                      <button
                        type="button"
                        className={`${pillSegment} ${prop.active === false ? "bg-brand-accent-strong text-brand-white shadow-sm" : "text-brand-muted hover:bg-brand-bg"}`}
                        onClick={() => {
                          updateCatalog(idx, { active: false });
                          setFeaturedCatalogIds((prev) => prev.filter((id) => id !== prop.id));
                        }}
                      >
                        Inactivo
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-bold uppercase tracking-[0.12em] text-brand-accent hover:underline"
                      onClick={() => {
                        const id = prop.id;
                        setCatalog((prev) => prev.filter((_, j) => j !== idx));
                        setFeaturedCatalogIds((prev) => prev.filter((x) => x !== id));
                      }}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
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
                    Imagen (/public/… o URL)
                    <input
                      type="text"
                      value={prop.imageSrc ?? ""}
                      onChange={(e) => updateCatalog(idx, { imageSrc: e.target.value || undefined })}
                      className={inputClass}
                    />
                    <SiteAssetUploadButton kind="image" subfolder="catalog" onUploaded={(url) => updateCatalog(idx, { imageSrc: url })} />
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
              </li>
            ))}
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
          <p className="text-sm text-brand-muted">
            Los títulos de la sección se editan en el sitio (bloque descargables). <strong className="text-brand-text">Subida:</strong> los archivos van al repositorio Git (misma configuración{" "}
            <code className="text-xs">GITHUB_TOKEN</code> / <code className="text-xs">GITHUB_REPO</code> que el JSON del sitio). Tras subir, hace falta un nuevo deploy para que queden servidos bajo{" "}
            <code className="text-xs">/site-uploads/…</code>.
          </p>
          <ul className="space-y-8">
            {downloadList.map((item, idx) => (
              <li key={`${item.id}-${idx}`} className="rounded-sm border border-brand-border bg-brand-bg p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-heading text-sm font-semibold text-brand-text">Ítem {idx + 1}</span>
                  <button
                    type="button"
                    className="text-xs font-bold uppercase tracking-[0.12em] text-brand-accent hover:underline"
                    onClick={() => setDownloadList((prev) => prev.filter((_, j) => j !== idx))}
                  >
                    Quitar
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
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
              </li>
            ))}
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

      <div className="border-t border-brand-border pt-8">
        <button
          type="button"
          disabled={pending}
          className="rounded-sm bg-brand-accent px-8 py-3 text-sm font-semibold text-brand-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition hover:bg-brand-accent-strong disabled:cursor-not-allowed disabled:opacity-45"
          onClick={() => setSaveModalOpen(true)}
        >
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      {saveModalOpen ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
            aria-label="Cerrar diálogo"
            onClick={() => setSaveModalOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-confirm-title"
            className="relative z-10 w-full max-w-md rounded-sm border border-brand-border bg-brand-bg p-6 shadow-xl ring-1 ring-brand-border/60"
          >
            <h2 id="save-confirm-title" className="font-heading text-lg font-semibold text-brand-text">
              ¿Guardar los cambios?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">
              Se actualizarán equipo, orden del catálogo, propiedades activas/inactivas, destacados del inicio (según catálogo) y descargables. Los textos del home no se modifican desde esta pantalla.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="rounded-sm border border-brand-border bg-brand-bg px-4 py-2 text-sm font-semibold text-brand-text transition hover:border-brand-accent hover:text-brand-accent-strong"
                onClick={() => setSaveModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={pending}
                className="rounded-sm bg-brand-accent px-4 py-2 text-sm font-semibold text-brand-white shadow-sm transition hover:bg-brand-accent-strong disabled:cursor-not-allowed disabled:opacity-45"
                onClick={() => {
                  setSaveModalOpen(false);
                  setSaveErr(null);
                  startTransition(() => {
                    void (async () => {
                      const res = await saveSiteContent(payloadJson);
                      if (!res.ok) {
                        setSaveErr(mapSaveErr(res.error));
                        return;
                      }
                      router.refresh();
                    })();
                  });
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
