import "server-only";

/** CDMX sin DST desde 2022 — slots y etiquetas en esta zona. */
export const BOOKING_TIMEZONE = "America/Mexico_City";

export function bookingSlotMinutes(): number {
  const n = Number(process.env.BOOKING_SLOT_MINUTES ?? "60");
  return Number.isFinite(n) && n >= 15 && n <= 120 ? Math.floor(n) : 60;
}

export function bookingDayStartHour(): number {
  const n = Number(process.env.BOOKING_DAY_START_HOUR ?? "9");
  return Number.isFinite(n) && n >= 6 && n <= 22 ? Math.floor(n) : 9;
}

export function bookingDayEndHour(): number {
  const n = Number(process.env.BOOKING_DAY_END_HOUR ?? "17");
  return Number.isFinite(n) && n >= 8 && n <= 23 ? Math.floor(n) : 17;
}

export function bookingDaysAhead(): number {
  const n = Number(process.env.BOOKING_DAYS_AHEAD ?? "21");
  return Number.isFinite(n) && n >= 1 && n <= 60 ? Math.floor(n) : 21;
}

/** Anticipación mínima para agendar (horas). */
export function bookingMinLeadHours(): number {
  const n = Number(process.env.BOOKING_MIN_LEAD_HOURS ?? "2");
  return Number.isFinite(n) && n >= 0 && n <= 72 ? n : 2;
}
