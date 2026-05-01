import "server-only";

import { Redis } from "@upstash/redis";

import { deleteBookingDocs } from "./docs-store";
import { resolvedAppointmentStatus, type AppointmentStatus, type StoredAppointment } from "./types";

/** Credenciales REST en consola Upstash: Redis → tu base → pestaña REST / Connect (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`). */
const PREFIX = "you:apt";

function redis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function appointmentsRedisConfigured(): boolean {
  return redis() != null;
}

function dataKey(id: string): string {
  return `${PREFIX}:data:${id}`;
}

function advisorIndexKey(advisorId: string): string {
  return `${PREFIX}:advisor:${advisorId}`;
}

const GLOBAL_INDEX = `${PREFIX}:global`;

function lockKey(advisorId: string, startMs: number): string {
  return `${PREFIX}:lock:${advisorId}:${startMs}`;
}

function parseAppointment(raw: unknown): StoredAppointment | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as StoredAppointment;
  if (
    typeof o.id !== "string" ||
    typeof o.advisorId !== "string" ||
    typeof o.catalogPropertyId !== "string" ||
    typeof o.startIso !== "string" ||
    typeof o.endIso !== "string"
  ) {
    return null;
  }
  const status: AppointmentStatus =
    o.status === "pending" || o.status === "confirmed" || o.status === "rejected" ? o.status : "confirmed";
  return { ...o, status };
}

export async function getAppointmentById(id: string): Promise<StoredAppointment | null> {
  const r = redis();
  if (!r) return null;
  const raw = await r.get<string>(dataKey(id));
  if (!raw) return null;
  try {
    return parseAppointment(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function listAdvisorAppointmentsBetween(
  advisorId: string,
  minScore: number,
  maxScore: number,
): Promise<StoredAppointment[]> {
  const r = redis();
  if (!r) return [];
  const ids = (await r.zrange(advisorIndexKey(advisorId), minScore, maxScore, { byScore: true })) as string[];
  const unique = [...new Set(ids)];
  const out: StoredAppointment[] = [];
  for (const id of unique) {
    const a = await getAppointmentById(id);
    if (a) out.push(a);
  }
  return out.sort((x, y) => x.startIso.localeCompare(y.startIso));
}

export async function listAppointmentsInRange(minScore: number, maxScore: number): Promise<StoredAppointment[]> {
  const r = redis();
  if (!r) return [];
  const ids = (await r.zrange(GLOBAL_INDEX, minScore, maxScore, { byScore: true })) as string[];
  const unique = [...new Set(ids)];
  const out: StoredAppointment[] = [];
  for (const id of unique) {
    const a = await getAppointmentById(id);
    if (a) out.push(a);
  }
  return out.sort((x, y) => x.startIso.localeCompare(y.startIso));
}

export function effectiveStatus(a: StoredAppointment): AppointmentStatus {
  return resolvedAppointmentStatus(a);
}

export type BookResult =
  | { ok: true; id: string }
  | { ok: false; code: "redis_off" | "slot_taken" | "bad_times" };

export async function createAppointment(appt: StoredAppointment): Promise<BookResult> {
  const r = redis();
  if (!r) return { ok: false, code: "redis_off" };

  const startMs = Date.parse(appt.startIso);
  const endMs = Date.parse(appt.endIso);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    return { ok: false, code: "bad_times" };
  }

  const lk = lockKey(appt.advisorId, startMs);
  const locked = await r.set(lk, appt.id, { nx: true, ex: 60 * 60 * 24 * 14 });
  if (!locked) return { ok: false, code: "slot_taken" };

  try {
    const toSave: StoredAppointment = {
      ...appt,
      status: appt.status ?? "pending",
    };
    await r.set(dataKey(appt.id), JSON.stringify(toSave));
    await r.zadd(GLOBAL_INDEX, { score: startMs, member: appt.id });
    await r.zadd(advisorIndexKey(appt.advisorId), { score: startMs, member: appt.id });
    return { ok: true, id: appt.id };
  } catch (e) {
    await r.del(lk);
    throw e;
  }
}

export async function markReminderSent(id: string): Promise<boolean> {
  const r = redis();
  if (!r) return false;
  const a = await getAppointmentById(id);
  if (!a || a.reminderSentAt) return false;
  if (effectiveStatus(a) !== "confirmed") return false;
  const next: StoredAppointment = { ...a, reminderSentAt: Date.now() };
  await r.set(dataKey(id), JSON.stringify(next));
  return true;
}

export async function confirmAppointment(id: string): Promise<StoredAppointment | null> {
  const r = redis();
  if (!r) return null;
  const a = await getAppointmentById(id);
  if (!a || effectiveStatus(a) !== "pending") return null;
  const next: StoredAppointment = { ...a, status: "confirmed", confirmedAt: Date.now() };
  await r.set(dataKey(id), JSON.stringify(next));
  return next;
}

/** Libera el hueco y borra datos auxiliares (documentación cifrada). */
export async function rejectAndDeleteAppointment(id: string): Promise<boolean> {
  const r = redis();
  if (!r) return false;
  const a = await getAppointmentById(id);
  if (!a || effectiveStatus(a) === "rejected") return false;

  const startMs = Date.parse(a.startIso);
  if (!Number.isFinite(startMs)) return false;

  await r.del(dataKey(id));
  await r.del(lockKey(a.advisorId, startMs));
  await r.zrem(GLOBAL_INDEX, id);
  await r.zrem(advisorIndexKey(a.advisorId), id);
  await deleteBookingDocs(id);
  return true;
}
