import type { Locale } from "@/i18n/types";

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
  social?: TeamMemberSocial;
}

/**
 * Roster from legacy Wix “Nuestro equipo” (about-1). Social URLs can be filled when confirmed.
 */
export const TEAM_MEMBERS: readonly TeamMember[] = [
  {
    id: "eugenia-alonso",
    name: "Eugenia Alonso",
    role: { es: "Co-Founder / COO", en: "Co-Founder / COO" },
  },
  {
    id: "emiliano-berumen",
    name: "Emiliano Berumen",
    role: { es: "Co-Founder", en: "Co-Founder" },
  },
  {
    id: "blanca-cepeda",
    name: "Blanca Cepeda",
    role: { es: "Broker especializado", en: "Specialized broker" },
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
