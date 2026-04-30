/** Listing lifecycle labels used in featured cards. */
export type PropertyStatus = "En Renta" | "En Venta";

/** Featured property shown on the home page (static seed data). */
export interface FeaturedProperty {
  id: string;
  title: string;
  price: string;
  address: string;
  status: PropertyStatus;
  ctaLabel: string;
}

/**
 * Hardcoded featured listings migrated from the legacy site inventory.
 * Property 3 price inferred from incomplete source (“,900,000.00” → USD).
 * Property 4 rent amount was missing in source; marked as consult.
 */
export const FEATURED_PROPERTIES: readonly FeaturedProperty[] = [
  {
    id: "polanco-rent-luxury-balcony",
    title: "Renta Departamento de Lujo con Balcón en Polanco",
    price: "US$ 8,500.00",
    address:
      "Campos Elíseos, Polanco, Polanco II Secc, Miguel Hidalgo, 11550 Ciudad de México, CDMX, México",
    status: "En Renta",
    ctaLabel: "Tours virtuales",
  },
  {
    id: "bosques-sale-ph-golf",
    title: "Venta PH Dos Niveles con Terraza en Club de Golf Bosques de Santa Fe",
    price: "US$ 4,300,000.00",
    address: "Canadá 77, Parque San Andrés, Cuajimalpa de Morelos, 05600 CDMX, México",
    status: "En Venta",
    ctaLabel: "Tours virtuales",
  },
  {
    id: "miyana-sale-ph-colibri",
    title: "Venta PH con Terraza en Miyana Torre Colibrí",
    price: "US$ 900,000.00",
    address: "Avenida Ejército Nacional, Granada, Ciudad de México, CDMX, México",
    status: "En Venta",
    ctaLabel: "Tours virtuales",
  },
  {
    id: "polanco-rent-ph-terraces",
    title: "Renta PH con Terrazas y Balcones en Polanco",
    price: "Consultar",
    address: "Eugenio Sue, Polanco IV Secc, Ciudad de México, CDMX, México",
    status: "En Renta",
    ctaLabel: "Tours virtuales",
  },
] as const;
