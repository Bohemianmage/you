import { ADMIN_SESSION_COOKIE, verifyAdminToken } from "@/lib/admin/auth";

/** Valida JWT admin desde el header `Cookie` (Route Handlers / APIs). */
export async function isAdminRequest(request: Request): Promise<boolean> {
  const header = request.headers.get("cookie");
  if (!header) return false;
  const prefix = `${ADMIN_SESSION_COOKIE}=`;
  const part = header
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(prefix));
  const raw = part?.slice(prefix.length);
  if (!raw) return false;
  let token: string;
  try {
    token = decodeURIComponent(raw);
  } catch {
    token = raw;
  }
  return verifyAdminToken(token);
}
