"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE, createAdminToken } from "@/lib/admin/auth";

export async function loginAdmin(formData: FormData) {
  const pw = formData.get("password");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof pw !== "string" || pw !== expected) {
    redirect("/admin/login?error=auth");
  }
  const token = await createAdminToken();
  if (!token) redirect("/admin/login?error=config");

  (await cookies()).set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/admin");
}

export async function logoutAdmin() {
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}
