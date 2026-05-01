import type { HomeCopy } from "@/i18n/home";

export type SectionFieldMeta = {
  section: keyof HomeCopy;
  key: string;
  label: string;
  multiline?: boolean;
  lines?: boolean;
  /** Campo URL + botón subir imagen al repo Git. */
  assetUpload?: { kind: "image"; subfolder: string };
};

export const SECTION_EDIT_META: Record<string, { title: string; fields: SectionFieldMeta[] }> = {
  "hero-modal": {
    title: "Inicio y modal",
    fields: [
      { section: "hero", key: "announcement", label: "Aviso (chip)", multiline: true },
      { section: "hero", key: "title", label: "Título hero" },
      { section: "hero", key: "subtitle", label: "Subtítulo", multiline: true },
      { section: "hero", key: "primaryCta", label: "Botón principal" },
      { section: "hero", key: "secondaryCta", label: "Botón secundario" },
      { section: "hero", key: "imageBadge", label: "Badge imagen" },
      {
        section: "hero",
        key: "imageSrc",
        label: "Poster del video (opcional, mientras carga)",
        assetUpload: { kind: "image", subfolder: "hero" },
      },
      { section: "modal", key: "title", label: "Modal · título" },
      { section: "modal", key: "message", label: "Modal · mensaje", multiline: true },
      { section: "modal", key: "close", label: "Modal · texto cerrar" },
      { section: "modal", key: "closeA11y", label: "Modal · etiqueta accesible" },
    ],
  },
  about: {
    title: "Nosotros",
    fields: [
      { section: "about", key: "title", label: "Título" },
      { section: "about", key: "tagline", label: "Tagline" },
      { section: "about", key: "intro", label: "Introducción (una línea = un párrafo)", lines: true },
      { section: "about", key: "historyTitle", label: "Título historia" },
      { section: "about", key: "history", label: "Historia (una línea = un párrafo)", lines: true },
      { section: "about", key: "teamTitle", label: "Título equipo" },
      { section: "about", key: "clientsTitle", label: "Título clientes" },
      { section: "about", key: "clientsSubtitle", label: "Subtítulo clientes", multiline: true },
    ],
  },
  zones: {
    title: "Zonas",
    fields: [{ section: "zones", key: "title", label: "Título", multiline: true }],
  },
  featured: {
    title: "Propiedades destacadas (textos)",
    fields: [
      { section: "featured", key: "title", label: "Título" },
      { section: "featured", key: "subtitle", label: "Subtítulo", multiline: true },
      { section: "featured", key: "visitCta", label: "CTA visita" },
      { section: "featured", key: "catalogCta", label: "CTA catálogo" },
      { section: "featured", key: "detailCta", label: "CTA ficha (tarjetas)" },
      { section: "featured", key: "virtualTourCta", label: "CTA tour virtual (si hay URL)" },
    ],
  },
  virtualTours: {
    title: "Tours virtuales",
    fields: [
      { section: "virtualTours", key: "title", label: "Título" },
      { section: "virtualTours", key: "description", label: "Descripción", multiline: true },
      { section: "virtualTours", key: "cta", label: "CTA" },
    ],
  },
  owner: {
    title: "CTA propietarios",
    fields: [
      { section: "owner", key: "title", label: "Título", multiline: true },
      { section: "owner", key: "cta", label: "Texto del botón" },
    ],
  },
  offices: {
    title: "Oficinas",
    fields: [
      { section: "offices", key: "imageLabel", label: "Etiqueta imagen (placeholder)" },
      { section: "offices", key: "imageSrc", label: "Imagen oficinas (/public/… o URL)", assetUpload: { kind: "image", subfolder: "offices" } },
      { section: "offices", key: "title", label: "Título" },
      { section: "offices", key: "description", label: "Descripción", multiline: true },
      { section: "offices", key: "supportText", label: "Texto apoyo", multiline: true },
      { section: "offices", key: "cta", label: "CTA" },
    ],
  },
  downloadables: {
    title: "Descargables",
    fields: [
      { section: "downloadables", key: "title", label: "Título" },
      { section: "downloadables", key: "description", label: "Descripción", multiline: true },
      { section: "downloadables", key: "downloadFileCta", label: "CTA descarga directa" },
      { section: "downloadables", key: "noFileHint", label: "Texto si aún no hay archivo" },
    ],
  },
  footer: {
    title: "Pie de página",
    fields: [
      { section: "footer", key: "tagline", label: "Tagline" },
      { section: "footer", key: "phoneLabel", label: "Etiqueta teléfono (solo texto de etiqueta)" },
      { section: "footer", key: "copyright", label: "Copyright" },
    ],
  },
};
