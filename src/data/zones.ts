import type { Locale } from "@/i18n/types";

/** Tarjeta de zona en home — `filterZone` alinea con `CatalogProperty.zone` cuando el nombre visible difiere. */
export interface HomeZone {
  label: string;
  filterZone?: string;
}

/** Zonas premium en portada (localizadas en etiqueta; filtro de catálogo vía `filterZone`). */
export const ZONES_BY_LOCALE: Record<Locale, readonly HomeZone[]> = {
  es: [
    { label: "Nuevo Polanco", filterZone: "Polanco" },
    { label: "Polanco" },
    { label: "Santa Fe" },
    { label: "Condesa" },
    { label: "Roma Norte / Cibeles" },
    { label: "Bosques", filterZone: "Santa Fe" },
  ],
  en: [
    { label: "Nuevo Polanco", filterZone: "Polanco" },
    { label: "Polanco" },
    { label: "Santa Fe" },
    { label: "Condesa" },
    { label: "Roma Norte / Cibeles" },
    { label: "Bosques", filterZone: "Santa Fe" },
  ],
};
