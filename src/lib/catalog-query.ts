import type { Locale } from "@/i18n/types";

export type ListingTypeFilter = "" | "rent" | "sale";

/** URL de listado con locale y filtros opcionales (`zone`, `tipo`). */
export function catalogPageHref(
  locale: Locale,
  filters: { zone?: string; tipo?: ListingTypeFilter },
): string {
  const params = new URLSearchParams();
  if (locale === "en") params.set("lang", "en");
  const z = filters.zone?.trim();
  if (z) params.set("zone", z);
  if (filters.tipo === "rent" || filters.tipo === "sale") params.set("tipo", filters.tipo);
  const q = params.toString();
  return `/propiedades${q ? `?${q}` : ""}`;
}
