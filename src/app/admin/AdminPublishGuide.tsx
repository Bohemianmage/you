import type { AdminGithubPublishSummary } from "@/lib/site-content/publish-summary";

const code = "rounded-sm bg-brand-surface px-1.5 py-0.5 font-mono text-[0.7rem] text-brand-text";
const step =
  "flex gap-3 rounded-sm border border-brand-border bg-brand-bg px-4 py-3 text-sm text-brand-muted";
const stepNum =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand-border text-xs font-bold text-brand-accent";

export function AdminPublishGuide({ summary }: { summary: AdminGithubPublishSummary }) {
  const { enabled, hasToken, hasRepo, repo, branch, contentPath } = summary;

  return (
    <section className="mt-8 space-y-4" aria-label="Cómo se publican los cambios">
      <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.14em] text-brand-text">Publicación</h2>

      {enabled ? (
        <div className="space-y-3 rounded-sm border border-green-800/35 bg-green-800/10 px-4 py-4 text-sm text-brand-text">
          <p className="font-semibold text-brand-text">GitHub conectado</p>
          <p className="text-brand-muted">
            Al guardar se crea un <strong className="font-medium text-brand-text">commit</strong> en{" "}
            <span className={code}>{repo}</span>, rama <span className={code}>{branch}</span>, archivo{" "}
            <span className={code}>{contentPath}</span>.
          </p>
          <p className="text-xs leading-relaxed text-brand-muted">
            Si Vercel (u otro) está enlazado al repo, el deploy se dispara solo tras el push interno de GitHub. El sitio público se
            actualiza cuando termine ese build.
          </p>
        </div>
      ) : (
        <div className="space-y-3 rounded-sm border border-amber-500/35 bg-amber-500/10 px-4 py-4 text-sm text-brand-text">
          <p className="font-semibold text-brand-text">GitHub no está listo</p>
          <p className="text-brand-muted">
            {!hasToken ? "Falta GITHUB_TOKEN." : null} {!hasRepo ? " Revisá GITHUB_REPO (formato owner/repo)." : null}
          </p>
          <p className="text-xs text-brand-muted">
            Hasta que configures las variables, los cambios solo se pueden guardar en archivo local (no suele funcionar en Vercel).
          </p>
        </div>
      )}

      <div className="rounded-sm border border-brand-border bg-brand-surface/80 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">Configuración en 3 pasos</p>
        <ol className="mt-4 space-y-3">
          <li className={step}>
            <span className={stepNum} aria-hidden>
              1
            </span>
            <span>
              En GitHub: <strong className="font-medium text-brand-text">Settings → Developer settings → Fine-grained tokens</strong>.
              Creá un token con acceso al repo del sitio y permiso <strong className="font-medium text-brand-text">Contents: Read and write</strong>.
            </span>
          </li>
          <li className={step}>
            <span className={stepNum} aria-hidden>
              2
            </span>
            <span>
              En el hosting (o <span className={code}>.env.local</span>):{" "}
              <span className={code}>GITHUB_TOKEN</span> y <span className={code}>GITHUB_REPO</span> (ej.{" "}
              <span className={code}>mi-org/you-sitio</span>).
            </span>
          </li>
          <li className={step}>
            <span className={stepNum} aria-hidden>
              3
            </span>
            <span>
              Opcional: <span className={code}>GITHUB_BRANCH</span>, <span className={code}>GITHUB_SITE_CONTENT_PATH</span>,{" "}
              <span className={code}>GITHUB_COMMIT_PREFIX</span>. Reiniciá el servidor tras cambiar variables.
            </span>
          </li>
        </ol>
      </div>

      {!enabled ? (
        <div className="rounded-sm border border-dashed border-brand-border bg-brand-bg px-4 py-3 text-xs leading-relaxed text-brand-muted">
          <strong className="font-semibold text-brand-text">Solo archivo:</strong> sin GitHub, guardá en local y ejecutá{" "}
          <span className={code}>git add content/site-content.json && git commit</span> antes de hacer push.
        </div>
      ) : null}
    </section>
  );
}
