"use server";

import { Resend } from "resend";

export type ContactState = {
  ok: boolean;
  error?: "validation" | "no_config" | "send_failed";
};

function getText(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const honeypot = getText(formData, "company");
  if (honeypot) {
    return { ok: true };
  }

  const name = getText(formData, "name");
  const email = getText(formData, "email");
  const phone = getText(formData, "phone");
  const topic = getText(formData, "topic");
  const message = getText(formData, "message");
  const downloadableId = getText(formData, "downloadableId");

  if (!name || !email || !message) {
    return { ok: false, error: "validation" };
  }

  const to = process.env.CONTACT_TO_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "YOU Sitio <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.warn("[contact] Missing RESEND_API_KEY or CONTACT_TO_EMAIL — message not sent.");
    return { ok: false, error: "no_config" };
  }

  const body = [
    `Nombre: ${name}`,
    `Email: ${email}`,
    phone ? `Teléfono: ${phone}` : null,
    topic ? `Asunto: ${topic}` : null,
    downloadableId ? `Material solicitado (id): ${downloadableId}` : null,
    "",
    message,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject: topic ? `[YOU] ${topic} — ${name}` : `[YOU] Contacto — ${name}`,
      text: body,
    });
    if (error) {
      console.error("[contact] Resend error:", error);
      return { ok: false, error: "send_failed" };
    }
    return { ok: true };
  } catch (e) {
    console.error("[contact]", e);
    return { ok: false, error: "send_failed" };
  }
}
