"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE, createAdminToken } from "@/lib/admin/auth";
import { MARKETING_LOCALE_COOKIE } from "@/constants/marketing-locale";

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
  const jar = await cookies();
  const pref = jar.get(MARKETING_LOCALE_COOKIE)?.value?.trim();
  redirect(pref === "en" ? "/?lang=en" : "/");
}

export async function logoutAdmin() {
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}
