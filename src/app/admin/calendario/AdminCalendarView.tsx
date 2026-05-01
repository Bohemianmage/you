"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { UNASSIGNED_ADVISOR_ID } from "@/lib/appointments/constants";
import type { StoredAppointment } from "@/lib/appointments/types";
import { resolvedAppointmentStatus } from "@/lib/appointments/types";
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

function statusLabel(s: ReturnType<typeof resolvedAppointmentStatus>): string {
  switch (s) {
    case "pending":
      return "Pendiente confirmación";
    case "confirmed":
      return "Confirmada";
    case "rejected":
      return "Rechazada";
    default:
      return s;
  }
}

export function AdminCalendarView({
  appointments,
  teamById,
  assignableTeam,
  redisConfigured,
}: {
  appointments: StoredAppointment[];
  teamById: Record<string, TeamMember | undefined>;
  assignableTeam: TeamMember[];
  redisConfigured: boolean;
}) {
  const router = useRouter();
  const [advisorFilter, setAdvisorFilter] = useState<string>("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [docJson, setDocJson] = useState<string | null>(null);
  const [assignPickByAppt, setAssignPickByAppt] = useState<Record<string, string>>({});

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

  function advisorCellLabel(advisorId: string): string {
    if (advisorId === UNASSIGNED_ADVISOR_ID) return "Por asignar";
    return teamById[advisorId]?.name ?? advisorId;
  }

  async function confirmVisit(id: string, payload?: { advisorId: string }) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/appointments/${encodeURIComponent(id)}/confirm`, {
        method: "POST",
        headers: payload ? { "Content-Type": "application/json" } : undefined,
        body: payload ? JSON.stringify(payload) : undefined,
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        if (data.error === "advisor_required") alert("Elegí un asesor del equipo antes de confirmar.");
        else if (data.error === "invalid_advisor") alert("Ese asesor no tiene correo en Equipo; revisá la configuración.");
        else if (data.error === "slot_conflict") alert("Ese asesor ya tiene cita en ese horario. Elegí otro miembro u otro momento.");
        else alert("No se pudo confirmar (¿ya estaba confirmada?).");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function rejectVisit(id: string) {
    if (!confirm("¿Rechazar esta solicitud y liberar el horario?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/appointments/${encodeURIComponent(id)}/reject`, { method: "POST" });
      if (!res.ok) {
        alert("No se pudo rechazar.");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function loadDocs(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/appointments/${encodeURIComponent(id)}/documents`);
      const data = (await res.json()) as { ok?: boolean; payload?: unknown; error?: string };
      if (!res.ok || !data.ok) {
        setDocJson(JSON.stringify({ error: data.error ?? "fetch_failed" }, null, 2));
        return;
      }
      setDocJson(JSON.stringify(data.payload ?? null, null, 2));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      {!redisConfigured ? (
        <p className="rounded-sm border border-brand-accent/40 bg-brand-accent/10 px-4 py-3 text-sm text-brand-accent-strong">
          Redis no está configurado: las citas no se guardarán. Añade{" "}
          <code className="rounded bg-brand-bg px-1">UPSTASH_REDIS_REST_URL</code> y{" "}
          <code className="rounded bg-brand-bg px-1">UPSTASH_REDIS_REST_TOKEN</code>.
        </p>
      ) : null}

      {docJson ? (
        <div className="rounded-sm border border-brand-border bg-brand-bg p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">Documentación declarada (descifrada)</p>
            <button type="button" className="text-xs font-semibold text-brand-accent hover:underline" onClick={() => setDocJson(null)}>
              Cerrar
            </button>
          </div>
          <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-sm bg-brand-surface/50 p-3 text-xs text-brand-text">{docJson}</pre>
        </div>
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
                {advisorCellLabel(id)}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-brand-muted">
          {filtered.length} registro{filtered.length === 1 ? "" : "s"} · Horarios en {tz}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-brand-muted">No hay citas en este rango.</p>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-brand-border">
          <table className="min-w-full divide-y divide-brand-border text-sm">
            <thead className="bg-brand-surface/80">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Estado</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Inicio</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Asesor</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Propiedad</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Cliente</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Acciones</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Recordatorio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border bg-brand-bg">
              {filtered.map((a) => {
                const st = resolvedAppointmentStatus(a);
                const pending = st === "pending";
                return (
                  <tr key={a.id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ring-1 ${
                          pending
                            ? "bg-brand-you/10 text-brand-you ring-brand-you/20"
                            : st === "confirmed"
                              ? "bg-brand-accent/12 text-brand-accent-strong ring-brand-accent/25"
                              : "bg-brand-border/50 text-brand-muted ring-brand-border/60"
                        }`}
                      >
                        {statusLabel(st)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-text">{fmt(a.startIso, tz)}</td>
                    <td className="px-4 py-3 text-brand-text">{advisorCellLabel(a.advisorId)}</td>
                    <td className="max-w-[220px] px-4 py-3">
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
                    <td className="min-w-[140px] px-4 py-3">
                      <div className="flex flex-col gap-2">
                        {pending ? (
                          <>
                            {a.advisorId === UNASSIGNED_ADVISOR_ID ? (
                              <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-brand-muted">
                                Asignar a
                                <select
                                  value={assignPickByAppt[a.id] ?? ""}
                                  onChange={(e) =>
                                    setAssignPickByAppt((prev) => ({ ...prev, [a.id]: e.target.value }))
                                  }
                                  className="mt-1 block w-full max-w-[200px] rounded-sm border border-brand-border bg-brand-bg px-2 py-1.5 text-xs text-brand-text outline-none focus:border-brand-accent"
                                >
                                  <option value="">— Equipo —</option>
                                  {assignableTeam.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.name}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            ) : null}
                            <button
                              type="button"
                              disabled={
                                busyId === a.id ||
                                (a.advisorId === UNASSIGNED_ADVISOR_ID && !(assignPickByAppt[a.id]?.trim()))
                              }
                              className="rounded-sm bg-brand-accent px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-white disabled:opacity-40"
                              onClick={() => {
                                if (a.advisorId === UNASSIGNED_ADVISOR_ID) {
                                  const aid = assignPickByAppt[a.id]?.trim();
                                  if (!aid) return;
                                  void confirmVisit(a.id, { advisorId: aid });
                                } else {
                                  void confirmVisit(a.id);
                                }
                              }}
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              disabled={busyId === a.id}
                              className="rounded-sm border border-brand-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-muted hover:border-brand-accent"
                              onClick={() => void rejectVisit(a.id)}
                            >
                              Rechazar
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-brand-muted">—</span>
                        )}
                        <button
                          type="button"
                          disabled={busyId === a.id}
                          className="text-left text-[10px] font-bold uppercase tracking-[0.1em] text-brand-accent hover:underline disabled:opacity-40"
                          onClick={() => void loadDocs(a.id)}
                        >
                          Ver docs.
                        </button>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-brand-muted">
                      {st !== "confirmed"
                        ? "—"
                        : a.reminderSentAt
                          ? `Enviado ${fmt(new Date(a.reminderSentAt).toISOString(), tz)}`
                          : "Pendiente"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs leading-relaxed text-brand-muted">
        Las solicitudes entran en estado pendiente hasta que confirmás o rechazás en esta tabla. Si figuran como «Por asignar», elegí un miembro del equipo con correo antes de confirmar; al confirmar, el cliente recibe el correo de cita confirmada. Los recordatorios ~24 h solo aplican a citas confirmadas (cron +{" "}
        <code className="rounded bg-brand-surface px-1">CRON_SECRET</code>).
      </p>
    </div>
  );
}
