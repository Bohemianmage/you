import { NextResponse } from "next/server";

import { getIsAdmin } from "@/lib/admin/is-admin";
import { effectiveStatus, getAppointmentById, rejectAndDeleteAppointment } from "@/lib/appointments/store";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getIsAdmin())) {
    return NextResponse.json({ ok: false as const, error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const trimmed = id?.trim();
  if (!trimmed) return NextResponse.json({ ok: false as const, error: "bad_id" }, { status: 400 });

  const appt = await getAppointmentById(trimmed);
  if (!appt || effectiveStatus(appt) !== "pending") {
    return NextResponse.json({ ok: false as const, error: "not_pending" }, { status: 409 });
  }

  const ok = await rejectAndDeleteAppointment(trimmed);
  if (!ok) return NextResponse.json({ ok: false as const, error: "reject_failed" }, { status: 500 });

  return NextResponse.json({ ok: true as const });
}
