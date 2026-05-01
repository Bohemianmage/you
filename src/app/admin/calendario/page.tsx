import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminCalendarView } from "@/app/admin/calendario/AdminCalendarView";
import { appointmentsRedisConfigured, listAppointmentsInRange } from "@/lib/appointments/store";
import { getIsAdmin } from "@/lib/admin/is-admin";
import { mergeTeamFromFile } from "@/lib/site-content/merge-public";
import { getCachedSiteContent } from "@/lib/site-settings/load";

export default async function AdminCalendarioPage() {
  if (!(await getIsAdmin())) redirect("/admin/login");

  const now = Date.now();
  const from = now - 7 * 86400_000;
  const to = now + 120 * 86400_000;

  const [appointments, file] = await Promise.all([listAppointmentsInRange(from, to), getCachedSiteContent()]);
  const team = mergeTeamFromFile(file);
  const teamById = Object.fromEntries(team.map((m) => [m.id, m]));

  return (
    <div id="admin-calendario" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-brand-border pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-brand-text">Calendario de citas</h1>
          <p className="mt-2 max-w-2xl text-sm text-brand-muted">
            Solicitudes y citas desde las fichas. El asesor debe <strong className="text-brand-text">confirmar manualmente</strong> cada solicitud; la documentación declarada se guarda{" "}
            <strong className="text-brand-text">cifrada</strong> en Redis con caducidad ~30 días. Configura{" "}
            <code className="rounded bg-brand-surface px-1 text-xs">BOOKING_DOCS_ENCRYPTION_KEY</code> (32 bytes:{" "}
            <code className="rounded bg-brand-surface px-1 text-xs">openssl rand -base64 32</code>) además de Redis y{" "}
            <code className="rounded bg-brand-surface px-1 text-xs">RESEND_API_KEY</code>.
          </p>
        </div>
        <Link href="/admin/listas" className="shrink-0 text-sm font-semibold text-brand-accent no-underline hover:underline">
          Listas de contenido
        </Link>
      </header>

      <AdminCalendarView appointments={appointments} teamById={teamById} redisConfigured={appointmentsRedisConfigured()} />
    </div>
  );
}
