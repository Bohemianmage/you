import type { Locale } from "@/i18n/types";

/** Featured property shown on the home page (static seed data). */
export interface FeaturedProperty {
  id: string;
  /** Path segment for `/propiedades/[slug]`; defaults to `id` when omitted. */
  slug?: string;
  title: string;
  price: string;
  address: string;
  status: string;
  ctaLabel: string;
  /** Long description on the property detail page (plain text, optional). */
  description?: string;
  /** Matterport / external tour — when absent, CTA scrolls to `#virtual-tours`. */
  tourUrl?: string;
  /** Optional hero image under `/public`. */
  imageSrc?: string;
}

/**
 * Listados destacados iniciales (precios de mercado de referencia en MXN / USD cuando aplica).
 */
export const FEATURED_PROPERTIES_BY_LOCALE: Record<
  Locale,
  readonly FeaturedProperty[]
> = {
  es: [
    {
      id: "polanco-rent-luxury-balcony",
      title: "Renta Departamento de Lujo con Balcón en Polanco",
      price: "US$ 8,500.00",
      address:
        "Campos Elíseos, Polanco, Polanco II Secc, Miguel Hidalgo, 11550 Ciudad de México, CDMX, México",
      status: "En renta",
      ctaLabel: "Tours virtuales",
    },
    {
      id: "bosques-sale-ph-golf",
      title:
        "Venta PH Dos Niveles con Terraza en Club de Golf Bosques de Santa Fe",
      price: "US$ 4,300,000.00",
      address:
        "Canadá 77, Parque San Andrés, Cuajimalpa de Morelos, 05600 CDMX, México",
      status: "En venta",
      ctaLabel: "Tours virtuales",
    },
    {
      id: "miyana-sale-ph-colibri",
      title: "Venta PH con Terraza en Miyana Torre Colibrí",
      price: "$58,900,000.00 MXN",
      address:
        "Avenida Ejército Nacional, Granada, Ciudad de México, CDMX, México",
      status: "En venta",
      ctaLabel: "Tours virtuales",
    },
    {
      id: "polanco-rent-ph-terraces",
      title: "Renta PH con Terrazas y Balcones en Polanco",
      price: "$110,000.00 MXN",
      address: "Eugenio Sue, Polanco IV Secc, Ciudad de México, CDMX, México",
      status: "En renta",
      ctaLabel: "Tours virtuales",
    },
    {
      id: "tecamachalco-garden-residence",
      slug: "renta-residencia-con-jardin-en-tecamachalco",
      title: "Renta Residencia con Jardín en Tecamachalco",
      price: "$120,000.00 MXN",
      address: "Cerrada Fuente de Leones, Lomas de Tecamachalco, Naucalpan de Juárez, Méx., México",
      status: "En renta",
      ctaLabel: "Recorrido virtual",
      description:
        "Increíble casa con amplio jardín. Acabados de lujo y amplios espacios.\n\n850 m² de construcción · 873 m² de terreno · 250 m² de jardín.\n\nLa casa cuenta con: 5 recámaras con baño completo, 9 estacionamientos, terraza amplia, gimnasio, 2 cuartos de servicio, lavandería, hidroneumático, 2 family rooms, comedor, antecomedor y sala.",
    },
  ],
  en: [
    {
      id: "polanco-rent-luxury-balcony",
      title: "Luxury Apartment for Rent with Balcony in Polanco",
      price: "US$ 8,500.00",
      address:
        "Campos Elíseos, Polanco, Polanco II Secc, Miguel Hidalgo, 11550 Mexico City, CDMX, Mexico",
      status: "For rent",
      ctaLabel: "Virtual tours",
    },
    {
      id: "bosques-sale-ph-golf",
      title:
        "Two-level Penthouse for Sale with Terrace in Club de Golf Bosques de Santa Fe",
      price: "US$ 4,300,000.00",
      address:
        "Canadá 77, Parque San Andrés, Cuajimalpa de Morelos, 05600 CDMX, Mexico",
      status: "For sale",
      ctaLabel: "Virtual tours",
    },
    {
      id: "miyana-sale-ph-colibri",
      title: "Penthouse for Sale with Terrace in Miyana Torre Colibrí",
      price: "$58,900,000.00 MXN",
      address: "Avenida Ejército Nacional, Granada, Mexico City, CDMX, Mexico",
      status: "For sale",
      ctaLabel: "Virtual tours",
    },
    {
      id: "polanco-rent-ph-terraces",
      title: "Penthouse for Rent with Terraces and Balconies in Polanco",
      price: "$110,000.00 MXN",
      address: "Eugenio Sue, Polanco IV Secc, Mexico City, CDMX, Mexico",
      status: "For rent",
      ctaLabel: "Virtual tours",
    },
    {
      id: "tecamachalco-garden-residence",
      slug: "renta-residencia-con-jardin-en-tecamachalco",
      title: "Garden Residence for Rent in Tecamachalco",
      price: "$120,000.00 MXN",
      address: "Cerrada Fuente de Leones, Lomas de Tecamachalco, Naucalpan de Juárez, State of Mexico, Mexico",
      status: "For rent",
      ctaLabel: "Virtual tour",
      description:
        "Remarkable home with a generous garden, luxury finishes, and expansive spaces.\n\n850 m² built · 873 m² lot · 250 m² garden.\n\nFive bedrooms with full baths, nine parking spaces, large terrace, gym, two service rooms, laundry, hydropneumatic system, two family rooms, dining, ante-dining, and living area.",
    },
  ],
};
