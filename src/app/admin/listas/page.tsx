import Link from "next/link";

import { logoutAdmin } from "@/app/admin/actions";
import { AdminListsEditor } from "@/app/admin/AdminListsEditor";
import { getSiteContentFresh } from "@/lib/site-settings/load";
import { getAdminEditorSeed } from "@/lib/site-settings/merge";

export default async function AdminListasPage() {
  const [seed, persistedBaseline] = await Promise.all([getAdminEditorSeed(), getSiteContentFresh()]);

  return (
    <div id="admin-listas" className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-brand-border pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-brand-text">Listas de contenido</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Equipo, catálogo, destacadas del inicio y descargables. Guardá con la barra inferior del sitio; el resto del contenido se edita en el sitio en modo edición.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className="text-sm font-semibold text-brand-accent no-underline hover:underline">
            Ir al sitio
          </Link>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="rounded-sm border border-brand-border bg-brand-bg px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-brand-muted transition hover:border-brand-accent hover:text-brand-accent"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <AdminListsEditor seed={seed} persistedBaseline={persistedBaseline} />
    </div>
  );
}
