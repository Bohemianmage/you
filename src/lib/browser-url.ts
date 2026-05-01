/**
 * Utilidades para fragmentos dañinos — p. ej. `#secA#secB` cuando solo debe quedar `#secA`.
 */

export function firstHashFragment(hashWithMaybeMultiple: string): string {
  const raw = hashWithMaybeMultiple.startsWith("#")
    ? hashWithMaybeMultiple.slice(1)
    : hashWithMaybeMultiple;
  return raw.split("#")[0]?.trim() ?? "";
}

/**
 * Si el hash acumuló varios segmentos, reemplaza la entrada del historial por una URL limpia.
 * @returns si se aplicó corrección
 */
export function replaceStateIfHashAccumulated(): boolean {
  if (typeof window === "undefined") return false;
  const path = `${window.location.pathname}${window.location.search}`;
  const h = window.location.hash;
  if (!h || !h.slice(1).includes("#")) return false;
  const frag = firstHashFragment(h);
  const next = `${path}${frag ? `#${frag}` : ""}`;
  const current = `${path}${h}`;
  if (next === current) return false;
  window.history.replaceState(window.history.state, "", next);
  return true;
}

/** Normaliza `href` de navegación (pathname + search + un solo `#fragmento`). */
export function canonicalHrefFromNavString(href: string, baseOrigin = "https://yousoluciones.com"): string {
  const dest = new URL(href, baseOrigin);
  const frag = firstHashFragment(dest.hash);
  return `${dest.pathname}${dest.search}${frag ? `#${frag}` : ""}`;
}
