import type { Locale } from "@/i18n/types";

/** Featured property shown on the home page (static seed data). */
export interface FeaturedProperty {
  id: string;
  /** Path segment for `/propiedades/[slug]`; defaults to `id` when omitted. */
  slug?: string;
  title: string;
  price: string;
  address: string;
  /** Resumen tipo catálogo (m², recámaras…), opcional en destacadas desde EasyBroker. */
  specs?: string;
  status: string;
  ctaLabel: string;
  /** Long description on the property detail page (plain text, optional). */
  description?: string;
  /** Matterport / external tour — when absent, CTA scrolls to `#virtual-tours`. */
  tourUrl?: string;
  /** Opcional; si falta se infiere de `status` / título. */
  listingType?: "rent" | "sale";
  /** Optional hero image under `/public`. */
  imageSrc?: string;
  /** Varias rutas / URLs para carrusel en ficha y cover usa la primera. */
  imageGallery?: readonly string[];
  neighborhood?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  bathroomsFull?: number;
  halfBathrooms?: number;
  /** Superficie construida (m²). */
  areaM2?: number;
  lotAreaM2?: number;
  gardenM2?: number;
  parkingSpots?: number;
  yearBuilt?: number;
  brochureUrl?: string;

  ebOperations?: readonly {
    type: string;
    formatted_amount?: string;
    period?: string;
    unit?: string;
  }[];
  ebListingUrl?: string;
  expenses?: string;
  floorsCount?: number;
  floorNumber?: string;
  lotLengthM?: number;
  lotWidthM?: number;
  ebFeatures?: readonly { category: string; name: string }[];
  tagLabels?: string[];
  videoUrls?: string[];
  brochureUrls?: string[];
  collaborationNotes?: string;
  agentName?: string;
  agentEmail?: string;
  foreclosure?: boolean;
  exclusive?: boolean;
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
      neighborhood: "Lomas de Tecamachalco",
      propertyType: "Casa",
      bedrooms: 5,
      bathrooms: 5.5,
      areaM2: 850,
      lotAreaM2: 873,
      gardenM2: 250,
      parkingSpots: 9,
      imageGallery: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=80",
      ],
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
      neighborhood: "Lomas de Tecamachalco",
      propertyType: "House",
      bedrooms: 5,
      bathrooms: 5.5,
      areaM2: 850,
      lotAreaM2: 873,
      gardenM2: 250,
      parkingSpots: 9,
      imageGallery: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=80",
      ],
      description:
        "Remarkable home with a generous garden, luxury finishes, and expansive spaces.\n\n850 m² built · 873 m² lot · 250 m² garden.\n\nFive bedrooms with full baths, nine parking spaces, large terrace, gym, two service rooms, laundry, hydropneumatic system, two family rooms, dining, ante-dining, and living area.",
    },
  ],
};
