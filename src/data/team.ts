import type { Locale } from "@/i18n/types";
import type { TeamImageFocusPreset } from "@/lib/team-image-framing";

export type { TeamImageFocusPreset } from "@/lib/team-image-framing";

export interface TeamMemberSocial {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: Record<Locale, string>;
  /** Add under `/public/team/…` when assets are available (see migration). */
  imageSrc?: string;
  /** Encuadre con `object-cover` en la ficha (admin Listas → Equipo). */
  imageFocus?: TeamImageFocusPreset;
  /** Sobrescribe el preset; CSS `object-position`, ej. `52% 38%`. */
  imageObjectPosition?: string;
  /** Zoom 100–140 % sobre el área recortada (misma ficha para todos). */
  imageZoom?: number;
  email?: string;
  phoneDisplay?: string;
  phoneHref?: string;
  /** Legacy; preferir email y teléfono en tarjetas con volteo. */
  social?: TeamMemberSocial;
}

/**
 * Equipo inicial; correo y teléfono opcionales por persona en admin / JSON.
 */
export const TEAM_MEMBERS: readonly TeamMember[] = [
  {
    id: "eugenia-alonso",
    name: "Eugenia Alonso",
    role: { es: "Co-Founder / COO", en: "Co-Founder / COO" },
    imageSrc: "/team/eugenia-alonso.jpg",
  },
  {
    id: "emiliano-berumen",
    name: "Emiliano Berumen",
    role: { es: "Co-Founder", en: "Co-Founder" },
    imageSrc: "/team/emiliano-berumen.png",
  },
  {
    id: "blanca-cepeda",
    name: "Blanca Cepeda",
    role: { es: "Broker especializado", en: "Specialized broker" },
    imageSrc: "/team/blanca-cepeda.png",
  },
  {
    id: "mariana-novales",
    name: "Mariana Novales",
    role: { es: "Office Manager", en: "Office Manager" },
  },
  {
    id: "yael-attia",
    name: "Yael Attia",
    role: { es: "Broker especializado", en: "Specialized broker" },
  },
  {
    id: "jean-claude-martell",
    name: "Jean Claude Martell",
    role: { es: "Broker especializado", en: "Specialized broker" },
    imageSrc: "/team/jean-claude-martell.png",
  },
  {
    id: "alejandra-rodriguez",
    name: "Alejandra Rodríguez",
    role: { es: "Broker especializado", en: "Specialized broker" },
  },
  {
    id: "carlos-quiroz-olmos",
    name: "Carlos Quiroz Olmos",
    role: { es: "Broker especializado", en: "Specialized broker" },
  },
] as const;
