import { NextResponse } from "next/server";
import { z } from "zod";

import { recordAnalyticsEvent } from "@/lib/analytics/record";

const bodySchema = z.object({
  type: z.enum(["pageview", "property_view", "heatmap"]),
  path: z.string().optional(),
  propertyId: z.string().optional(),
  x: z.number().min(0).max(1).optional(),
  y: z.number().min(0).max(1).optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const country = req.headers.get("x-vercel-ip-country");

  await recordAnalyticsEvent({
    ...parsed.data,
    country,
  });

  return NextResponse.json({ ok: true });
}
