import type { Locale } from "@/i18n/types";

/** Shared navigation item for header/footer anchors. */
export interface NavItem {
  href: string;
  label: string;
}

/** UI copy dictionary for the full home experience. */
export interface HomeCopy {
  localeName: string;
  languageLabel: string;
  hero: {
    announcement: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    imageBadge: string;
  };
  about: {
    title: string;
    description: string;
  };
  zones: {
    title: string;
  };
  featured: {
    title: string;
    subtitle: string;
    visitCta: string;
    catalogCta: string;
  };
  virtualTours: {
    title: string;
    description: string;
    cta: string;
  };
  owner: {
    title: string;
    cta: string;
  };
  offices: {
    imageLabel: string;
    title: string;
    description: string;
    supportText: string;
    cta: string;
  };
  downloadables: {
    title: string;
    description: string;
    cta: string;
    requestItemCta: string;
  };
  footer: {
    tagline: string;
    phoneLabel: string;
    copyright: string;
  };
}

/** Bilingual homepage dictionaries keyed by locale. */
/** Marketing navigation — hashes resolved against localized home (`/` vs `/?lang=en`). */
export function localeQuery(locale: Locale): "" | "?lang=en" {
  return locale === "en" ? "?lang=en" : "";
}

/** Root URL including locale query when English is selected. */
export function homePath(locale: Locale): string {
  return locale === "en" ? "/?lang=en" : "/";
}

export function marketingNav(locale: Locale): NavItem[] {
  const q = localeQuery(locale);
  const home = homePath(locale);
  const labels =
    locale === "es"
      ? (["Nosotros", "Propiedades", "Descargables", "Contacto"] as const)
      : (["About", "Properties", "Downloads", "Contact"] as const);

  return [
    { href: `${home}#about`, label: labels[0] },
    { href: `/propiedades${q}`, label: labels[1] },
    { href: `${home}#downloadables`, label: labels[2] },
    { href: `/contacto${q}`, label: labels[3] },
  ];
}

export const HOME_COPY: Record<Locale, HomeCopy> = {
  es: {
    localeName: "Español",
    languageLabel: "Idioma",
    hero: {
      announcement:
        "Looking for accommodation or your next real estate investment in México? Click here",
      title: "Encuentra el lugar perfecto para ti",
      subtitle: "Servicio profesional inmobiliario con sentido humano",
      primaryCta: "Ver propiedades",
      secondaryCta: "Contactar asesor",
      imageBadge: "Venta y renta · CDMX",
    },
    about: {
      title: "Nosotros",
      description:
        "En YOU Soluciones Inmobiliarias combinamos criterio de mercado, acompañamiento cercano y procesos claros para ayudarte a rentar, comprar o invertir con confianza en Ciudad de México y zonas corporativas clave.",
    },
    zones: {
      title:
        "Encuentra el inmueble que estás buscando en las zonas de mayor plusvalía de la ciudad.",
    },
    featured: {
      title: "Propiedades destacadas",
      subtitle: "Selección actual del portafolio YOU.",
      visitCta: "Agenda una visita",
      catalogCta: "Catálogo completo",
    },
    virtualTours: {
      title: "Descubre nuestras experiencias 3D",
      description:
        "Recorridos virtuales para conocer propiedades con mayor detalle antes de visitarlas.",
      cta: "Ver tours virtuales",
    },
    owner: {
      title: "¿Quieres vender o rentar tu propiedad?",
      cta: "Da clic aquí",
    },
    offices: {
      imageLabel: "Ilustración / foto oficinas",
      title: "¿Estás buscando OFICINA?",
      description:
        "Te ayudamos a encontrar el lugar perfecto para ti y tus colaboradores.",
      supportText:
        "Tenemos presencia en las zonas corporativas más solicitadas de la ciudad.",
      cta: "Busquemos tu nueva oficina",
    },
    downloadables: {
      title: "Descargables",
      description:
        "Solicita brochures, fichas técnicas y material comercial. Te lo enviamos personalizado según tu zona y tipo de operación.",
      cta: "Ir al contacto",
      requestItemCta: "Solicitar",
    },
    footer: {
      tagline: "Comienza a escribir una nueva historia con nosotros.",
      phoneLabel: "Tel.",
      copyright: "Todos los derechos reservados.",
    },
  },
  en: {
    localeName: "English",
    languageLabel: "Language",
    hero: {
      announcement:
        "Looking for accommodation or your next real estate investment in México? Click here",
      title: "Find the perfect spot for YOU",
      subtitle: "Professional real estate service with a human approach",
      primaryCta: "View properties",
      secondaryCta: "Contact an advisor",
      imageBadge: "Sales and rentals · Mexico City",
    },
    about: {
      title: "About",
      description:
        "At YOU Soluciones Inmobiliarias we combine market insight, close guidance, and clear processes to help you lease, buy, or invest with confidence in Mexico City and key corporate districts.",
    },
    zones: {
      title:
        "Find the property you are looking for in the highest-value areas of the city.",
    },
    featured: {
      title: "Featured properties",
      subtitle: "Current selection from the YOU portfolio.",
      visitCta: "Schedule a visit",
      catalogCta: "Full catalog",
    },
    virtualTours: {
      title: "Discover our 3D experiences",
      description:
        "Virtual walkthroughs to explore properties in greater detail before your visit.",
      cta: "View virtual tours",
    },
    owner: {
      title: "Do you want to sell or rent your property?",
      cta: "Click here",
    },
    offices: {
      imageLabel: "Office photo placeholder",
      title: "Looking for an OFFICE?",
      description: "We help you find the perfect place for you and your team.",
      supportText:
        "We have presence in the city's most requested corporate areas.",
      cta: "Let's find your next office",
    },
    downloadables: {
      title: "Downloadables",
      description:
        "Request brochures, data sheets, and commercial assets tailored to your zone and operation type.",
      cta: "Go to contact",
      requestItemCta: "Request",
    },
    footer: {
      tagline: "Start writing a new story with us.",
      phoneLabel: "Phone",
      copyright: "All rights reserved.",
    },
  },
};

/** Resolves unknown language values to the default locale. */
export function resolveLocale(lang?: string): Locale {
  return lang === "en" ? "en" : "es";
}
