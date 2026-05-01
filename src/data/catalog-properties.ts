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
  address?: string;
  status?: string;
  /** Filtro catálogo renta vs venta (si falta, se infiere de `status` / texto). */
  listingType?: "rent" | "sale";
  /** Superficie en m² (si falta, se intenta leer de `specs`). */
  areaM2?: number;
  bedrooms?: number;
  /** Permite medios baños (ej. 5.5). */
  bathrooms?: number;
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
}
