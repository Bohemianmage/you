import type { Locale } from "@/i18n/types";

/** Shared navigation item for header/footer anchors. */
export interface NavItem {
  href: string;
  label: string;
}

/** UI copy dictionary for the full home experience. */
export interface HomeCopy {
  localeName: string;
  nav: readonly NavItem[];
  languageLabel: string;
  hero: {
    announcement: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    imageBadge: string;
  };
  modal: {
    title: string;
    message: string;
    close: string;
    closeA11y: string;
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
  };
  footer: {
    tagline: string;
    phoneLabel: string;
    copyright: string;
  };
}

/** Bilingual homepage dictionaries keyed by locale. */
export const HOME_COPY: Record<Locale, HomeCopy> = {
  es: {
    localeName: "Español",
    languageLabel: "Idioma",
    nav: [
      { href: "#about", label: "Nosotros" },
      { href: "#featured-properties", label: "Propiedades" },
      { href: "#downloadables", label: "Descargables" },
      { href: "#contact", label: "Contacto" },
    ],
    hero: {
      announcement:
        "Looking for accommodation or your next real estate investment in México? Click here",
      title: "Encuentra el lugar perfecto para ti",
      subtitle: "Servicio profesional inmobiliario con sentido humano",
      primaryCta: "Ver propiedades",
      secondaryCta: "Contactar asesor",
      imageBadge: "Venta y renta · CDMX",
    },
    modal: {
      title: "Sitio en desarrollo",
      message:
        "Estamos migrando YOU Soluciones Inmobiliarias a una nueva experiencia. Algunas secciones pueden cambiar; gracias por tu paciencia.",
      close: "Entendido",
      closeA11y: "Cerrar aviso",
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
      cta: "Solicitar por contacto",
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
    nav: [
      { href: "#about", label: "About" },
      { href: "#featured-properties", label: "Properties" },
      { href: "#downloadables", label: "Downloads" },
      { href: "#contact", label: "Contact" },
    ],
    hero: {
      announcement:
        "Looking for accommodation or your next real estate investment in México? Click here",
      title: "Find the perfect spot for YOU",
      subtitle: "Professional real estate service with a human approach",
      primaryCta: "View properties",
      secondaryCta: "Contact an advisor",
      imageBadge: "Sales and rentals · Mexico City",
    },
    modal: {
      title: "Site in progress",
      message:
        "We are migrating YOU Soluciones Inmobiliarias to a new experience. Some sections may change; thank you for your patience.",
      close: "Understood",
      closeA11y: "Close notice",
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
      cta: "Request via contact",
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
