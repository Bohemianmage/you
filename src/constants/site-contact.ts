/** Canonical office contact — footer, Nosotros (merged with admin overrides when configured). */
export type SiteContact = {
  readonly addressLine: string;
  readonly phoneDisplay: string;
  readonly phoneHref: string;
  readonly emailDisplay: string;
  readonly emailHref: string;
};

export const SITE_CONTACT: SiteContact = {
  addressLine: "Roberto Gayol 82-4 Int. 2, Cd. Satélite, 53100 Naucalpan de Juárez, Méx.",
  phoneDisplay: "55-92-21-73-28",
  phoneHref: "tel:+525592217328",
  emailDisplay: "contacto@yousoluciones.com",
  emailHref: "mailto:contacto@yousoluciones.com",
};
