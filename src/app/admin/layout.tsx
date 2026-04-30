import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-surface text-brand-text">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-sm focus:bg-brand-accent focus:px-3 focus:py-2 focus:text-brand-white"
      >
        Saltar al contenido
      </a>
      {children}
    </div>
  );
}
