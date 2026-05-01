import "server-only";

import { bookingSlotMinutes } from "./config";
import { filterSlotsByBusy, generateCandidateSlots, type BusyInterval } from "./slots";
import { listAdvisorAppointmentsBetween } from "./store";

export async function getAvailableSlotStartsForAdvisor(advisorId: string, now = new Date()): Promise<Date[]> {
  const slotMs = bookingSlotMinutes() * 60_000;
  const candidates = generateCandidateSlots(now);
  const horizonMs = now.getTime() + 86400000 * 62;
  const busyRows = await listAdvisorAppointmentsBetween(advisorId, now.getTime() - slotMs, horizonMs);
  const busy: BusyInterval[] = busyRows.map((a) => ({
    startMs: Date.parse(a.startIso),
    endMs: Date.parse(a.endIso),
  })).filter((b) => Number.isFinite(b.startMs) && Number.isFinite(b.endMs));
  return filterSlotsByBusy(candidates, busy, slotMs);
}

export function isSlotStartAvailable(slotStart: Date, busy: readonly BusyInterval[], slotDurationMs: number): boolean {
  const startMs = slotStart.getTime();
  const endMs = startMs + slotDurationMs;
  return !busy.some((b) => startMs < b.endMs && b.startMs < endMs);
}
