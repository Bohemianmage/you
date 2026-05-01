import "server-only";

import { Redis } from "@upstash/redis";

import { BOOKING_DOCS_TTL_SECONDS, encryptBookingDocsPayload } from "./doc-vault";

const PREFIX = "you:apt";

function redis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function docsKey(appointmentId: string): string {
  return `${PREFIX}:docs:${appointmentId}`;
}

export async function saveEncryptedBookingDocs(appointmentId: string, payloadJson: Record<string, unknown>): Promise<void> {
  const r = redis();
  if (!r) throw new Error("redis_off");
  const ciphertext = encryptBookingDocsPayload(JSON.stringify(payloadJson));
  await r.set(docsKey(appointmentId), ciphertext, { ex: BOOKING_DOCS_TTL_SECONDS });
}

export async function getEncryptedBookingDocsBlob(appointmentId: string): Promise<string | null> {
  const r = redis();
  if (!r) return null;
  return r.get<string>(docsKey(appointmentId));
}

export async function deleteBookingDocs(appointmentId: string): Promise<void> {
  const r = redis();
  if (!r) return;
  await r.del(docsKey(appointmentId));
}
