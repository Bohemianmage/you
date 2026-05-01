import "server-only";

import { Resend } from "resend";

import type { Locale } from "@/i18n/types";

import { publicSiteBaseUrl } from "@/lib/public-site-url";

import type { StoredAppointment } from "./types";

function fromEmail(): string {
  return process.env.RESEND_FROM_EMAIL ?? "YOU Sitio <onboarding@resend.dev>";
}

/** Solicitud pendiente de tu confirmación en panel admin. */
export async function sendAdvisorPendingVisitRequest(advisorEmail: string, appt: StoredAppointment): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[appointments] RESEND_API_KEY missing — advisor mail skipped.");
    return false;
  }
  const when = formatWhen(appt.startIso, appt.locale);
  const adminCal = `${publicSiteBaseUrl()}/admin/calendario`;
  const body = [
    "Nueva solicitud de visita desde el sitio YOU — pendiente de tu confirmación.",
    "Confírmala o recházala en el calendario admin; hasta entonces el cliente solo recibió aviso de solicitud recibida.",
    "",
    `Panel: ${adminCal}`,
    "",
    `Propiedad: ${appt.propertyTitle}`,
    `ID catálogo: ${appt.catalogPropertyId}`,
    `Segmento URL: ${appt.propertySegment}`,
    "",
    `Horario solicitado: ${when} (${appt.startIso})`,
    `Fin (bloque): ${appt.endIso}`,
    "",
    `Cliente: ${appt.guestName}`,
    `Email cliente: ${appt.guestEmail}`,
    appt.guestPhone.trim() ? `Teléfono: ${appt.guestPhone}` : null,
    "",
    `Idioma sitio: ${appt.locale}`,
    "",
    "La documentación declarada por el cliente queda almacenada cifrada (30 días); revísala desde el panel cuando corresponda.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail(),
      to: [advisorEmail],
      replyTo: appt.guestEmail,
      subject: `[YOU] Confirmar visita (pendiente) — ${appt.propertyTitle}`,
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

export async function sendGuestVisitRequestReceived(guestEmail: string, appt: StoredAppointment): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const when = formatWhen(appt.startIso, appt.locale);
  const linesEs = [
    `Hola ${appt.guestName},`,
    "",
    "Recibimos tu solicitud de visita. Un asesor YOU debe confirmarla manualmente; recibirás otro correo cuando esté confirmada.",
    "",
    `Propiedad: ${appt.propertyTitle}`,
    `Fecha y hora solicitadas: ${when}`,
    "",
    "Si necesitamos algo más, te contactaremos por este correo o por teléfono.",
    "",
    "Saludos,",
    "YOU Soluciones Inmobiliarias",
  ];
  const linesEn = [
    `Hi ${appt.guestName},`,
    "",
    "We received your visit request. A YOU advisor still needs to confirm it manually — you’ll get another email once it’s confirmed.",
    "",
    `Property: ${appt.propertyTitle}`,
    `Requested date & time: ${when}`,
    "",
    "If we need anything else, we’ll reach out by email or phone.",
    "",
    "Best,",
    "YOU Soluciones Inmobiliarias",
  ];
  const text = appt.locale === "en" ? linesEn.join("\n") : linesEs.join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail(),
      to: [guestEmail],
      subject: appt.locale === "en" ? `[YOU] Visit request received` : `[YOU] Solicitud de visita recibida`,
      text,
    });
    if (error) {
      console.error("[appointments] Resend guest pending:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[appointments] guest pending email", e);
    return false;
  }
}

export async function sendGuestBookingConfirmation(guestEmail: string, appt: StoredAppointment): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const linesEs = [
    `Hola ${appt.guestName},`,
    "",
    `Tu visita quedó confirmada.`,
    "",
    `Propiedad: ${appt.propertyTitle}`,
    `Fecha y hora: ${formatWhen(appt.startIso, "es")}`,
    "",
    "Detalles prácticos (punto de encuentro, acceso, documentación final): te los comunicará tu asesor si aplica.",
    "",
    "Lleva la documentación que declaraste al solicitar la cita (identificación y demás según corresponda).",
    "",
    "Si necesitas reprogramar, responde a este correo o escribe a tu asesor.",
    "",
    "Saludos,",
    "YOU Soluciones Inmobiliarias",
  ];
  const linesEn = [
    `Hi ${appt.guestName},`,
    "",
    `Your visit is confirmed.`,
    "",
    `Property: ${appt.propertyTitle}`,
    `Date & time: ${formatWhen(appt.startIso, "en")}`,
    "",
    "Practical details (meeting point, access, final paperwork): your advisor will share these if needed.",
    "",
    "Please bring the documentation you declared when requesting the visit.",
    "",
    "To reschedule, reply to this email or contact your advisor.",
    "",
    "Best,",
    "YOU Soluciones Inmobiliarias",
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
