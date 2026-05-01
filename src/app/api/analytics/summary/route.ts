import { NextResponse } from "next/server";

import { getIsAdmin } from "@/lib/admin/is-admin";
import { readAnalyticsSummary } from "@/lib/analytics/record";

export async function GET() {
  if (!(await getIsAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const summary = await readAnalyticsSummary();
  return NextResponse.json(summary);
}
