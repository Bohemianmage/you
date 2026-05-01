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
    viewListingCta: string;
    virtualTourCta: string;
    filterHeading: string;
    filterAll: string;
    filterRent: string;
    filterSale: string;
    noResults: string;
    filtersDetailHeading: string;
    filterZoneAll: string;
    filterM2Min: string;
    filterM2Max: string;
    filterBedMin: string;
    filterBedMax: string;
    filterBathMin: string;
    filterBathMax: string;
    filterPriceMin: string;
    filterPriceMax: string;
    filterCurrency: string;
    filterCurrencyMXN: string;
    filterCurrencyUSD: string;
    filterApply: string;
    filterReset: string;
    filterPriceNote: string;
    filtersDetailSubtitle: string;
    filterActiveLabel: string;
    filterGroupZone: string;
    filterGroupSize: string;
    filterGroupLayout: string;
    filterGroupPrice: string;
    filterListingTypeHint: string;
  }
> = {
  es: {
    title: "Propiedades",
    subtitle: "Portafolio disponible y referencias en zonas premium de CDMX.",
    zoneLabel: "Zona",
    specsLabel: "Superficie y distribución",
    backHome: "Volver al inicio",
    contactCta: "Platicar con un asesor",
    viewListingCta: "Ver ficha",
    virtualTourCta: "Tour virtual",
    filterHeading: "Tipo de operación",
    filterAll: "Todas",
    filterRent: "En renta",
    filterSale: "En venta",
    noResults: "No hay propiedades que coincidan con estos filtros.",
    filtersDetailHeading: "Más criterios",
    filterZoneAll: "Todas las zonas",
    filterM2Min: "m² mín.",
    filterM2Max: "m² máx.",
    filterBedMin: "Rec. mín.",
    filterBedMax: "Rec. máx.",
    filterBathMin: "Baños mín.",
    filterBathMax: "Baños máx.",
    filterPriceMin: "Precio mín.",
    filterPriceMax: "Precio máx.",
    filterCurrency: "Moneda (precio)",
    filterCurrencyMXN: "MXN",
    filterCurrencyUSD: "USD",
    filterApply: "Aplicar filtros",
    filterReset: "Limpiar todo",
    filterPriceNote: "El filtro por precio usa la moneda indicada y los datos numéricos de cada propiedad.",
    filtersDetailSubtitle: "Combiná criterios y tocá aplicar para actualizar el listado.",
    filterActiveLabel: "criterios activos",
    filterGroupZone: "Ubicación",
    filterGroupSize: "Superficie",
    filterGroupLayout: "Recámaras y baños",
    filterGroupPrice: "Precio",
    filterListingTypeHint: "Todas las operaciones, solo renta o solo venta.",
  },
  en: {
    title: "Properties",
    subtitle: "Available portfolio and references in Mexico City premium corridors.",
    zoneLabel: "Area",
    specsLabel: "Size & layout",
    backHome: "Back to home",
    contactCta: "Talk to an advisor",
    viewListingCta: "View listing",
    virtualTourCta: "Virtual tour",
    filterHeading: "Listing type",
    filterAll: "All",
    filterRent: "For rent",
    filterSale: "For sale",
    noResults: "No listings match these filters.",
    filtersDetailHeading: "More criteria",
    filterZoneAll: "All areas",
    filterM2Min: "Min m²",
    filterM2Max: "Max m²",
    filterBedMin: "Min beds",
    filterBedMax: "Max beds",
    filterBathMin: "Min baths",
    filterBathMax: "Max baths",
    filterPriceMin: "Min price",
    filterPriceMax: "Max price",
    filterCurrency: "Currency (price)",
    filterCurrencyMXN: "MXN",
    filterCurrencyUSD: "USD",
    filterApply: "Apply filters",
    filterReset: "Clear all",
    filterPriceNote: "Price filtering uses the selected currency and each listing’s numeric amount.",
    filtersDetailSubtitle: "Combine criteria, then apply to refresh the list.",
    filterActiveLabel: "active filters",
    filterGroupZone: "Location",
    filterGroupSize: "Floor area",
    filterGroupLayout: "Beds & baths",
    filterGroupPrice: "Price",
    filterListingTypeHint: "All listings, rentals only, or sales only.",
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
    virtualTourCta: string;
    detailsHeading: string;
    typeLabel: string;
    neighborhoodLabel: string;
    bedroomsLabel: string;
    bathroomsLabel: string;
    builtLabel: string;
    lotLabel: string;
    gardenLabel: string;
    parkingLabel: string;
    yearLabel: string;
    locationHeading: string;
    openMaps: string;
    brochureCta: string;
    officeHeading: string;
    contactFormCta: string;
  }
> = {
  es: {
    interestCta: "Me interesa",
    backFeatured: "Volver a destacadas",
    backCatalog: "Ver catálogo",
    descriptionFallback:
      "Para más detalle y disponibilidad actual, escribinos o agenda una visita con un asesor YOU.",
    virtualTourCta: "Tour virtual",
    detailsHeading: "Detalles de la propiedad",
    typeLabel: "Tipo",
    neighborhoodLabel: "Colonia / zona",
    bedroomsLabel: "Recámaras",
    bathroomsLabel: "Baños",
    builtLabel: "Construcción",
    lotLabel: "Terreno",
    gardenLabel: "Jardín",
    parkingLabel: "Estacionamiento",
    yearLabel: "Año",
    locationHeading: "Ubicación",
    openMaps: "Ver en Google Maps",
    brochureCta: "Descargar folleto",
    officeHeading: "Oficina YOU",
    contactFormCta: "Formulario de contacto",
  },
  en: {
    interestCta: "I’m interested",
    backFeatured: "Back to featured",
    backCatalog: "Browse listings",
    descriptionFallback:
      "For availability and full detail, contact us or schedule a visit with a YOU advisor.",
    virtualTourCta: "Virtual tour",
    detailsHeading: "Property details",
    typeLabel: "Type",
    neighborhoodLabel: "Neighborhood",
    bedroomsLabel: "Bedrooms",
    bathroomsLabel: "Bathrooms",
    builtLabel: "Built area",
    lotLabel: "Lot size",
    gardenLabel: "Garden",
    parkingLabel: "Parking",
    yearLabel: "Year built",
    locationHeading: "Location",
    openMaps: "Open in Google Maps",
    brochureCta: "Download brochure",
    officeHeading: "YOU office",
    contactFormCta: "Contact form",
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
