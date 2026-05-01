import { NextResponse } from "next/server";
import { z } from "zod";

import { catalogPropertySegment, findCatalogPropertyBySegment } from "@/lib/property-routes";
import { bookingSlotMinutes } from "@/lib/appointments/config";
import { getAvailableSlotStartsForAdvisor } from "@/lib/appointments/availability";
import { sendAdvisorBookingEmail, sendGuestBookingConfirmation } from "@/lib/appointments/email";
import { resolveAdvisorForCatalogProperty } from "@/lib/appointments/resolve-advisor";
import { createAppointment } from "@/lib/appointments/store";
import type { StoredAppointment } from "@/lib/appointments/types";
import { getCachedEasyBrokerCatalog } from "@/lib/easybroker/catalog-cache";
import { getCachedSiteContent } from "@/lib/site-settings/load";
import type { Locale } from "@/i18n/types";

const bodySchema = z.object({
  catalogId: z.string().min(1),
  segment: z.string().min(1),
  startIso: z.string().min(1),
  guestName: z.string().min(1).max(200),
  guestEmail: z.string().email().max(320),
  guestPhone: z.string().max(80).optional().default(""),
  locale: z.enum(["es", "en"]).optional().default("es"),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false as const, code: "bad_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, code: "validation" }, { status: 400 });
  }

  const { catalogId, segment, startIso, guestName, guestEmail, guestPhone, locale } = parsed.data;
  const file = await getCachedSiteContent();
  const resolved = resolveAdvisorForCatalogProperty(file, catalogId);
  if (!resolved.ok) {
    return NextResponse.json({ ok: false as const, code: resolved.code }, { status: 400 });
  }

  const catalog = await getCachedEasyBrokerCatalog(locale as Locale);
  const prop = findCatalogPropertyBySegment(catalog, segment);
  if (!prop || prop.id !== catalogId || prop.active === false) {
    return NextResponse.json({ ok: false as const, code: "unknown_property" }, { status: 404 });
  }

  const startMs = Date.parse(startIso);
  if (!Number.isFinite(startMs)) {
    return NextResponse.json({ ok: false as const, code: "bad_slot" }, { status: 400 });
  }

  const slotStarts = await getAvailableSlotStartsForAdvisor(resolved.advisor.id);
  const allowed = slotStarts.some((d) => d.getTime() === startMs);
  if (!allowed) {
    return NextResponse.json({ ok: false as const, code: "slot_unavailable" }, { status: 409 });
  }

  const slotMin = bookingSlotMinutes();
  const end = new Date(startMs + slotMin * 60_000);
  const id = crypto.randomUUID();

  const appt: StoredAppointment = {
    id,
    advisorId: resolved.advisor.id,
    catalogPropertyId: catalogId,
    propertySegment: catalogPropertySegment(prop),
    propertyTitle: prop.title,
    startIso: new Date(startMs).toISOString(),
    endIso: end.toISOString(),
    guestName: guestName.trim(),
    guestEmail: guestEmail.trim(),
    guestPhone: guestPhone?.trim() ?? "",
    locale: locale as Locale,
    createdAt: Date.now(),
  };

  const bookResult = await createAppointment(appt);
  if (!bookResult.ok) {
    const status = bookResult.code === "redis_off" ? 503 : 409;
    return NextResponse.json({ ok: false as const, code: bookResult.code }, { status });
  }

  const advisorEmail = resolved.advisor.email!.trim();
  await Promise.all([
    sendAdvisorBookingEmail(advisorEmail, appt),
    sendGuestBookingConfirmation(guestEmail.trim(), appt),
  ]);

  return NextResponse.json({ ok: true as const, id });
}
