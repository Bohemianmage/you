import "server-only";

import { Resend } from "resend";

import type { Locale } from "@/i18n/types";

import type { StoredAppointment } from "./types";

function fromEmail(): string {
  return process.env.RESEND_FROM_EMAIL ?? "YOU Sitio <onboarding@resend.dev>";
}

export async function sendAdvisorBookingEmail(advisorEmail: string, appt: StoredAppointment): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[appointments] RESEND_API_KEY missing — advisor mail skipped.");
    return false;
  }
  const when = formatWhen(appt.startIso, appt.locale);
  const body = [
    "Nueva cita agendada desde el sitio YOU.",
    "",
    `Propiedad: ${appt.propertyTitle}`,
    `ID catálogo: ${appt.catalogPropertyId}`,
    `Segmento URL: ${appt.propertySegment}`,
    "",
    `Inicio: ${when} (${appt.startIso})`,
    `Fin: ${appt.endIso}`,
    "",
    `Cliente: ${appt.guestName}`,
    `Email cliente: ${appt.guestEmail}`,
    appt.guestPhone.trim() ? `Teléfono: ${appt.guestPhone}` : null,
    "",
    `Idioma sitio: ${appt.locale}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail(),
      to: [advisorEmail],
      replyTo: appt.guestEmail,
      subject: `[YOU] Nueva visita — ${appt.propertyTitle}`,
      text: body,
    });
    if (error) {
      console.error("[appointments] Resend advisor:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[appointments] advisor email", e);
    return false;
  }
}

export async function sendGuestBookingConfirmation(guestEmail: string, appt: StoredAppointment): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const linesEs = [
    `Hola ${appt.guestName},`,
    "",
    `Confirmamos tu cita para ver: ${appt.propertyTitle}.`,
    `Fecha y hora: ${formatWhen(appt.startIso, "es")}`,
    "",
    "Un asesor YOU te contactará si necesita algún detalle adicional.",
    "",
    "Saludos,",
    "YOU",
  ];
  const linesEn = [
    `Hi ${appt.guestName},`,
    "",
    `Your visit is confirmed for: ${appt.propertyTitle}.`,
    `Date & time: ${formatWhen(appt.startIso, "en")}`,
    "",
    "A YOU advisor may reach out if anything else is needed.",
    "",
    "Best,",
    "YOU",
  ];
  const text = appt.locale === "en" ? linesEn.join("\n") : linesEs.join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail(),
      to: [guestEmail],
      subject: appt.locale === "en" ? `[YOU] Visit confirmed` : `[YOU] Cita confirmada`,
      text,
    });
    if (error) {
      console.error("[appointments] Resend guest:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[appointments] guest email", e);
    return false;
  }
}

export async function sendAdvisorReminderEmail(advisorEmail: string, appt: StoredAppointment): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;
  const when = formatWhen(appt.startIso, appt.locale);
  const body = [
    "Recordatorio: tienes una visita agendada mañana (aprox. en 24 h desde este aviso).",
    "",
    `Propiedad: ${appt.propertyTitle}`,
    `Cliente: ${appt.guestName}`,
    `Email: ${appt.guestEmail}`,
    appt.guestPhone.trim() ? `Teléfono: ${appt.guestPhone}` : null,
    "",
    `Hora: ${when}`,
    "",
    `Segmento: ${appt.propertySegment}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail(),
      to: [advisorEmail],
      replyTo: appt.guestEmail,
      subject: `[YOU] Recordatorio de visita — ${appt.propertyTitle}`,
      text: body,
    });
    if (error) {
      console.error("[appointments] Resend reminder:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[appointments] reminder email", e);
    return false;
  }
}

function formatWhen(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", {
    timeZone: "America/Mexico_City",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
