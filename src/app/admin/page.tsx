import Link from "next/link";

import { logoutAdmin } from "@/app/admin/actions";
import { AdminPublishGuide } from "@/app/admin/AdminPublishGuide";
import { SiteContentEditor } from "@/app/admin/SiteContentEditor";
import { getAdminGithubPublishSummary } from "@/lib/site-content/github-publish";
import { getAdminEditorSeed } from "@/lib/site-settings/merge";

interface AdminPageProps {
  searchParams?: Promise<{ saved?: string; error?: string; via?: string }>;
}

const githubErr: Record<string, string> = {
  github_unauthorized:
    "GitHub rechazó el token (401). Revisá que GITHUB_TOKEN sea válido y no haya expirado.",
  github_forbidden:
    "Sin permiso en el repo (403). El token necesita Contents: Read and write sobre el repositorio correcto.",
  github_not_found:
    "No se encontró el repo, la rama o la ruta (404). Revisá GITHUB_REPO, GITHUB_BRANCH y GITHUB_SITE_CONTENT_PATH.",
  github_conflict:
    "Conflicto al actualizar el archivo (409). Volvé a intentar; si persiste, revisá si hay ediciones concurrentes en GitHub.",
  github_validation:
    "GitHub rechazó la petición (422). Suele indicar SHA desactualizado o rama protegida.",
  github_rate_limit: "Límite de solicitudes de GitHub (429). Esperá unos minutos e intentá de nuevo.",
  github_unknown: "Error al hablar con GitHub. Revisá los logs del servidor.",
};

export default async function AdminDashboardPage({ searchParams }: AdminPageProps) {
  const sp = searchParams ? await searchParams : {};
  const seed = await getAdminEditorSeed();
  const publishSummary = getAdminGithubPublishSummary();

  const flashOk = sp.saved === "1";
  const viaGithub = sp.via === "github";

  const flashErr =
    sp.error === "write_failed"
      ? "No se pudo escribir el archivo local. En serverless configurá GitHub (GITHUB_TOKEN + GITHUB_REPO) para publicar sin disco."
      : sp.error === "validation"
        ? "Los datos no pasaron la validación. Revisá campos obligatorios en equipo y destacadas (nombre, roles ES/EN, IDs, título, precio, etc.)."
        : sp.error === "invalid_json"
          ? "Petición inválida."
          : sp.error && githubErr[sp.error]
            ? githubErr[sp.error]
            : null;

  const isVercel = !!process.env.VERCEL;

  return (
    <div id="admin-main" className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-brand-border pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-brand-text">Contenido del sitio</h1>
          <p className="mt-1 max-w-xl text-sm text-brand-muted">
            Editá contacto, hero, pie de página, equipo y propiedades destacadas.{" "}
            {publishSummary.enabled ? (
              <>
                Al guardar se publica un commit en GitHub; el JSON efectivo en producción es el del repo tras el deploy.
              </>
            ) : (
              <>
                Con GitHub configurado, cada guardado crea un commit automático. Sin GitHub, el archivo es{" "}
                <code className="rounded bg-brand-surface px-1 py-0.5 text-xs">content/site-content.json</code> (u{" "}
                <code className="rounded bg-brand-surface px-1 py-0.5 text-xs">SITE_CONTENT_PATH</code>) y podés versionarlo con git a mano.
              </>
            )}
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

      <AdminPublishGuide summary={publishSummary} />

      {isVercel && !publishSummary.enabled ? (
        <div className="mt-6 rounded-sm border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-brand-text">
          <strong className="font-semibold">Vercel:</strong> sin GitHub, guardar en archivo suele fallar aquí. Configurá{" "}
          <code className="rounded bg-brand-surface px-1 py-0.5 text-xs">GITHUB_TOKEN</code> y{" "}
          <code className="rounded bg-brand-surface px-1 py-0.5 text-xs">GITHUB_REPO</code> en el proyecto (Environment Variables).
        </div>
      ) : null}

      {flashOk ? (
        <div className="mt-6 space-y-2 rounded-sm border border-green-700/25 bg-green-700/10 px-4 py-3 text-sm text-brand-text">
          <p>{viaGithub ? "Cambios publicados en GitHub." : "Cambios guardados en archivo local."}</p>
          {viaGithub ? (
            <p className="text-xs text-brand-muted">
              Cuando el deploy termine, el sitio mostrará este contenido. Si editás en local, ejecutá{" "}
              <code className="rounded bg-brand-surface px-1 py-0.5 text-[0.65rem]">git pull</code> para alinear{" "}
              <code className="rounded bg-brand-surface px-1 py-0.5 text-[0.65rem]">{publishSummary.contentPath}</code>.
            </p>
          ) : null}
        </div>
      ) : null}
      {flashErr ? (
        <p className="mt-6 rounded-sm border border-brand-accent/40 bg-brand-accent/10 px-4 py-3 text-sm text-brand-accent-strong">{flashErr}</p>
      ) : null}

      <SiteContentEditor seed={seed} publishSummary={publishSummary} />
    </div>
  );
}
