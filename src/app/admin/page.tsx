import Link from "next/link";

import { logoutAdmin } from "@/app/admin/actions";
import { SiteContentEditor } from "@/app/admin/SiteContentEditor";
import { getAdminEditorSeed } from "@/lib/site-settings/merge";

interface AdminPageProps {
  searchParams?: Promise<{ saved?: string; error?: string }>;
}

const githubErr: Record<string, string> = {
  github_unauthorized: "Token de GitHub inválido o expirado.",
  github_forbidden: "Sin permiso para escribir en el repositorio.",
  github_not_found: "Repo, rama o ruta del archivo incorrectos.",
  github_conflict: "Conflicto al actualizar. Intentá de nuevo.",
  github_validation: "GitHub rechazó la actualización (revisá rama o reglas del repo).",
  github_rate_limit: "Demasiadas solicitudes a GitHub. Esperá un momento.",
  github_unknown: "Error al conectar con GitHub.",
};

export default async function AdminDashboardPage({ searchParams }: AdminPageProps) {
  const sp = searchParams ? await searchParams : {};
  const seed = await getAdminEditorSeed();

  const flashOk = sp.saved === "1";

  const flashErr =
    sp.error === "write_failed"
      ? "No se pudo guardar."
      : sp.error === "validation"
        ? "Revisá los campos obligatorios (equipo y destacadas)."
        : sp.error === "invalid_json"
          ? "Datos inválidos."
          : sp.error && githubErr[sp.error]
            ? githubErr[sp.error]
            : null;

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
