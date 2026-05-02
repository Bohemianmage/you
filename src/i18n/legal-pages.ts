import type { Locale } from "@/i18n/types";

/** Textos legales genéricos — revisión jurídica recomendada antes de producción. */
export const LEGAL_PAGES_COPY: Record<
  Locale,
  {
    termsTitle: string;
    termsLead: string;
    termsSections: { heading: string; body: string[] }[];
    privacyTitle: string;
    privacyLead: string;
    privacySections: { heading: string; body: string[] }[];
  }
> = {
  es: {
    termsTitle: "Términos y condiciones",
    termsLead:
      "Estos términos regulan el uso del sitio web y los servicios digitales de YOU Soluciones Inmobiliarias. Al navegar o enviar formularios aceptas cumplirlos.",
    termsSections: [
      {
        heading: "1. Objeto",
        body: [
          "El sitio informa sobre propiedades y permite contactar al equipo. Los datos del catálogo pueden provenir de terceros y están sujetos a cambio sin previo aviso.",
        ],
      },
      {
        heading: "2. Solicitudes de visita",
        body: [
          "Las solicitudes enviadas por el sitio no constituyen una cita confirmada hasta que un asesor las apruebe por correo electrónico.",
          "El usuario declara que la documentación indicada en el formulario es veraz; YOU puede rechazar la solicitud si detecta inconsistencias.",
        ],
      },
      {
        heading: "3. Limitación de responsabilidad",
        body: [
          "YOU no garantiza disponibilidad continua del sitio ni ausencia de errores en listados. Las decisiones de inversión son responsabilidad del usuario.",
        ],
      },
      {
        heading: "4. Modificaciones",
        body: ["YOU puede actualizar estos términos publicando la nueva versión en esta página."],
      },
    ],
    privacyTitle: "Aviso de privacidad simplificado",
    privacyLead:
      "YOU Soluciones Inmobiliarias, en lo sucesivo YOU, con domicilio en México, trata datos personales conforme a la LFPDPPP y normativa aplicable.",
    privacySections: [
      {
        heading: "Responsable",
        body: [
          "YOU Soluciones Inmobiliarias. Para ejercer derechos ARCO o dudas sobre privacidad, usa los datos de contacto publicados en el pie del sitio.",
        ],
      },
      {
        heading: "Datos tratados",
        body: [
          "Identificación de contacto: nombre, correo y teléfono; preferencias de propiedad y, cuando envías una solicitud de visita, la declaración sobre documentación que planeas presentar y notas opcionales.",
        ],
      },
      {
        heading: "Finalidades",
        body: [
          "Responder consultas, coordinar visitas, mejorar el servicio y cumplir obligaciones legales. La información declarada para citas se conserva cifrada de forma temporal, unos 30 días, y luego se elimina automáticamente salvo obligación legal distinta.",
        ],
      },
      {
        heading: "Transferencias",
        body: [
          "Datos alojados en proveedores de infraestructura en la nube, por ejemplo almacenamiento y correo transaccional, bajo acuerdos de confidencialidad.",
        ],
      },
      {
        heading: "Derechos",
        body: [
          "Puedes solicitar acceso, rectificación, cancelación u oposición enviando un correo al responsable. Conservamos registros mientras sea necesario para las finalidades descritas.",
        ],
      },
    ],
  },
  en: {
    termsTitle: "Terms & conditions",
    termsLead:
      "These terms govern use of the YOU Soluciones Inmobiliarias website and digital services. By browsing or submitting forms you agree to comply.",
    termsSections: [
      {
        heading: "1. Purpose",
        body: [
          "The site provides property information and ways to contact our team. Listing data may come from third parties and may change without notice.",
        ],
      },
      {
        heading: "2. Visit requests",
        body: [
          "Requests submitted online are not confirmed visits until an advisor approves them by email.",
          "You declare that documentation selections are truthful; YOU may reject a request if inconsistencies are found.",
        ],
      },
      {
        heading: "3. Limitation of liability",
        body: [
          "YOU does not guarantee uninterrupted availability or error-free listings. Investment decisions are your sole responsibility.",
        ],
      },
      {
        heading: "4. Changes",
        body: ["YOU may update these terms by publishing the new version on this page."],
      },
    ],
    privacyTitle: "Privacy notice summary",
    privacyLead:
      "YOU Soluciones Inmobiliarias, hereinafter YOU, operating in Mexico, processes personal data under applicable privacy laws.",
    privacySections: [
      {
        heading: "Controller",
        body: [
          "YOU Soluciones Inmobiliarias. To exercise privacy rights or ask questions, use the contact details in the site footer.",
        ],
      },
      {
        heading: "Data processed",
        body: [
          "Contact details: name, email, and phone; property preferences; and for visit requests, your declaration of documentation you plan to bring plus optional notes.",
        ],
      },
      {
        heading: "Purposes",
        body: [
          "Respond to enquiries, coordinate visits, improve service, and comply with legal duties. Visit-related declarations are stored encrypted temporarily for about 30 days and then deleted automatically unless law requires otherwise.",
        ],
      },
      {
        heading: "Processors",
        body: ["Infrastructure and transactional email providers under confidentiality commitments."],
      },
      {
        heading: "Your rights",
        body: [
          "You may request access, correction, deletion, or objection by emailing us. We retain data as needed for the purposes above.",
        ],
      },
    ],
  },
};
