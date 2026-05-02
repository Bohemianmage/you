import { NextResponse } from "next/server";
import { z } from "zod";

import { catalogPropertySegment, findCatalogPropertyBySegment } from "@/lib/property-routes";
import { UNASSIGNED_ADVISOR_ID } from "@/lib/appointments/constants";
import { bookingSlotMinutes } from "@/lib/appointments/config";
import { getPublicBookingSlotStartsForAdvisor, getPublicBookingSlotStartsUnionTeam } from "@/lib/appointments/public-offering";
import { bookingDocsEncryptionConfigured } from "@/lib/appointments/doc-vault";
import { saveEncryptedBookingDocs } from "@/lib/appointments/docs-store";
import {
  notifyPendingVisitRecipients,
  sendAdvisorPendingVisitRequest,
  sendGuestVisitRequestReceived,
} from "@/lib/appointments/email";
import { resolveAdvisorForCatalogProperty } from "@/lib/appointments/resolve-advisor";
import { createAppointment, rejectAndDeleteAppointment } from "@/lib/appointments/store";
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
  docIne: z.boolean(),
  docProofAddress: z.boolean(),
  docProofIncome: z.boolean(),
  docNotes: z.string().max(4000).optional().default(""),
  acceptTerms: z.literal(true),
});

export async function POST(req: Request) {
  if (!bookingDocsEncryptionConfigured()) {
    return NextResponse.json({ ok: false as const, code: "docs_encryption_off" }, { status: 503 });
  }

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

  const {
    catalogId,
    segment,
    startIso,
    guestName,
    guestEmail,
    guestPhone,
    locale,
    docIne,
    docProofAddress,
    docProofIncome,
    docNotes,
  } = parsed.data;

  if (!docIne && !docProofAddress && !docProofIncome) {
    return NextResponse.json({ ok: false as const, code: "docs_required" }, { status: 400 });
  }

  const file = await getCachedSiteContent();
  const resolved = resolveAdvisorForCatalogProperty(file, catalogId);

  const catalog = await getCachedEasyBrokerCatalog(locale as Locale);
  const prop = findCatalogPropertyBySegment(catalog, segment);
  if (!prop || prop.id !== catalogId || prop.active === false) {
    return NextResponse.json({ ok: false as const, code: "unknown_property" }, { status: 404 });
  }

  const startMs = Date.parse(startIso);
  if (!Number.isFinite(startMs)) {
    return NextResponse.json({ ok: false as const, code: "bad_slot" }, { status: 400 });
  }

  let advisorId: string;
  let slotStarts: Date[];

  if (resolved.ok) {
    advisorId = resolved.advisor.id;
    slotStarts = await getPublicBookingSlotStartsForAdvisor(resolved.advisor.id, file);
  } else {
    advisorId = UNASSIGNED_ADVISOR_ID;
    slotStarts = await getPublicBookingSlotStartsUnionTeam(file);
  }

  const allowed = slotStarts.some((d) => d.getTime() === startMs);
  if (!allowed) {
    return NextResponse.json({ ok: false as const, code: "slot_unavailable" }, { status: 409 });
  }

  const slotMin = bookingSlotMinutes();
  const end = new Date(startMs + slotMin * 60_000);
  const id = crypto.randomUUID();

  const appt: StoredAppointment = {
    id,
    advisorId,
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
    status: "pending",
  };

  const bookResult = await createAppointment(appt);
  if (!bookResult.ok) {
    const status = bookResult.code === "redis_off" ? 503 : 409;
    return NextResponse.json({ ok: false as const, code: bookResult.code }, { status });
  }

  const docsPayload = {
    v: 1 as const,
    docIne,
    docProofAddress,
    docProofIncome,
    docNotes: docNotes.trim().slice(0, 4000),
    submittedAt: Date.now(),
  };

  try {
    await saveEncryptedBookingDocs(id, docsPayload);
  } catch (e) {
    console.error("[appointments] encrypted docs save failed:", e);
    await rejectAndDeleteAppointment(id);
    return NextResponse.json({ ok: false as const, code: "docs_store_failed" }, { status: 500 });
  }

  if (resolved.ok) {
    await sendAdvisorPendingVisitRequest(resolved.advisor.email!.trim(), appt);
  } else {
    await notifyPendingVisitRecipients(appt, file);
  }
  await sendGuestVisitRequestReceived(guestEmail.trim(), appt);

  return NextResponse.json({ ok: true as const, id });
}
