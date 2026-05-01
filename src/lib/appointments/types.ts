import type { Locale } from "@/i18n/types";

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
};
