import type { Locale } from "@/i18n/types";

/** `pending`: solicitud sujeta a confirmación manual del asesor. `confirmed`: cita firme. `rejected`: eliminada del calendario. */
export type AppointmentStatus = "pending" | "confirmed" | "rejected";

export type StoredAppointment = {
  id: string;
  advisorId: string;
  catalogPropertyId: string;
  propertySegment: string;
  propertyTitle: string;
  startIso: string;
  endIso: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  locale: Locale;
  createdAt: number;
  reminderSentAt?: number;
  /** Ausente en registros antiguos → se trata como confirmada. */
  status?: AppointmentStatus;
  confirmedAt?: number;
};

export function resolvedAppointmentStatus(a: StoredAppointment): AppointmentStatus {
  return a.status ?? "confirmed";
}

