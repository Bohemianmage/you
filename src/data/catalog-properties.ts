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
  description?: string;
  imageSrc?: string;
  tourUrl?: string;
  ctaLabel?: string;
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
  },
  {
    id: "tres-picos-polanco",
    title: "Tres Picos — Polanco",
    price: "$20,000,000.00 MXN",
    specs: "500 m² · 3 rec. · 5 baños",
    zone: "Polanco",
    status: "En venta",
    listingType: "sale",
  },
  {
    id: "tecamachalco-naucalpan",
    title: "Tecamachalco / Naucalpan",
    price: "$90,000.00 MXN",
    specs: "250 m² · 3 rec. · 3 baños",
    zone: "Estado de México",
    status: "En renta",
    listingType: "rent",
  },
  {
    id: "zona-hotelera-polanco",
    title: "Zona Hotelera — Polanco",
    price: "$2,500,000.00 USD",
    specs: "660 m² · 3 rec. · 4 baños",
    zone: "Polanco",
    status: "En venta",
    listingType: "sale",
  },
  {
    id: "club-golf-bosques-santa-fe",
    title: 'Club de Golf "Bosques de Santa Fe"',
    price: "$1,350,000.00 USD",
    specs: "240 m² · 3 rec. · 3 baños",
    zone: "Santa Fe",
    status: "En venta",
    listingType: "sale",
  },
] as const;
