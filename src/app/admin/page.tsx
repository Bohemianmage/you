import Link from "next/link";

import { logoutAdmin } from "@/app/admin/actions";
import { withYouWordmark } from "@/components/brand/you-wordmark";

export default async function AdminDashboardPage() {
  return (
    <div id="admin-main" className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="font-heading text-2xl font-semibold text-brand-text">{withYouWordmark("Panel YOU")}</h1>
      <p className="mt-3 text-sm leading-relaxed text-brand-muted">
        Entra al sitio: verás la barra inferior para guardar y el botón <strong className="font-medium text-brand-text">Editar</strong> en cada bloque del inicio.
      </p>
      <ul className="mt-8 space-y-3 text-sm">
        <li>
          <Link href="/" className="font-semibold text-brand-accent no-underline hover:underline">
            Abrir sitio (modo edición)
          </Link>
        </li>
        <li>
          <Link href="/admin/listas" className="font-semibold text-brand-accent no-underline hover:underline">
            Contenidos del sitio (equipo, destacadas, descargables)
          </Link>
        </li>
        <li>
          <Link href="/admin/analytics" className="font-semibold text-brand-accent no-underline hover:underline">
            Analíticas (visitas, fichas, mapa de calor)
          </Link>
        </li>
        <li>
          <Link href="/admin/calendario" className="font-semibold text-brand-accent no-underline hover:underline">
            Calendario de citas (visitas agendadas)
          </Link>
        </li>
      </ul>
      <form action={logoutAdmin} className="mt-10">
        <button
          type="submit"
          className="rounded-sm border border-brand-border bg-brand-bg px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-brand-muted transition hover:border-brand-accent hover:text-brand-accent"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
