import { NextResponse } from "next/server";

import { getIsAdmin } from "@/lib/admin/is-admin";
import { UNASSIGNED_ADVISOR_ID } from "@/lib/appointments/constants";
import { sendGuestBookingConfirmation } from "@/lib/appointments/email";
import { confirmAppointment, effectiveStatus, getAppointmentById } from "@/lib/appointments/store";
import { mergeTeamFromFile } from "@/lib/site-content/merge-public";
import { getCachedSiteContent } from "@/lib/site-settings/load";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getIsAdmin())) {
    return NextResponse.json({ ok: false as const, error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const trimmed = id?.trim();
  if (!trimmed) return NextResponse.json({ ok: false as const, error: "bad_id" }, { status: 400 });

  const before = await getAppointmentById(trimmed);
  if (!before || effectiveStatus(before) !== "pending") {
    return NextResponse.json({ ok: false as const, error: "not_pending" }, { status: 409 });
  }

  let bodyAdvisorId: string | undefined;
  try {
    const raw = await req.json();
    if (raw && typeof raw === "object" && typeof (raw as { advisorId?: unknown }).advisorId === "string") {
      const t = (raw as { advisorId: string }).advisorId.trim();
      if (t) bodyAdvisorId = t;
    }
  } catch {
    /* empty body ok */
  }

  let assignAdvisorId: string | undefined;
  if (before.advisorId === UNASSIGNED_ADVISOR_ID) {
    if (!bodyAdvisorId || bodyAdvisorId === UNASSIGNED_ADVISOR_ID) {
      return NextResponse.json({ ok: false as const, error: "advisor_required" }, { status: 400 });
    }
    const file = await getCachedSiteContent();
    const member = mergeTeamFromFile(file).find((m) => m.id === bodyAdvisorId);
    if (!member?.email?.trim()) {
      return NextResponse.json({ ok: false as const, error: "invalid_advisor" }, { status: 400 });
    }
    assignAdvisorId = bodyAdvisorId;
  }

  const confirmed = await confirmAppointment(trimmed, assignAdvisorId);
  if (!confirmed) {
    const status = before.advisorId === UNASSIGNED_ADVISOR_ID ? 409 : 500;
    const err = before.advisorId === UNASSIGNED_ADVISOR_ID ? ("slot_conflict" as const) : ("confirm_failed" as const);
    return NextResponse.json({ ok: false as const, error: err }, { status });
  }

  await sendGuestBookingConfirmation(confirmed.guestEmail.trim(), confirmed);

  return NextResponse.json({ ok: true as const });
}
