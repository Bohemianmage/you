import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const PREFIX = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;

/** Clave AES-256 (32 bytes): hex de 64 caracteres o base64 estándar de 32 bytes. Env `BOOKING_DOCS_ENCRYPTION_KEY`. */
export function bookingDocsEncryptionConfigured(): boolean {
  return getBookingDocsKey() !== null;
}

export function getBookingDocsKey(): Buffer | null {
  const raw = process.env.BOOKING_DOCS_ENCRYPTION_KEY?.trim();
  if (!raw) return null;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, "hex");
  try {
    const b = Buffer.from(raw, "base64");
    if (b.length === 32) return b;
  } catch {
    /* ignore */
  }
  return null;
}

export function encryptBookingDocsPayload(plaintextUtf8: string): string {
  const key = getBookingDocsKey();
  if (!key) throw new Error("booking_docs_key_missing");
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv("aes-256-gcm", key, iv, { authTagLength: TAG_LEN });
  const enc = Buffer.concat([cipher.update(plaintextUtf8, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([Buffer.from(PREFIX, "utf8"), iv, tag, enc]).toString("base64url");
}

export function decryptBookingDocsPayload(blobBase64Url: string): string {
  const key = getBookingDocsKey();
  if (!key) throw new Error("booking_docs_key_missing");
  const buf = Buffer.from(blobBase64Url, "base64url");
  const prefix = buf.subarray(0, PREFIX.length).toString("utf8");
  if (prefix !== PREFIX) throw new Error("booking_docs_bad_format");
  let o = PREFIX.length;
  const iv = buf.subarray(o, o + IV_LEN);
  o += IV_LEN;
  const tag = buf.subarray(o, o + TAG_LEN);
  o += TAG_LEN;
  const enc = buf.subarray(o);
  const decipher = createDecipheriv("aes-256-gcm", key, iv, { authTagLength: TAG_LEN });
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

export const BOOKING_DOCS_TTL_SECONDS = 30 * 24 * 60 * 60;
