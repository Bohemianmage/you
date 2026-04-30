/** Append query pairs to a path that may already include `?lang=en`. */
export function appendContactParams(pathWithQuery: string, params: Record<string, string>): string {
  const [path, search = ""] = pathWithQuery.split("?");
  const sp = new URLSearchParams(search);
  for (const [k, v] of Object.entries(params)) {
    sp.set(k, v);
  }
  const q = sp.toString();
  return q ? `${path}?${q}` : path;
}

const CONTACT_TOPICS = new Set(["general", "visita", "vender-rentar", "oficinas", "descargables"]);

/** Maps public URL topic aliases to internal `<select>` values. */
export function normalizeContactTopic(topic?: string): string | undefined {
  if (!topic) return undefined;
  if (topic === "downloadables") return "descargables";
  return CONTACT_TOPICS.has(topic) ? topic : undefined;
}
