import "server-only";

import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE, verifyAdminToken } from "@/lib/admin/auth";

export async function getIsAdmin(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}
