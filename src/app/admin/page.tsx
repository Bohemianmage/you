import Link from "next/link";

import { logoutAdmin } from "@/app/admin/actions";
import { SiteContentEditor } from "@/app/admin/SiteContentEditor";
import { getAdminEditorSeed } from "@/lib/site-settings/merge";

interface AdminPageProps {
  searchParams?: Promise<{ saved?: string; error?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: AdminPageProps) {
  const sp = searchParams ? await searchParams : {};
  const seed = await getAdminEditorSeed();

  const flashOk = sp.saved === "1";
  const flashErr =
    sp.error === "write_failed"
      ? "No se pudo escribir el archivo. En entornos serverless (p. ej. Vercel) el disco del proyecto suele ser de solo lectura: probá en local o añadí almacenamiento más adelante."
      : sp.error === "validation"
        ? "Los datos no pasaron la validación. Revisá campos obligatorios en equipo y destacadas (nombre, roles ES/EN, IDs, título, precio, etc.)."
      : sp.error === "invalid_json"
        ? "Petición inválida."
        : null;

  const isVercel = !!process.env.VERCEL;

  return (
    <div id="admin-main" className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-brand-border pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-brand-text">Contenido del sitio</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Editá textos de contacto, hero, pie de página, equipo y propiedades destacadas. Se guarda en{" "}
            <code className="rounded bg-brand-surface px-1 py-0.5 text-xs">content/site-content.json</code> (o{" "}
            <code className="rounded bg-brand-surface px-1 py-0.5 text-xs">SITE_CONTENT_PATH</code>).
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

      {isVercel ? (
        <div className="mt-6 rounded-sm border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-brand-text">
          <strong className="font-semibold">Vercel:</strong> el guardado en archivo puede fallar en producción. Desarrollá el contenido en local y commiteá{" "}
          <code className="rounded bg-brand-surface px-1 py-0.5 text-xs">site-content.json</code>, o más adelante usá un backend/Blob.
        </div>
      ) : null}

      {flashOk ? (
        <p className="mt-6 rounded-sm border border-green-700/25 bg-green-700/10 px-4 py-3 text-sm text-brand-text">Cambios guardados.</p>
      ) : null}
      {flashErr ? (
        <p className="mt-6 rounded-sm border border-brand-accent/40 bg-brand-accent/10 px-4 py-3 text-sm text-brand-accent-strong">{flashErr}</p>
      ) : null}

      <SiteContentEditor seed={seed} />
    </div>
  );
}
