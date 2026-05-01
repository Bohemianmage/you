import type { Locale } from "@/i18n/types";

/** Material comercial bajo solicitud (descargables / brochures). */
export interface DownloadableItem {
  id: string;
  title: string;
  description: string;
}

const DOWNLOADABLE_ITEMS_ES: readonly DownloadableItem[] = [
  {
    id: "brochure-corporativo",
    title: "Brochure corporativo YOU",
    description: "Presentación de servicios, zonas de cobertura y proceso de asesoría.",
  },
  {
    id: "guia-plusvalia-cdmx",
    title: "Guía de zonas de plusvalía CDMX",
    description: "Resumen orientativo de corredores premium para inversión y habitabilidad.",
  },
  {
    id: "checklist-compra-renta",
    title: "Checklist compra / renta",
    description: "Lista de verificación para documentación y pasos clave antes de firmar.",
  },
  {
    id: "ficha-oficinas-corporativas",
    title: "Ficha — oficinas corporativas",
    description: "Criterios de búsqueda, zonas corporativas y acompañamiento para equipos.",
  },
] as const;

const DOWNLOADABLE_ITEMS_EN: readonly DownloadableItem[] = [
  {
    id: "brochure-corporativo",
    title: "YOU corporate brochure",
    description: "Services overview, coverage areas, and how we work with you.",
  },
  {
    id: "guia-plusvalia-cdmx",
    title: "CDMX value corridors guide",
    description: "Orientation on premium districts for living and investment.",
  },
  {
    id: "checklist-compra-renta",
    title: "Buy / lease checklist",
    description: "Documentation and key steps before signing.",
  },
  {
    id: "ficha-oficinas-corporativas",
    title: "Corporate offices one-pager",
    description: "Search criteria, districts, and team workspace advisory.",
  },
] as const;

export const DOWNLOADABLE_ITEMS_BY_LOCALE: Record<Locale, readonly DownloadableItem[]> = {
  es: DOWNLOADABLE_ITEMS_ES,
  en: DOWNLOADABLE_ITEMS_EN,
};

/** @deprecated Use DOWNLOADABLE_ITEMS_BY_LOCALE["es"] */
export const DOWNLOADABLE_ITEMS = DOWNLOADABLE_ITEMS_ES;
