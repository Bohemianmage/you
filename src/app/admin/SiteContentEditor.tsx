"use client";

import { useMemo, useState, useTransition } from "react";

import { saveSiteContent } from "@/app/actions/site-content";
import type { FeaturedProperty } from "@/data/properties";
import type { TeamMember } from "@/data/team";
import type { AdminEditorSeed } from "@/lib/site-content/editor-seed";
import type { AdminGithubPublishSummary } from "@/lib/site-content/publish-summary";

type TabId = "general" | "team" | "featured";

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

const tabBtn =
  "rounded-sm border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition";
const tabActive = "border-brand-accent bg-brand-accent/15 text-brand-accent-strong";
const tabIdle = "border-brand-border bg-brand-bg text-brand-muted hover:border-brand-accent hover:text-brand-accent";

const labelClass = "block text-xs font-bold uppercase tracking-[0.12em] text-brand-muted";
const inputClass =
  "mt-2 w-full rounded-sm border border-brand-border bg-brand-bg px-3 py-2 text-sm outline-none ring-brand-accent focus:border-brand-accent focus:ring-1";

export function SiteContentEditor({
  seed,
  publishSummary,
}: {
  seed: AdminEditorSeed;
  publishSummary: AdminGithubPublishSummary;
}) {
  const [tab, setTab] = useState<TabId>("general");
  const [featuredLocale, setFeaturedLocale] = useState<"es" | "en">("es");

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

  const [pending, startTransition] = useTransition();

  const payloadJson = useMemo(() => {
    const body = {
      version: 1 as const,
      contact: {
        addressLine: contactAddress,
        phoneDisplay: contactPhoneDisplay,
        phoneHref: contactPhoneHref,
      },
      footerTagline: { es: footerTaglineEs, en: footerTaglineEn },
      heroAnnouncement: { es: heroAnnouncementEs, en: heroAnnouncementEn },
      team,
      featuredByLocale: { es: featuredEs, en: featuredEn },
    };
    return JSON.stringify(body);
  }, [
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

  return (
    <div className="mt-10 space-y-8">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`${tabBtn} ${tab === "general" ? tabActive : tabIdle}`} onClick={() => setTab("general")}>
          General
        </button>
        <button type="button" className={`${tabBtn} ${tab === "team" ? tabActive : tabIdle}`} onClick={() => setTab("team")}>
          Equipo
        </button>
        <button type="button" className={`${tabBtn} ${tab === "featured" ? tabActive : tabIdle}`} onClick={() => setTab("featured")}>
          Propiedades destacadas
        </button>
      </div>

      {tab === "general" ? (
        <div className="space-y-12">
          <fieldset className="space-y-4 rounded-sm border border-brand-border bg-brand-bg p-6 shadow-sm">
            <legend className="px-1 font-heading text-lg font-semibold text-brand-text">Contacto (pie, Nosotros)</legend>
            <label className={labelClass}>
              Dirección
              <textarea
                rows={3}
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                className={inputClass}
              />
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
            <legend className="px-1 font-heading text-lg font-semibold text-brand-text">Frase del pie (tagline)</legend>
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
            <legend className="px-1 font-heading text-lg font-semibold text-brand-text">Barra superior del inicio (hero)</legend>
            <p className="text-xs text-brand-muted">Texto del chip de aviso que enlaza al catálogo.</p>
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
                    Tour URL (opcional)
                    <input
                      type="text"
                      value={prop.tourUrl ?? ""}
                      onChange={(e) => updateFeatured(idx, { tourUrl: e.target.value || undefined })}
                      className={inputClass}
                    />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Imagen /public (opcional)
                    <input
                      type="text"
                      value={prop.imageSrc ?? ""}
                      onChange={(e) => updateFeatured(idx, { imageSrc: e.target.value || undefined })}
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
            onClick={() => setFeaturedList((prev) => [...prev, emptyFeatured()])}
          >
            + Agregar propiedad
          </button>
        </div>
      ) : null}

      <div className="border-t border-brand-border pt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={pending}
            className="rounded-sm bg-brand-accent px-8 py-3 text-sm font-semibold text-brand-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition hover:bg-brand-accent-strong disabled:cursor-not-allowed disabled:opacity-45"
            onClick={() => {
              const message = publishSummary.enabled
                ? `¿Publicar cambios en GitHub?\n\nSe creará un commit en ${publishSummary.repo ?? "el repositorio"} (rama «${publishSummary.branch}», archivo ${publishSummary.contentPath}). Esto puede disparar un deploy si el repo está conectado a Vercel u otro servicio.`
                : `¿Guardar en archivo local?\n\nSe escribirá ${publishSummary.contentPath} en este entorno (no crea commit en GitHub).`;
              if (!window.confirm(message)) return;
              startTransition(() => void saveSiteContent(payloadJson));
            }}
          >
            {pending
              ? publishSummary.enabled
                ? "Publicando…"
                : "Guardando…"
              : publishSummary.enabled
                ? "Publicar cambios"
                : "Guardar en archivo"}
          </button>
          <p className="max-w-md text-xs leading-relaxed text-brand-muted">
            {publishSummary.enabled ? (
              <>
                Se creará un commit en{" "}
                <span className="font-mono text-[0.7rem] text-brand-text">{publishSummary.repo}</span> ({publishSummary.branch} →{" "}
                {publishSummary.contentPath}).
              </>
            ) : (
              <>Sin GitHub, escribe en disco; en producción serverless usá las variables del panel «Publicación».</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
