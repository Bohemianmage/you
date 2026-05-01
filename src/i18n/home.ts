import type { Locale } from "@/i18n/types";

/** Shared navigation item for header/footer anchors. */
export interface NavItem {
  href: string;
  label: string;
}

/** UI copy dictionary for the full home experience. */
export interface HomeCopy {
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
    tagline: string;
    intro: readonly string[];
    historyTitle: string;
    history: readonly string[];
    teamTitle: string;
    clientsTitle: string;
    clientsSubtitle: string;
    contactTitle: string;
    contactFormCta: string;
  };
  zones: {
    title: string;
  };
  featured: {
    title: string;
    subtitle: string;
    visitCta: string;
    catalogCta: string;
    /** Primary button on featured cards → internal `/propiedades/[slug]`. */
    detailCta: string;
    /** CTA tour externo cuando hay `tourUrl`. */
    virtualTourCta: string;
    carouselPrevAria: string;
    carouselNextAria: string;
    /** Dot buttons: slide index 1-based */
    carouselGoToAria: string;
    carouselCenterAria: string;
    carouselTapToCenter: string;
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
    /** Ilustración / foto (`/public/...` o URL). */
    imageSrc?: string;
  };
  downloadables: {
    title: string;
    description: string;
    /** Botón cuando hay `fileUrl` en el ítem. */
    downloadFileCta: string;
    /** Texto cuando el ítem aún no tiene archivo. */
    noFileHint: string;
  };
  footer: {
    tagline: string;
    phoneLabel: string;
    copyright: string;
    proposalLinkLabel: string;
  };
}

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
      ? (["Nosotros", "Propiedades", "Contacto"] as const)
      : (["About", "Properties", "Contact"] as const);

  return [
    { href: `${home}#about`, label: labels[0] },
    { href: `/propiedades${q}`, label: labels[1] },
    { href: `/contacto${q}`, label: labels[2] },
  ];
}

export const HOME_COPY: Record<Locale, HomeCopy> = {
  es: {
    hero: {
      announcement:
        "¿Buscas hospedaje o tu próxima inversión inmobiliaria en México? Da clic aquí",
      title: "Encuentra el lugar perfecto para ti",
      subtitle: "Servicio profesional inmobiliario con sentido humano",
      primaryCta: "Ver propiedades",
      secondaryCta: "Contactar asesor",
      imageBadge: "Venta y renta · CDMX",
    },
    modal: {
      title: "Sitio en desarrollo",
      message:
        "Estamos migrando YOU Soluciones Inmobiliarias a una nueva experiencia. Gracias por tu paciencia mientras terminamos los últimos detalles.",
      close: "Entendido",
      closeA11y: "Cerrar aviso",
    },
    about: {
      title: "Sobre nosotros",
      tagline: "Redefinir el sector inmobiliario",
      intro: [
        "Con la experiencia de asesorar y acompañar a nuestros clientes durante los últimos 15 años, en YOU nos hemos empeñado en hacer tu experiencia lo más segura y eficiente posible.",
        "Nuestra principal misión: cuidar tu patrimonio y el de los tuyos.",
      ],
      historyTitle: "La historia",
      history: [
        "En 2019, con la firme convicción de ofrecer nuestros servicios a más clientes, nace YOU Soluciones Inmobiliarias.",
        "Con miras puestas en ayudar a quienes nos proporcionan su confianza para vender, rentar o encontrar un nuevo espacio para su hogar, oficina o negocio, en YOU simplificamos procesos y asesoramos a nuestros clientes de forma humana y responsable.",
        "Nuestro compromiso es ofrecerte los mejores recursos tecnológicos, mercadológicos y legales disponibles para lograr tus objetivos de forma eficiente.",
        "Somos tu equipo, somos tus aliados, somos YOU.",
      ],
      teamTitle: "Nuestro equipo",
      clientsTitle: "Clientes",
      clientsSubtitle: "Estamos para acompañarte; agenda una llamada o contáctanos cuando lo necesites.",
      contactTitle: "Contacto",
      contactFormCta: "Ir al formulario de contacto",
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
      detailCta: "Ver propiedad",
      virtualTourCta: "Tour virtual",
      carouselPrevAria: "Propiedad anterior",
      carouselNextAria: "Propiedad siguiente",
      carouselGoToAria: "Ir a la propiedad {{n}}",
      carouselCenterAria: "Centrar esta propiedad",
      carouselTapToCenter: "Toca para centrar",
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
      imageSrc: "/marketing/offices-building.png",
      title: "¿Estás buscando OFICINA?",
      description:
        "Te ayudamos a encontrar el lugar perfecto para ti y tus colaboradores.",
      supportText:
        "Tenemos presencia en las zonas corporativas más solicitadas de la ciudad.",
      cta: "Busquemos tu nueva oficina",
    },
    downloadables: {
      title: "Descargables",
      description: "Folletos, fichas técnicas y material comercial para descarga directa.",
      downloadFileCta: "Descargar",
      noFileHint: "Archivo próximamente.",
    },
    footer: {
      tagline: "Empieza a escribir una nueva historia con nosotros.",
      phoneLabel: "Tel.",
      copyright: "Todos los derechos reservados.",
      proposalLinkLabel: "Nuestra propuesta",
    },
  },
  en: {
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
        "We are migrating YOU Soluciones Inmobiliarias to a new experience. Thank you for your patience while we finish the final touches.",
      close: "Got it",
      closeA11y: "Close notice",
    },
    about: {
      title: "About us",
      tagline: "Redefining real estate",
      intro: [
        "Drawing on more than 15 years advising and guiding clients, at YOU we strive to make your experience as safe and efficient as possible.",
        "Our core mission: protecting your assets and those of your family.",
      ],
      historyTitle: "Our story",
      history: [
        "In 2019, with a firm commitment to serve more clients, YOU Soluciones Inmobiliarias was born.",
        "Focused on helping everyone who trusts us to sell, lease, or find a new space for home, office, or business, we simplify processes and advise with a human, responsible approach.",
        "We commit to bringing you the best technological, market, and legal resources available to achieve your goals efficiently.",
        "We are your team, we are your allies, we are YOU.",
      ],
      teamTitle: "Our team",
      clientsTitle: "Clients",
      clientsSubtitle: "We are here to guide you — schedule a call or write to us anytime.",
      contactTitle: "Contact",
      contactFormCta: "Go to contact form",
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
      detailCta: "View listing",
      virtualTourCta: "Virtual tour",
      carouselPrevAria: "Previous listing",
      carouselNextAria: "Next listing",
      carouselGoToAria: "Go to listing {{n}}",
      carouselCenterAria: "Center this listing",
      carouselTapToCenter: "Tap to center",
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
      imageSrc: "/marketing/offices-building.png",
      title: "Looking for an OFFICE?",
      description: "We help you find the perfect place for you and your team.",
      supportText:
        "We have presence in the city's most requested corporate areas.",
      cta: "Let's find your next office",
    },
    downloadables: {
      title: "Downloadables",
      description: "Brochures, data sheets, and commercial assets available for direct download.",
      downloadFileCta: "Download",
      noFileHint: "File coming soon.",
    },
    footer: {
      tagline: "Start writing a new story with us.",
      phoneLabel: "Phone",
      copyright: "All rights reserved.",
      proposalLinkLabel: "Our proposal",
    },
  },
};

/**
 * Resuelve locale: `lang=en` en query tiene prioridad; si no, cookie (`en` / `es`);
 * por defecto español.
 */
export function resolveLocale(lang?: string, cookieLocale?: string | null): Locale {
  const q = lang?.trim();
  if (q === "en") return "en";
  if (q === "es") return "es";
  const c = cookieLocale?.trim();
  if (c === "en") return "en";
  if (c === "es") return "es";
  return "es";
}
