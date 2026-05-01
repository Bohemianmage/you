import { NextResponse } from "next/server";

import { getIsAdmin } from "@/lib/admin/is-admin";
import { decryptBookingDocsPayload } from "@/lib/appointments/doc-vault";
import { getEncryptedBookingDocsBlob } from "@/lib/appointments/docs-store";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getIsAdmin())) {
    return NextResponse.json({ ok: false as const, error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const trimmed = id?.trim();
  if (!trimmed) return NextResponse.json({ ok: false as const, error: "bad_id" }, { status: 400 });

  const blob = await getEncryptedBookingDocsBlob(trimmed);
  if (!blob) {
    return NextResponse.json({ ok: true as const, payload: null });
  }

  try {
    const json = decryptBookingDocsPayload(blob);
    const payload = JSON.parse(json) as unknown;
    return NextResponse.json({ ok: true as const, payload });
  } catch {
    return NextResponse.json({ ok: false as const, error: "decrypt_failed" }, { status: 500 });
  }
}
