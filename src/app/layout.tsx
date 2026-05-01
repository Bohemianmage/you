import type { Metadata } from "next";
import { DM_Sans, Montserrat } from "next/font/google";

import { SiteContentEditProvider } from "@/components/admin/site-content-edit-provider";
import { getIsAdmin } from "@/lib/admin/is-admin";
import type { SiteContentFile } from "@/lib/site-content/types";
import { getSiteContentFresh } from "@/lib/site-settings/load";

import "./globals.css";

/** Cuerpo — DM Sans (legible, neutra). */
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Títulos — Montserrat geométrica. */
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "YOU Soluciones Inmobiliarias",
    template: "%s | YOU Soluciones Inmobiliarias",
  },
  description:
    "Servicio profesional inmobiliario con sentido humano en Ciudad de México y zonas corporativas clave.",
  metadataBase: new URL("https://yousoluciones.com"),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAdmin = await getIsAdmin();
  const initialPersisted: SiteContentFile = isAdmin ? await getSiteContentFresh() : {};

  return (
    <html lang="es" className={`${dmSans.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-brand-bg text-brand-text">
        <SiteContentEditProvider enabled={isAdmin} initialPersisted={initialPersisted}>
          {children}
        </SiteContentEditProvider>
      </body>
    </html>
  );
}
