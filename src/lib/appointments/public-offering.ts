import "server-only";

import type { SiteContentFile } from "@/lib/site-content/types";

import { getAvailableSlotStartsForAdvisor, getAvailableSlotStartsUnionTeam } from "./availability";
import { BOOKING_TIMEZONE } from "./config";
import { isWeekendInBookingTz } from "./slots";

/** Límite de días distintos mostrados en agenda pública (primeros N días con huecos). */
export function bookingPublicMaxDays(): number {
  const n = Number(process.env.BOOKING_PUBLIC_MAX_DAYS ?? "5");
  return Number.isFinite(n) && n >= 1 && n <= 14 ? Math.floor(n) : 5;
}

/** Si es true, la oferta pública solo lista Lun–Vie (horario hábil típico). */
export function bookingPublicWeekdaysOnly(): boolean {
  const v = process.env.BOOKING_PUBLIC_WEEKDAYS_ONLY?.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "no") return false;
  return true;
}

function dayKeyMexicoCity(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BOOKING_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Recorta slots para la UI de reserva: orden cronológico, opcionalmente solo días hábiles,
 * y como mucho `bookingPublicMaxDays()` fechas distintas con disponibilidad.
 */
export function narrowSlotsForPublicOffering(slots: readonly Date[]): Date[] {
  let arr = [...slots].sort((a, b) => a.getTime() - b.getTime());
  if (bookingPublicWeekdaysOnly()) {
    arr = arr.filter((d) => !isWeekendInBookingTz(d));
  }
  const maxDays = bookingPublicMaxDays();
  const allowedDayKeys = new Set<string>();
  const out: Date[] = [];

  for (const d of arr) {
    const key = dayKeyMexicoCity(d);
    if (!allowedDayKeys.has(key)) {
      if (allowedDayKeys.size >= maxDays) continue;
      allowedDayKeys.add(key);
    }
    out.push(d);
  }
  return out;
}

export async function getPublicBookingSlotStartsForAdvisor(
  advisorId: string,
  file: SiteContentFile,
  now = new Date(),
): Promise<Date[]> {
  const raw = await getAvailableSlotStartsForAdvisor(advisorId, file, now);
  return narrowSlotsForPublicOffering(raw);
}

export async function getPublicBookingSlotStartsUnionTeam(file: SiteContentFile, now = new Date()): Promise<Date[]> {
  const raw = await getAvailableSlotStartsUnionTeam(file, now);
  return narrowSlotsForPublicOffering(raw);
}
