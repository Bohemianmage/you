import Link from "next/link";

import { logoutAdmin } from "@/app/admin/actions";
import { AdminSaveStatus, type AdminSaveFlash } from "@/app/admin/AdminSaveStatus";
import { SiteContentEditor } from "@/app/admin/SiteContentEditor";
import { getAdminEditorSeed } from "@/lib/site-settings/merge";

interface AdminPageProps {
  searchParams?: Promise<{ saved?: string; error?: string }>;
}

function flashFromSearchParams(sp: { saved?: string; error?: string }): AdminSaveFlash {
  if (sp.saved === "1") return { kind: "success" };
  if (sp.error && typeof sp.error === "string") return { kind: "error", code: sp.error };
  return null;
}

export default async function AdminDashboardPage({ searchParams }: AdminPageProps) {
  const sp = searchParams ? await searchParams : {};
  const seed = await getAdminEditorSeed();
  const flash = flashFromSearchParams(sp);

  return (
    <div id="admin-main" className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-brand-border pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-brand-text">Contenido del sitio</h1>
          <p className="mt-1 max-w-xl text-sm text-brand-muted">
            Editá contacto, hero, pie de página, equipo y propiedades destacadas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className="text-sm font-semibold text-brand-accent no-underline hover:underline">
            Ver sitio
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

      <AdminSaveStatus flash={flash} />

      <SiteContentEditor seed={seed} />
    </div>
  );
}
