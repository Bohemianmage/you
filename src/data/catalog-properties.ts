/** Catálogo para `/propiedades` y fichas `/propiedades/[slug]` (persistible en JSON). */
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

export const CATALOG_PROPERTIES: readonly CatalogProperty[] = [
  {
    id: "polarea-torre-viena",
    title: "Polarea — Torre Viena",
    price: "$1,350,000.00 USD",
    specs: "240 m² · 3 rec. · 3 baños",
    zone: "Polanco",
    status: "En venta",
    listingType: "sale",
    areaM2: 240,
    bedrooms: 3,
    bathrooms: 3,
    priceAmount: 1350000,
    priceCurrency: "USD",
  },
  {
    id: "tres-picos-polanco",
    title: "Tres Picos — Polanco",
    price: "$20,000,000.00 MXN",
    specs: "500 m² · 3 rec. · 5 baños",
    zone: "Polanco",
    status: "En venta",
    listingType: "sale",
    areaM2: 500,
    bedrooms: 3,
    bathrooms: 5,
    priceAmount: 20000000,
    priceCurrency: "MXN",
  },
  {
    id: "tecamachalco-naucalpan",
    title: "Tecamachalco / Naucalpan",
    price: "$90,000.00 MXN",
    specs: "250 m² · 3 rec. · 3 baños",
    zone: "Estado de México",
    status: "En renta",
    listingType: "rent",
    areaM2: 250,
    bedrooms: 3,
    bathrooms: 3,
    priceAmount: 90000,
    priceCurrency: "MXN",
  },
  {
    id: "zona-hotelera-polanco",
    title: "Zona Hotelera — Polanco",
    price: "$2,500,000.00 USD",
    specs: "660 m² · 3 rec. · 4 baños",
    zone: "Polanco",
    status: "En venta",
    listingType: "sale",
    areaM2: 660,
    bedrooms: 3,
    bathrooms: 4,
    priceAmount: 2500000,
    priceCurrency: "USD",
  },
  {
    id: "club-golf-bosques-santa-fe",
    title: 'Club de Golf "Bosques de Santa Fe"',
    price: "$1,350,000.00 USD",
    specs: "240 m² · 3 rec. · 3 baños",
    zone: "Santa Fe",
    status: "En venta",
    listingType: "sale",
    areaM2: 240,
    bedrooms: 3,
    bathrooms: 3,
    priceAmount: 1350000,
    priceCurrency: "USD",
  },
] as const;
