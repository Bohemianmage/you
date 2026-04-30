import type { Metadata } from "next";
import { DM_Sans, Montserrat } from "next/font/google";

import "./globals.css";

/** Body copy — close to Wix DIN Next Light usage. */
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Headings — geometric sans similar to Wix Avenir Heavy stack. */
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${dmSans.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-brand-bg text-brand-text">{children}</body>
    </html>
  );
}
