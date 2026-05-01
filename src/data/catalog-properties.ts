/**
 * Catálogo `/propiedades` y fichas `/propiedades/[slug]`.
 * El inventario en vivo proviene de EasyBroker (`getCachedEasyBrokerCatalog`).
 */
export interface CatalogProperty {
  id: string;
  /** Si es `false`, no se publica en /propiedades ni en destacados (solo visible en admin). */
  active?: boolean;
  /** Segmento de URL; por defecto `id`. */
  slug?: string;
  title: string;
  price: string;
  specs: string;
  zone: string;
  /** Ciudad + estado (o equivalente) para filtros; ver `deriveZoneGroup`. EasyBroker siempre lo envía; JSON antiguo puede omitirlo. */
  zoneGroup?: string;
  address?: string;
  status?: string;
  /** Filtro catálogo renta vs venta (si falta, se infiere de `status` / texto). */
  listingType?: "rent" | "sale";
  /** Superficie en m² (si falta, se intenta leer de `specs`). */
  areaM2?: number;
  bedrooms?: number;
  /** Permite medios baños (ej. 5.5). */
  bathrooms?: number;
  /** Baños completos (solo detalle EB); filtros siguen usando `bathrooms` combinado. */
  bathroomsFull?: number;
  /** Cantidad de medios baños (detalle). */
  halfBathrooms?: number;
  /** Monto numérico para filtros; si falta se parsea de `price`. */
  priceAmount?: number;
  priceCurrency?: "MXN" | "USD";
  description?: string;
  imageSrc?: string;
  /** Varias imágenes; la primera sustituye cover si existe. */
  imageGallery?: string[];
  tourUrl?: string;
  ctaLabel?: string;
  neighborhood?: string;
  propertyType?: string;
  lotAreaM2?: number;
  gardenM2?: number;
  parkingSpots?: number;
  yearBuilt?: number;
  brochureUrl?: string;

  /** Operaciones adicionales (venta + renta, etc.) tal cual EasyBroker — para la ficha. */
  ebOperations?: readonly {
    type: string;
    formatted_amount?: string;
    period?: string;
    unit?: string;
  }[];
  /** Gastos / mantenimiento (texto del CRM). */
  expenses?: string;
  /** Niveles totales del inmueble. */
  floorsCount?: number;
  /** Nivel o planta de la propiedad. */
  floorNumber?: string;
  lotLengthM?: number;
  lotWidthM?: number;
  ebFeatures?: readonly { category: string; name: string }[];
  tagLabels?: string[];
  videoUrls?: string[];
  /** Adjuntos (ej. PDF) desde `property_files`. */
  brochureUrls?: string[];
  agentName?: string;
  agentEmail?: string;
  foreclosure?: boolean;
  /** Coordenadas (suelen venir solo del detalle EasyBroker). */
  latitude?: number;
  longitude?: number;
}
