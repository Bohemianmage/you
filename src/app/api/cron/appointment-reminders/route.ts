import { NextResponse } from "next/server";

import { sendAdvisorReminderEmail } from "@/lib/appointments/email";
import { effectiveStatus, listAppointmentsInRange, markReminderSent } from "@/lib/appointments/store";
import { mergeTeamFromFile } from "@/lib/site-content/merge-public";
import { getCachedSiteContent } from "@/lib/site-settings/load";

/**
 * Cron (ej. Vercel): cada hora envía recordatorio por correo al asesor ~24 h antes de la cita.
 * Configura `CRON_SECRET` y Authorization: Bearer <secret>, o deja sin secret solo en desarrollo local.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = req.headers.get("authorization") ?? "";
  if (process.env.NODE_ENV === "production" && !secret) {
    return NextResponse.json({ ok: false as const, error: "cron_secret_missing" }, { status: 503 });
  }
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false as const, error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const from = now + 23 * 3600_000;
  const to = now + 25 * 3600_000;

  const upcoming = await listAppointmentsInRange(from, to);
  const file = await getCachedSiteContent();
  const team = mergeTeamFromFile(file);

  let remindersSent = 0;
  for (const appt of upcoming) {
    if (effectiveStatus(appt) !== "confirmed") continue;
    if (appt.reminderSentAt) continue;

    const start = Date.parse(appt.startIso);
    if (!Number.isFinite(start)) continue;

    const delta = start - now;
    if (delta < 22.5 * 3600_000 || delta > 25.5 * 3600_000) continue;

    const email = team.find((m) => m.id === appt.advisorId)?.email?.trim();
    if (!email) continue;

    const mailed = await sendAdvisorReminderEmail(email, appt);
    if (mailed) {
      await markReminderSent(appt.id);
      remindersSent += 1;
    }
  }

  return NextResponse.json({
    ok: true as const,
    scanned: upcoming.length,
    remindersSent,
  });
}
