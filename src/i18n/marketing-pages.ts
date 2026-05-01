import type { Locale } from "@/i18n/types";

/** `/propiedades` — localized chrome only; listing titles stay Spanish (market reality). */
export const CATALOG_PAGE_COPY: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    zoneLabel: string;
    /** Segundo nivel de ubicación (colonia / tramo antes de ciudad+estado). */
    areaLabel: string;
    /** Texto de ayuda bajo el selector de región (agrupación). */
    filterRegionHint: string;
    filterAreaHint: string;
    /** Con región ya elegida y opciones de colonia disponibles. */
    filterAreaOptional: string;
    mapHeading: string;
    mapHint: string;
    mapEmpty: string;
    mapError: string;
    /** Línea de ubicación en tarjetas del listado. */
    cardLocationLabel: string;
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
    filterAreaAll: string;
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
    /** Texto bajo filtros cuando se aplican en vivo (sin botón «Aplicar»). */
    filterLiveHint: string;
    filterReset: string;
    filterPriceNote: string;
    filtersDetailSubtitle: string;
    /** Tras el número en el chip (ej. «3 filtros activos» / «1 filtro activo»). */
    filterActivePlural: string;
    filterActiveSingular: string;
    filterGroupZone: string;
    filterGroupSize: string;
    filterGroupLayout: string;
    filterGroupPrice: string;
    filterListingTypeHint: string;
    /** Detalle opcional (m², recámaras, precio…) dentro del panel de filtros. */
    filterMoreOptionsHeading: string;
    /** Sin filtros de listado: "{{count}}" */
    catalogCountAll: string;
    /** Con filtros activos: "{{shown}}" / "{{total}}" */
    catalogCountFiltered: string;
    listingBadgeRent: string;
    listingBadgeSale: string;
  }
> = {
  es: {
    title: "Propiedades",
    subtitle: "Portafolio disponible y referencias en zonas premium de CDMX.",
    zoneLabel: "Región",
    areaLabel: "Colonia o zona",
    filterRegionHint: "Ciudad y estado (últimos segmentos). Luego puedes afinar por colonia o tramo local.",
    filterAreaHint: "Elige primero una región para ver colonias o zonas disponibles en el catálogo.",
    filterAreaOptional: "Opcional: refina por colonia o tramo local cuando exista en los datos.",
    mapHeading: "Mapa",
    mapHint: "Marcadores según el listado filtrado (coordenadas desde la ficha de cada propiedad).",
    mapEmpty: "Ninguna propiedad del listado tiene coordenadas para mostrar.",
    mapError: "No se pudo cargar el mapa. Intenta de nuevo más tarde.",
    cardLocationLabel: "Ubicación",
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
    filtersDetailHeading: "Filtros",
    filterZoneAll: "Todas las regiones",
    filterAreaAll: "Todas las colonias / zonas",
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
    filterLiveHint: "Los resultados se actualizan al instante al cambiar los filtros.",
    filterReset: "Limpiar todo",
    filterPriceNote: "El filtro por precio usa la moneda indicada y los datos numéricos de cada propiedad.",
    filtersDetailSubtitle: "",
    filterActivePlural: "filtros activos",
    filterActiveSingular: "filtro activo",
    filterGroupZone: "Ubicación",
    filterGroupSize: "Superficie",
    filterGroupLayout: "Recámaras y baños",
    filterGroupPrice: "Precio",
    filterListingTypeHint: "Todas las operaciones, solo renta o solo venta.",
    filterMoreOptionsHeading: "Más opciones",
    catalogCountAll: "{{count}} propiedades",
    catalogCountFiltered: "{{shown}} de {{total}} propiedades",
    listingBadgeRent: "Renta",
    listingBadgeSale: "Venta",
  },
  en: {
    title: "Properties",
    subtitle: "Available portfolio and references in Mexico City premium corridors.",
    zoneLabel: "Region",
    areaLabel: "Neighborhood or area",
    filterRegionHint: "City and state (last segments). Then narrow by neighborhood or local area.",
    filterAreaHint: "Pick a region first to see available neighborhoods in the catalog.",
    filterAreaOptional: "Optional: narrow by neighborhood when present in the data.",
    mapHeading: "Map",
    mapHint: "Markers reflect the filtered list (coordinates from each listing’s record).",
    mapEmpty: "No listings in this view have coordinates to display.",
    mapError: "Could not load the map. Please try again later.",
    cardLocationLabel: "Location",
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
    filtersDetailHeading: "Filters",
    filterZoneAll: "All regions",
    filterAreaAll: "All neighborhoods / areas",
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
    filterLiveHint: "Results update instantly as you change filters.",
    filterReset: "Clear all",
    filterPriceNote: "Price filtering uses the selected currency and each listing’s numeric amount.",
    filtersDetailSubtitle: "",
    filterActivePlural: "active filters",
    filterActiveSingular: "active filter",
    filterGroupZone: "Location",
    filterGroupSize: "Floor area",
    filterGroupLayout: "Beds & baths",
    filterGroupPrice: "Price",
    filterListingTypeHint: "All listings, rentals only, or sales only.",
    filterMoreOptionsHeading: "More options",
    catalogCountAll: "{{count}} listings",
    catalogCountFiltered: "{{shown}} of {{total}} listings",
    listingBadgeRent: "Rent",
    listingBadgeSale: "Sale",
  },
};

/** `/propiedades/[slug]` — ficha de una propiedad destacada (merge archivo + seed). */
export const PROPERTY_DETAIL_COPY: Record<
  Locale,
  {
    interestCta: string;
    backCatalog: string;
    descriptionFallback: string;
    virtualTourCta: string;
    detailsHeading: string;
    typeLabel: string;
    neighborhoodLabel: string;
    bedroomsLabel: string;
    bathroomsLabel: string;
    fullBathroomsLabel: string;
    halfBathroomsLabel: string;
    builtLabel: string;
    lotLabel: string;
    gardenLabel: string;
    parkingLabel: string;
    yearLabel: string;
    expensesLabel: string;
    floorsLabel: string;
    floorUnitLabel: string;
    lotDimensionsLabel: string;
    operationsHeading: string;
    operationTypeSale: string;
    operationTypeRental: string;
    operationTypeTemporaryRental: string;
    operationTypeRent: string;
    operationTypeFallback: string;
    operationPeriodMonthly: string;
    operationPeriodDaily: string;
    operationPeriodWeekly: string;
    operationPeriodYearly: string;
    featuresHeading: string;
    featuresUncategorized: string;
    tagsHeading: string;
    videosHeading: string;
    documentsHeading: string;
    videoOpenLabel: string;
    agentHeading: string;
    badgeForeclosure: string;
    locationHeading: string;
    openMaps: string;
    brochureCta: string;
    officeHeading: string;
    contactFormCta: string;
  }
> = {
  es: {
    interestCta: "Me interesa",
    backCatalog: "Ver catálogo",
    descriptionFallback:
      "Para más detalle y disponibilidad actual, escribinos o agenda una visita con un asesor YOU.",
    virtualTourCta: "Tour virtual",
    detailsHeading: "Detalles de la propiedad",
    typeLabel: "Tipo",
    neighborhoodLabel: "Colonia / zona",
    bedroomsLabel: "Recámaras",
    bathroomsLabel: "Baños",
    fullBathroomsLabel: "Baños completos",
    halfBathroomsLabel: "Medios baños",
    builtLabel: "Construcción",
    lotLabel: "Terreno",
    gardenLabel: "Jardín",
    parkingLabel: "Estacionamiento",
    yearLabel: "Año",
    expensesLabel: "Gastos / mantenimiento",
    floorsLabel: "Niveles",
    floorUnitLabel: "Nivel / planta",
    lotDimensionsLabel: "Medidas del terreno (frente × fondo)",
    operationsHeading: "Precios y operaciones",
    operationTypeSale: "Venta",
    operationTypeRental: "Renta",
    operationTypeTemporaryRental: "Renta temporal",
    operationTypeRent: "Renta",
    operationTypeFallback: "Operación",
    operationPeriodMonthly: "mensual",
    operationPeriodDaily: "diaria",
    operationPeriodWeekly: "semanal",
    operationPeriodYearly: "anual",
    featuresHeading: "Características",
    featuresUncategorized: "General",
    tagsHeading: "Etiquetas",
    videosHeading: "Videos",
    documentsHeading: "Documentos",
    videoOpenLabel: "Ver video",
    agentHeading: "Agente",
    badgeForeclosure: "Remate",
    locationHeading: "Ubicación",
    openMaps: "Ver en Google Maps",
    brochureCta: "Descargar folleto",
    officeHeading: "Oficina YOU",
    contactFormCta: "Formulario de contacto",
  },
  en: {
    interestCta: "I’m interested",
    backCatalog: "Browse listings",
    descriptionFallback:
      "For availability and full detail, contact us or schedule a visit with a YOU advisor.",
    virtualTourCta: "Virtual tour",
    detailsHeading: "Property details",
    typeLabel: "Type",
    neighborhoodLabel: "Neighborhood",
    bedroomsLabel: "Bedrooms",
    bathroomsLabel: "Bathrooms",
    fullBathroomsLabel: "Full bathrooms",
    halfBathroomsLabel: "Half bathrooms",
    builtLabel: "Built area",
    lotLabel: "Lot size",
    gardenLabel: "Garden",
    parkingLabel: "Parking",
    yearLabel: "Year built",
    expensesLabel: "Expenses / HOA",
    floorsLabel: "Floors (levels)",
    floorUnitLabel: "Floor / level",
    lotDimensionsLabel: "Lot dimensions (front × depth)",
    operationsHeading: "Pricing & operations",
    operationTypeSale: "Sale",
    operationTypeRental: "Rent",
    operationTypeTemporaryRental: "Short-term rent",
    operationTypeRent: "Rent",
    operationTypeFallback: "Operation",
    operationPeriodMonthly: "monthly",
    operationPeriodDaily: "daily",
    operationPeriodWeekly: "weekly",
    operationPeriodYearly: "yearly",
    featuresHeading: "Features",
    featuresUncategorized: "General",
    tagsHeading: "Tags",
    videosHeading: "Videos",
    documentsHeading: "Documents",
    videoOpenLabel: "Watch video",
    agentHeading: "Agent",
    badgeForeclosure: "Foreclosure",
    locationHeading: "Location",
    openMaps: "Open in Google Maps",
    brochureCta: "Download brochure",
    officeHeading: "YOU office",
    contactFormCta: "Contact form",
  },
};

export function ebOperationTypeLabel(type: string, locale: Locale): string {
  const c = PROPERTY_DETAIL_COPY[locale];
  switch (type) {
    case "sale":
      return c.operationTypeSale;
    case "rental":
      return c.operationTypeRental;
    case "temporary_rental":
      return c.operationTypeTemporaryRental;
    case "rent":
      return c.operationTypeRent;
    default:
      return c.operationTypeFallback;
  }
}

export function ebOperationPeriodNote(period: string | undefined, locale: Locale): string | undefined {
  const raw = period?.trim();
  if (!raw) return undefined;
  const p = raw.toLowerCase();
  const c = PROPERTY_DETAIL_COPY[locale];
  switch (p) {
    case "monthly":
      return c.operationPeriodMonthly;
    case "daily":
      return c.operationPeriodDaily;
    case "weekly":
      return c.operationPeriodWeekly;
    case "yearly":
      return c.operationPeriodYearly;
    default:
      return raw;
  }
}

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
      "Fotografía profesional: ayudamos a que tu propiedad destaque entre los anuncios.",
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
    sectionSubtitle: "Cuéntanos qué necesitas; un asesor te responderá pronto.",
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
    errorValidation: "Completa nombre, correo y mensaje.",
    errorNoConfig:
      "El formulario aún no envía correo. Llámanos al 55-92-21-73-28 o escríbenos por redes sociales.",
    errorSend: "No pudimos enviar tu mensaje. Vuelve a intentarlo o contáctanos por teléfono.",
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
