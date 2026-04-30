import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-brand-bg text-brand-text">{children}</body>
    </html>
  );
}
