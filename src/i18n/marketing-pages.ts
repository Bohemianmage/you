import type { Locale } from "@/i18n/types";

/** `/propiedades` — localized chrome only; listing titles stay Spanish (market reality). */
export const CATALOG_PAGE_COPY: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    zoneLabel: string;
    specsLabel: string;
    backHome: string;
    contactCta: string;
  }
> = {
  es: {
    title: "Propiedades",
    subtitle: "Portafolio disponible y referencias en zonas premium de CDMX.",
    zoneLabel: "Zona",
    specsLabel: "Superficie y distribución",
    backHome: "Volver al inicio",
    contactCta: "Platicar con un asesor",
  },
  en: {
    title: "Properties",
    subtitle: "Available portfolio and references in Mexico City premium corridors.",
    zoneLabel: "Area",
    specsLabel: "Size & layout",
    backHome: "Back to home",
    contactCta: "Talk to an advisor",
  },
};

/** `/propiedades/[slug]` — ficha de una propiedad destacada (merge archivo + seed). */
export const PROPERTY_DETAIL_COPY: Record<
  Locale,
  {
    interestCta: string;
    backFeatured: string;
    backCatalog: string;
    descriptionFallback: string;
  }
> = {
  es: {
    interestCta: "Me interesa",
    backFeatured: "Volver a destacadas",
    backCatalog: "Ver catálogo",
    descriptionFallback:
      "Para más detalle y disponibilidad actual, escribinos o agenda una visita con un asesor YOU.",
  },
  en: {
    interestCta: "I’m interested",
    backFeatured: "Back to featured",
    backCatalog: "Browse listings",
    descriptionFallback:
      "For availability and full detail, contact us or schedule a visit with a YOU advisor.",
  },
};

/** `/nuestra-propuesta` — propuesta para propietarios / arrendadores. */
export const PROPOSAL_PAGE_COPY: Record<
  Locale,
  {
    title: string;
    lead: string;
    bullets: readonly string[];
    officesNote: string;
    contactCta: string;
    catalogCta: string;
  }
> = {
  es: {
    title: "Nuestra propuesta",
    lead:
      "Sabemos lo desafiante que puede ser vender o rentar una propiedad; por ello queremos hacer el proceso mucho más sencillo y seguro para ti.",
    bullets: [
      "Te ayudamos a fijar un costo competitivo para el mercado inmobiliario.",
      "Resolvemos todas tus dudas respecto al proceso de venta o renta.",
      "Captura de recorridos virtuales: acercamos a más clientes potenciales sin salir de casa.",
      "Fotografía profesional: en la carrera por el clic nos aseguramos de que tu propiedad sea la primera.",
      "Brindamos asesoría jurídica gratuita para una decisión informada.",
      "Promocionamos tu propiedad en los más importantes portales web inmobiliarios.",
    ],
    officesNote:
      "Si buscas oficinas para tu equipo, también te acompañamos en las zonas corporativas más solicitadas.",
    contactCta: "Hablar con YOU",
    catalogCta: "Ver propiedades",
  },
  en: {
    title: "Our approach",
    lead:
      "We know how challenging selling or leasing can be; we make the process simpler and safer for you.",
    bullets: [
      "We help you price competitively for the market.",
      "We answer every question about the sale or lease process.",
      "Virtual tours: reach more qualified prospects without unnecessary visits.",
      "Professional photography so your listing wins attention.",
      "Complimentary legal orientation for informed decisions.",
      "We promote your property on leading real estate portals.",
    ],
    officesNote:
      "Looking for office space? We also cover the city’s top corporate districts.",
    contactCta: "Talk to YOU",
    catalogCta: "View properties",
  },
};

/** Shared labels for the contact form (`/` contact section and `/contacto`). */
export const CONTACT_FORM_COPY: Record<
  Locale,
  {
    sectionTitle: string;
    sectionSubtitle: string;
    name: string;
    email: string;
    phone: string;
    topic: string;
    topicPlaceholder: string;
    topics: { value: string; label: string }[];
    message: string;
    submit: string;
    sending: string;
    success: string;
    errorValidation: string;
    errorNoConfig: string;
    errorSend: string;
    honeypotLabel: string;
  }
> = {
  es: {
    sectionTitle: "Contacto",
    sectionSubtitle: "Cuéntanos qué buscas; un asesor te responderá a la brevedad.",
    name: "Nombre",
    email: "Correo electrónico",
    phone: "Teléfono (opcional)",
    topic: "Motivo",
    topicPlaceholder: "Selecciona una opción",
    topics: [
      { value: "general", label: "Consulta general" },
      { value: "visita", label: "Agendar visita" },
      { value: "vender-rentar", label: "Quiero vender o rentar mi propiedad" },
      { value: "oficinas", label: "Busco oficina" },
      { value: "descargables", label: "Material descargable" },
    ],
    message: "Mensaje",
    submit: "Enviar",
    sending: "Enviando…",
    success: "Gracias. Hemos recibido tu mensaje y te contactaremos pronto.",
    errorValidation: "Por favor completa nombre, correo y mensaje.",
    errorNoConfig:
      "El formulario no está configurado para correo aún. Llámanos al 55-92-21-73-28 o escribe a nuestros canales en redes.",
    errorSend: "No pudimos enviar tu mensaje. Intenta de nuevo o contáctanos por teléfono.",
    honeypotLabel: "Empresa",
  },
  en: {
    sectionTitle: "Contact",
    sectionSubtitle: "Tell us what you need; an advisor will reply shortly.",
    name: "Name",
    email: "Email",
    phone: "Phone (optional)",
    topic: "Topic",
    topicPlaceholder: "Choose one",
    topics: [
      { value: "general", label: "General inquiry" },
      { value: "visita", label: "Schedule a viewing" },
      { value: "vender-rentar", label: "I want to sell or lease my property" },
      { value: "oficinas", label: "Office search" },
      { value: "descargables", label: "Downloadable materials" },
    ],
    message: "Message",
    submit: "Send",
    sending: "Sending…",
    success: "Thank you. We received your message and will get back to you soon.",
    errorValidation: "Please fill in name, email, and message.",
    errorNoConfig:
      "Email delivery is not configured yet. Call 55-92-21-73-28 or reach us on social media.",
    errorSend: "We could not send your message. Try again or call us.",
    honeypotLabel: "Company",
  },
};
