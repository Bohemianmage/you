/** URL base pública para enlaces absolutos (WhatsApp, compartir). */
export function publicSiteBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (raw) return raw;
  return "https://yousoluciones.com";
}
