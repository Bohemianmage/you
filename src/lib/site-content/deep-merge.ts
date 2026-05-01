/** Combina objetos anidados; los arrays del patch reemplazan por completo. */
export function deepMerge<T extends Record<string, unknown>>(base: T, patch: unknown): T {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return base;
  const p = patch as Record<string, unknown>;
  const out = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(p)) {
    const pv = p[key];
    if (pv === undefined) continue;
    const bv = out[key];
    if (Array.isArray(pv)) {
      out[key] = pv;
    } else if (pv !== null && typeof pv === "object" && !Array.isArray(pv) && bv !== null && typeof bv === "object" && !Array.isArray(bv)) {
      out[key] = deepMerge(bv as Record<string, unknown>, pv);
    } else {
      out[key] = pv;
    }
  }
  return out as T;
}
