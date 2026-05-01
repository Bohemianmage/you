import Link from "next/link";

import { AdminListsEditor } from "@/app/admin/AdminListsEditor";
import { getAdminEditorSeed } from "@/lib/site-settings/merge";

export default async function AdminListasPage() {
  const seed = await getAdminEditorSeed();

  return (
    <div id="admin-listas" className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-brand-border pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-brand-text">Listas de contenido</h1>
        </div>
        <Link href="/" className="shrink-0 text-sm font-semibold text-brand-accent no-underline hover:underline">
          Ir al sitio
        </Link>
      </header>

      <AdminListsEditor seed={seed} />
    </div>
  );
}
