/** Full portfolio listings mirrored from legacy Wix `/propiedades` (deduplicated). */
export interface CatalogProperty {
  id: string;
  title: string;
  price: string;
  specs: string;
  zone: string;
}

export const CATALOG_PROPERTIES: readonly CatalogProperty[] = [
  {
    id: "polarea-torre-viena",
    title: "Polarea — Torre Viena",
    price: "$1,350,000.00 USD",
    specs: "240 m² · 3 rec. · 3 baños",
    zone: "Polanco",
  },
  {
    id: "tres-picos-polanco",
    title: "Tres Picos — Polanco",
    price: "$20,000,000.00 MXN",
    specs: "500 m² · 3 rec. · 5 baños",
    zone: "Polanco",
  },
  {
    id: "tecamachalco-naucalpan",
    title: "Tecamachalco / Naucalpan",
    price: "$90,000.00 MXN",
    specs: "250 m² · 3 rec. · 3 baños",
    zone: "Estado de México",
  },
  {
    id: "zona-hotelera-polanco",
    title: "Zona Hotelera — Polanco",
    price: "$2,500,000.00 USD",
    specs: "660 m² · 3 rec. · 4 baños",
    zone: "Polanco",
  },
  {
    id: "club-golf-bosques-santa-fe",
    title: 'Club de Golf "Bosques de Santa Fe"',
    price: "$1,350,000.00 USD",
    specs: "240 m² · 3 rec. · 3 baños",
    zone: "Santa Fe",
  },
] as const;
