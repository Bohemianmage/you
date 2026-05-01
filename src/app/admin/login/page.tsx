import Link from "next/link";

import { loginAdmin } from "@/app/admin/actions";
import { withYouWordmark } from "@/components/brand/you-wordmark";

interface LoginPageProps {
  searchParams?: Promise<{ error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const sp = searchParams ? await searchParams : {};
  const err = sp.error;

  const errorMessage =
    err === "auth"
      ? "Contraseña incorrecta."
      : err === "config"
        ? "Falta configurar ADMIN_SESSION_SECRET (mín. 16 caracteres)."
        : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-sm border border-brand-border bg-brand-bg p-8 shadow-[0_8px_30px_-12px_rgba(47,46,46,0.15)]">
        <h1 className="font-heading text-xl font-semibold text-brand-text">{withYouWordmark("Panel YOU")}</h1>
        <p className="mt-2 text-sm text-brand-muted">Introduce la contraseña de administrador.</p>
        {errorMessage ? (
          <p className="mt-4 rounded-sm border border-brand-accent/40 bg-brand-accent/10 px-3 py-2 text-sm text-brand-accent-strong">
            {errorMessage}
          </p>
        ) : null}
        <form action={loginAdmin} className="mt-8 space-y-4">
          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">
            Contraseña
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-sm border border-brand-border bg-brand-bg px-3 py-2.5 text-sm outline-none ring-brand-accent focus:border-brand-accent focus:ring-1"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-sm bg-brand-accent py-3 text-sm font-semibold text-brand-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition hover:bg-brand-accent-strong"
          >
            Entrar
          </button>
        </form>
        <p className="mt-8 text-center text-xs text-brand-subtle">
          <Link href="/" className="text-brand-accent no-underline hover:underline">
            Volver al sitio
          </Link>
        </p>
      </div>
    </div>
  );
}
