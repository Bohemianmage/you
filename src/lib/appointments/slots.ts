import "server-only";

import { BOOKING_TIMEZONE, bookingDaysAhead, bookingDayEndHour, bookingDayStartHour, bookingMinLeadHours, bookingSlotMinutes } from "./config";

export function zonedYMD(d: Date, tz: string): { y: number; m: number; d: number } {
  const s = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const [y, m, day] = s.split("-").map(Number);
  return { y: y!, m: m!, d: day! };
}

export function addCalendarDays(y: number, m: number, d: number, delta: number): { y: number; m: number; d: number } {
  const x = new Date(Date.UTC(y, m - 1, d + delta));
  return { y: x.getUTCFullYear(), m: x.getUTCMonth() + 1, d: x.getUTCDate() };
}

/** Hora civil en CDMX (UTC−6) como instante UTC. */
export function wallCdmxToUtcDate(y: number, mo: number, d: number, hh: number, mm: number): Date {
  return new Date(Date.UTC(y, mo - 1, d, hh + 6, mm, 0, 0));
}

function weekdayMon0ToFri4(d: Date, tz: string): number | null {
  const w = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(d);
  const map: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4 };
  return map[w] ?? null;
}

export type BusyInterval = { startMs: number; endMs: number };

export function intervalsOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function generateCandidateSlots(now: Date, overrides?: Partial<{ daysAhead: number }>): Date[] {
  const tz = BOOKING_TIMEZONE;
  const slotMinutes = bookingSlotMinutes();
  const dayStartHour = bookingDayStartHour();
  const dayEndHour = bookingDayEndHour();
  const daysAhead = overrides?.daysAhead ?? bookingDaysAhead();
  const minLeadMs = bookingMinLeadHours() * 3600_000;

  const out: Date[] = [];
  const { y: y0, m: m0, d: d0 } = zonedYMD(now, tz);
  const durationMs = slotMinutes * 60_000;
  const earliest = now.getTime() + minLeadMs;

  for (let i = 0; i < daysAhead; i++) {
    const { y, m, d } = addCalendarDays(y0, m0, d0, i);
    const noon = wallCdmxToUtcDate(y, m, d, 12, 0);
    if (weekdayMon0ToFri4(noon, tz) === null) continue;

    const closeInstant = wallCdmxToUtcDate(y, m, d, dayEndHour, 0).getTime();
    let cur = wallCdmxToUtcDate(y, m, d, dayStartHour, 0);
    while (true) {
      const slotEnd = cur.getTime() + durationMs;
      if (slotEnd > closeInstant) break;
      if (cur.getTime() >= earliest) out.push(new Date(cur));
      cur = new Date(cur.getTime() + durationMs);
    }
  }
  return out;
}

export function filterSlotsByBusy(slots: readonly Date[], busy: readonly BusyInterval[], slotDurationMs: number): Date[] {
  return slots.filter((s) => {
    const startMs = s.getTime();
    const endMs = startMs + slotDurationMs;
    return !busy.some((b) => intervalsOverlap(startMs, endMs, b.startMs, b.endMs));
  });
}
