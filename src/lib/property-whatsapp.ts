import type { Locale } from "@/i18n/types";

/** Dígitos para wa.me a partir de `tel:+5255…`. */
export function whatsAppDigitsFromTelHref(phoneHref: string): string {
  const d = phoneHref.replace(/\D/g, "");
  return d.length >= 10 ? d : "525592217328";
}

export function buildPropertyWhatsAppUrl(opts: {
  phoneHref: string;
  propertyTitle: string;
  propertyAbsoluteUrl: string;
  locale: Locale;
}): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_DIGITS?.replace(/\D/g, "") || whatsAppDigitsFromTelHref(opts.phoneHref);
  const msg =
    opts.locale === "en"
      ? `Hello, I'm interested in this listing:\n${opts.propertyTitle}\n${opts.propertyAbsoluteUrl}`
      : `Hola, me interesa esta propiedad:\n${opts.propertyTitle}\n${opts.propertyAbsoluteUrl}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}
