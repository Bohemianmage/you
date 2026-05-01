"use client";

import { useMemo, useState } from "react";

import type { StoredAppointment } from "@/lib/appointments/types";
import type { TeamMember } from "@/data/team";

function fmt(iso: string, tz: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: tz,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function AdminCalendarView({
  appointments,
  teamById,
  redisConfigured,
}: {
  appointments: StoredAppointment[];
  teamById: Record<string, TeamMember | undefined>;
  redisConfigured: boolean;
}) {
  const [advisorFilter, setAdvisorFilter] = useState<string>("");

  const advisors = useMemo(() => {
    const ids = new Set<string>();
    for (const a of appointments) ids.add(a.advisorId);
    return [...ids].sort();
  }, [appointments]);

  const filtered = useMemo(() => {
    const list = advisorFilter ? appointments.filter((a) => a.advisorId === advisorFilter) : appointments;
    return [...list].sort((a, b) => a.startIso.localeCompare(b.startIso));
  }, [appointments, advisorFilter]);

  const tz = "America/Mexico_City";

  return (
    <div className="mt-8 space-y-6">
      {!redisConfigured ? (
        <p className="rounded-sm border border-brand-accent/40 bg-brand-accent/10 px-4 py-3 text-sm text-brand-accent-strong">
          Redis no está configurado: las citas no se guardarán. Añade{" "}
          <code className="rounded bg-brand-bg px-1">UPSTASH_REDIS_REST_URL</code> y{" "}
          <code className="rounded bg-brand-bg px-1">UPSTASH_REDIS_REST_TOKEN</code>.
        </p>
      ) : null}

      <div className="flex flex-wrap items-end gap-4">
        <label className="block text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">
          Asesor
          <select
            value={advisorFilter}
            onChange={(e) => setAdvisorFilter(e.target.value)}
            className="mt-2 block min-w-[220px] rounded-sm border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
          >
            <option value="">Todos</option>
            {advisors.map((id) => (
              <option key={id} value={id}>
                {teamById[id]?.name ?? id}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-brand-muted">
          {filtered.length} cita{filtered.length === 1 ? "" : "s"} · Horarios en {tz}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-brand-muted">No hay citas en este rango.</p>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-brand-border">
          <table className="min-w-full divide-y divide-brand-border text-sm">
            <thead className="bg-brand-surface/80">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Inicio</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Asesor</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Propiedad</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Cliente</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Recordatorio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border bg-brand-bg">
              {filtered.map((a) => (
                <tr key={a.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-text">{fmt(a.startIso, tz)}</td>
                  <td className="px-4 py-3 text-brand-text">{teamById[a.advisorId]?.name ?? a.advisorId}</td>
                  <td className="max-w-[280px] px-4 py-3">
                    <span className="line-clamp-2 font-medium text-brand-text">{a.propertyTitle}</span>
                    <span className="mt-1 block truncate text-xs text-brand-muted">{a.catalogPropertyId}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-text">{a.guestName}</div>
                    <a href={`mailto:${encodeURIComponent(a.guestEmail)}`} className="text-xs text-brand-accent hover:underline">
                      {a.guestEmail}
                    </a>
                    {a.guestPhone.trim() ? <div className="text-xs text-brand-muted">{a.guestPhone}</div> : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-brand-muted">
                    {a.reminderSentAt ? `Enviado ${fmt(new Date(a.reminderSentAt).toISOString(), tz)}` : "Pendiente"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs leading-relaxed text-brand-muted">
        Los recordatorios al asesor se envían por correo unas ~24 h antes de cada cita si configuraste{" "}
        <code className="rounded bg-brand-surface px-1">CRON_SECRET</code>, cron en Vercel y correo del asesor en Equipo.
      </p>
    </div>
  );
}
