"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { saveSiteContent } from "@/app/actions/site-content";
import { SiteAssetUploadButton } from "@/components/admin/SiteAssetUploadButton";
import type { CatalogProperty } from "@/data/catalog-properties";
import type { DownloadableItem } from "@/data/downloadables";
import type { FeaturedProperty } from "@/data/properties";
import type { TeamMember } from "@/data/team";
import type { AdminEditorSeed } from "@/lib/site-content/editor-seed";
import type { SiteContentFile } from "@/lib/site-content/types";

type TabId = "general" | "team" | "featured" | "catalog" | "downloadables";

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

function emptyFeatured(): FeaturedProperty {
  return {
    id: newPropertyId(),
    title: "",
    price: "",
    address: "",
    status: "",
    ctaLabel: "",
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

const tabBtn =
  "rounded-sm border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition";
const tabActive = "border-brand-accent bg-brand-accent/15 text-brand-accent-strong";
const tabIdle = "border-brand-border bg-brand-bg text-brand-muted hover:border-brand-accent hover:text-brand-accent";

const labelClass = "block text-xs font-bold uppercase tracking-[0.12em] text-brand-muted";
const inputClass =
  "mt-2 w-full rounded-sm border border-brand-border bg-brand-bg px-3 py-2 text-sm outline-none ring-brand-accent focus:border-brand-accent focus:ring-1";

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
  const [tab, setTab] = useState<TabId>("general");
  const [featuredLocale, setFeaturedLocale] = useState<"es" | "en">("es");
  const [downloadLocale, setDownloadLocale] = useState<"es" | "en">("es");

  const [contactAddress, setContactAddress] = useState(seed.contact.addressLine);
  const [contactPhoneDisplay, setContactPhoneDisplay] = useState(seed.contact.phoneDisplay);
  const [contactPhoneHref, setContactPhoneHref] = useState(seed.contact.phoneHref);
  const [footerTaglineEs, setFooterTaglineEs] = useState(seed.footerTaglineEs);
  const [footerTaglineEn, setFooterTaglineEn] = useState(seed.footerTaglineEn);
  const [heroAnnouncementEs, setHeroAnnouncementEs] = useState(seed.heroAnnouncementEs);
  const [heroAnnouncementEn, setHeroAnnouncementEn] = useState(seed.heroAnnouncementEn);

  const [team, setTeam] = useState<TeamMember[]>(() => seed.team.map((m) => structuredClone(m)));
  const [featuredEs, setFeaturedEs] = useState<FeaturedProperty[]>(() => seed.featuredEs.map((p) => ({ ...p })));
  const [featuredEn, setFeaturedEn] = useState<FeaturedProperty[]>(() => seed.featuredEn.map((p) => ({ ...p })));
  const [catalog, setCatalog] = useState<CatalogProperty[]>(() => seed.catalog.map((p) => ({ ...p })));
  const [downloadablesEs, setDownloadablesEs] = useState<DownloadableItem[]>(() => seed.downloadablesEs.map((d) => ({ ...d })));
  const [downloadablesEn, setDownloadablesEn] = useState<DownloadableItem[]>(() => seed.downloadablesEn.map((d) => ({ ...d })));

  const [pending, startTransition] = useTransition();
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

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
    const body: SiteContentFile = {
      ...base,
      version: 1,
      contact: {
        ...base.contact,
        addressLine: contactAddress,
        phoneDisplay: contactPhoneDisplay,
        phoneHref: contactPhoneHref,
      },
      footerTagline: {
        ...base.footerTagline,
        es: footerTaglineEs,
        en: footerTaglineEn,
      },
      heroAnnouncement: {
        ...base.heroAnnouncement,
        es: heroAnnouncementEs,
        en: heroAnnouncementEn,
      },
      team,
      featuredByLocale: { es: featuredEs, en: featuredEn },
      catalogProperties: catalog,
      downloadablesByLocale: { es: downloadablesEs, en: downloadablesEn },
    };
    return JSON.stringify(body);
  }, [
    persistedBaseline,
    contactAddress,
    contactPhoneDisplay,
    contactPhoneHref,
    footerTaglineEs,
    footerTaglineEn,
    heroAnnouncementEs,
    heroAnnouncementEn,
    team,
    featuredEs,
    featuredEn,
    catalog,
    downloadablesEs,
    downloadablesEn,
  ]);

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

  const featuredList = featuredLocale === "es" ? featuredEs : featuredEn;
  const setFeaturedList = featuredLocale === "es" ? setFeaturedEs : setFeaturedEn;

  function updateFeatured(idx: number, patch: Partial<FeaturedProperty>) {
    setFeaturedList((prev) => prev.map((p, j) => (j === idx ? { ...p, ...patch } : p)));
  }

  function updateCatalog(idx: number, patch: Partial<CatalogProperty>) {
    setCatalog((prev) => prev.map((p, j) => (j === idx ? { ...p, ...patch } : p)));
  }

  const downloadList = downloadLocale === "es" ? downloadablesEs : downloadablesEn;
  const setDownloadList = downloadLocale === "es" ? setDownloadablesEs : setDownloadablesEn;

  function updateDownloadable(idx: number, patch: Partial<DownloadableItem>) {
    setDownloadList((prev) => prev.map((d, j) => (j === idx ? { ...d, ...patch } : d)));
  }

  return (
    <div className="mt-10 space-y-8">
      {saveErr ? (
        <p className="rounded-sm border border-brand-accent/40 bg-brand-accent/10 px-4 py-3 text-sm text-brand-accent-strong">{saveErr}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" className={`${tabBtn} ${tab === "general" ? tabActive : tabIdle}`} onClick={() => setTab("general")}>
          General
        </button>
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

      {tab === "general" ? (
        <div className="space-y-12">
          <fieldset className="space-y-4 rounded-sm border border-brand-border bg-brand-bg p-6 shadow-sm">
            <legend className="px-1 font-heading text-lg font-semibold text-brand-text">Contacto (pie, Nosotros)</legend>
            <label className={labelClass}>
              Dirección
              <textarea rows={3} value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>
              Teléfono (texto mostrado)
              <input type="text" value={contactPhoneDisplay} onChange={(e) => setContactPhoneDisplay(e.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>
              Enlace tel: (ej. tel:+525592217328)
              <input type="text" value={contactPhoneHref} onChange={(e) => setContactPhoneHref(e.target.value)} className={inputClass} />
            </label>
          </fieldset>

          <fieldset className="space-y-4 rounded-sm border border-brand-border bg-brand-bg p-6 shadow-sm">
            <legend className="px-1 font-heading text-lg font-semibold text-brand-text">Frase del pie (tagline) por idioma</legend>
            <label className={labelClass}>
              Español
              <textarea rows={2} value={footerTaglineEs} onChange={(e) => setFooterTaglineEs(e.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>
              English
              <textarea rows={2} value={footerTaglineEn} onChange={(e) => setFooterTaglineEn(e.target.value)} className={inputClass} />
            </label>
          </fieldset>

          <fieldset className="space-y-4 rounded-sm border border-brand-border bg-brand-bg p-6 shadow-sm">
            <legend className="px-1 font-heading text-lg font-semibold text-brand-text">Aviso del hero (chip) por idioma</legend>
            <label className={labelClass}>
              Español
              <textarea rows={2} value={heroAnnouncementEs} onChange={(e) => setHeroAnnouncementEs(e.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>
              English
              <textarea rows={2} value={heroAnnouncementEn} onChange={(e) => setHeroAnnouncementEn(e.target.value)} className={inputClass} />
            </label>
          </fieldset>
        </div>
      ) : null}

      {tab === "team" ? (
        <div className="space-y-6">
          <p className="text-sm text-brand-muted">
            Editá el orden con eliminar y volver a agregar. Las redes sociales son opcionales (URLs completas).
          </p>
          <ul className="space-y-8">
            {team.map((member, i) => (
              <li key={member.id} className="rounded-sm border border-brand-border bg-brand-bg p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-heading text-sm font-semibold text-brand-text">Persona {i + 1}</span>
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
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`${tabBtn} ${featuredLocale === "es" ? tabActive : tabIdle}`}
              onClick={() => setFeaturedLocale("es")}
            >
              Español
            </button>
            <button
              type="button"
              className={`${tabBtn} ${featuredLocale === "en" ? tabActive : tabIdle}`}
              onClick={() => setFeaturedLocale("en")}
            >
              English
            </button>
          </div>
          <p className="text-sm text-brand-muted">
            Cada idioma tiene su propia lista; los IDs pueden coincidir entre ES y EN para la misma propiedad.
          </p>
          <ul className="space-y-8">
            {featuredList.map((prop, idx) => (
              <li key={`${prop.id}-${idx}`} className="rounded-sm border border-brand-border bg-brand-bg p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-heading text-sm font-semibold text-brand-text">Tarjeta {idx + 1}</span>
                  <button
                    type="button"
                    className="text-xs font-bold uppercase tracking-[0.12em] text-brand-accent hover:underline"
                    onClick={() => setFeaturedList((prev) => prev.filter((_, j) => j !== idx))}
                  >
                    Quitar
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    ID
                    <input type="text" value={prop.id} onChange={(e) => updateFeatured(idx, { id: e.target.value })} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    Slug URL (opcional)
                    <input
                      type="text"
                      value={prop.slug ?? ""}
                      onChange={(e) => updateFeatured(idx, { slug: e.target.value || undefined })}
                      placeholder="ej. renta-residencia-en-zona"
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Estado (ej. En venta)
                    <input type="text" value={prop.status} onChange={(e) => updateFeatured(idx, { status: e.target.value })} className={inputClass} />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Título
                    <input type="text" value={prop.title} onChange={(e) => updateFeatured(idx, { title: e.target.value })} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    Precio
                    <input type="text" value={prop.price} onChange={(e) => updateFeatured(idx, { price: e.target.value })} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    CTA (texto del botón)
                    <input
                      type="text"
                      value={prop.ctaLabel}
                      onChange={(e) => updateFeatured(idx, { ctaLabel: e.target.value })}
                      className={inputClass}
                    />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Dirección
                    <textarea rows={2} value={prop.address} onChange={(e) => updateFeatured(idx, { address: e.target.value })} className={inputClass} />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Descripción (ficha detalle)
                    <textarea
                      rows={6}
                      value={prop.description ?? ""}
                      onChange={(e) => updateFeatured(idx, { description: e.target.value || undefined })}
                      placeholder="Párrafos separados por línea en blanco."
                      className={inputClass}
                    />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Tour URL (opcional)
                    <input
                      type="text"
                      value={prop.tourUrl ?? ""}
                      onChange={(e) => updateFeatured(idx, { tourUrl: e.target.value || undefined })}
                      className={inputClass}
                    />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Imagen /public o URL (opcional)
                    <input
                      type="text"
                      value={prop.imageSrc ?? ""}
                      onChange={(e) => updateFeatured(idx, { imageSrc: e.target.value || undefined })}
                      className={inputClass}
                    />
                    <SiteAssetUploadButton kind="image" subfolder="featured" onUploaded={(url) => updateFeatured(idx, { imageSrc: url })} />
                  </label>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="rounded-sm border border-dashed border-brand-border px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-accent hover:bg-brand-accent/10"
            onClick={() => setFeaturedList((prev) => [...prev, emptyFeatured()])}
          >
            + Agregar propiedad
          </button>
        </div>
      ) : null}

      {tab === "catalog" ? (
        <div className="space-y-6">
          <p className="text-sm text-brand-muted">
            Listado de <strong className="text-brand-text">/propiedades</strong> y fichas <strong className="text-brand-text">/propiedades/[slug]</strong>.
            Slug vacío usa el ID. Podés sumar dirección, descripción e imagen para la ficha.
          </p>
          <ul className="space-y-8">
            {catalog.map((prop, idx) => (
              <li key={`${prop.id}-${idx}`} className="rounded-sm border border-brand-border bg-brand-bg p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-heading text-sm font-semibold text-brand-text">Propiedad {idx + 1}</span>
                  <button
                    type="button"
                    className="text-xs font-bold uppercase tracking-[0.12em] text-brand-accent hover:underline"
                    onClick={() => setCatalog((prev) => prev.filter((_, j) => j !== idx))}
                  >
                    Quitar
                  </button>
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
                    <input type="text" value={prop.status ?? ""} onChange={(e) => updateCatalog(idx, { status: e.target.value || undefined })} className={inputClass} />
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
            <strong className="text-brand-text">Subida:</strong> los archivos van al repositorio Git (misma configuración{" "}
            <code className="text-xs">GITHUB_TOKEN</code> / <code className="text-xs">GITHUB_REPO</code> que el JSON del sitio). Tras subir,
            hace falta un nuevo deploy para que queden servidos bajo <code className="text-xs">/site-uploads/…</code>. También podés pegar una
            ruta estática existente.
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
              Se actualizarán contacto, equipo, destacadas, catálogo, descargables y avisos del hero.
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
