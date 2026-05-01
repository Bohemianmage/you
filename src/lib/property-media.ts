/** Primera imagen de galería o imagen principal para listados / cover. */
export function propertyCoverImage(p: {
  imageSrc?: string;
  imageGallery?: readonly string[];
}): string | undefined {
  const g = p.imageGallery?.filter((u) => typeof u === "string" && u.trim().length > 0);
  if (g && g.length > 0) return g[0];
  return p.imageSrc?.trim() || undefined;
}

/** Lista no vacía para carrusel; si solo hay `imageSrc`, devuelve un ítem. */
export function propertyGalleryImages(p: {
  imageSrc?: string;
  imageGallery?: readonly string[];
}): string[] {
  const g = p.imageGallery?.filter((u) => typeof u === "string" && u.trim().length > 0).map((u) => u.trim());
  if (g && g.length > 0) return [...g];
  if (p.imageSrc?.trim()) return [p.imageSrc.trim()];
  return [];
}
