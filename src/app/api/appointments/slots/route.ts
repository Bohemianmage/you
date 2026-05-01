import { NextResponse } from "next/server";

import { findCatalogPropertyBySegment } from "@/lib/property-routes";
import { appointmentsRedisConfigured } from "@/lib/appointments/store";
import { getAvailableSlotStartsForAdvisor } from "@/lib/appointments/availability";
import { resolveAdvisorForCatalogProperty } from "@/lib/appointments/resolve-advisor";
import { getCachedSiteContent } from "@/lib/site-settings/load";
import { getCachedEasyBrokerCatalog } from "@/lib/easybroker/catalog-cache";
import type { Locale } from "@/i18n/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const catalogId = url.searchParams.get("catalogId")?.trim() ?? "";
  const segment = url.searchParams.get("segment")?.trim() ?? "";
  const localeRaw = url.searchParams.get("locale")?.trim().toLowerCase();
  const locale: Locale = localeRaw === "en" ? "en" : "es";

  if (!catalogId || !segment) {
    return NextResponse.json({ ok: false as const, code: "bad_request" }, { status: 400 });
  }

  if (!appointmentsRedisConfigured()) {
    return NextResponse.json({ ok: false as const, code: "redis_off" });
  }

  const file = await getCachedSiteContent();
  const resolved = resolveAdvisorForCatalogProperty(file, catalogId);
  if (!resolved.ok) {
    return NextResponse.json({ ok: false as const, code: resolved.code });
  }

  const catalog = await getCachedEasyBrokerCatalog(locale);
  const prop = findCatalogPropertyBySegment(catalog, segment);
  if (!prop || prop.id !== catalogId || prop.active === false) {
    return NextResponse.json({ ok: false as const, code: "unknown_property" }, { status: 404 });
  }

  const slots = await getAvailableSlotStartsForAdvisor(resolved.advisor.id, file);

  return NextResponse.json({
    ok: true as const,
    slotsIso: slots.map((d) => d.toISOString()),
    timezone: "America/Mexico_City",
    advisorName: resolved.advisor.name,
  });
}
