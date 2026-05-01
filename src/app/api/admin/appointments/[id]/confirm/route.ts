import { NextResponse } from "next/server";

import { getIsAdmin } from "@/lib/admin/is-admin";
import { sendGuestBookingConfirmation } from "@/lib/appointments/email";
import { confirmAppointment, effectiveStatus, getAppointmentById } from "@/lib/appointments/store";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
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

  const confirmed = await confirmAppointment(trimmed);
  if (!confirmed) return NextResponse.json({ ok: false as const, error: "confirm_failed" }, { status: 500 });

  await sendGuestBookingConfirmation(confirmed.guestEmail.trim(), confirmed);

  return NextResponse.json({ ok: true as const });
}
