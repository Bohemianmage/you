"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getAdminSaveErrorMessage } from "@/app/admin/admin-save-messages";

export type AdminSaveFlash = { kind: "success" } | { kind: "error"; code: string } | null;

const STORAGE_KEY = "you_admin_last_save";

type Stored = { ok: boolean; at: string; code?: string };

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-MX", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function readStoredBanner(): { variant: "ok" | "err"; text: string } | null {
  const raw = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : null;
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Stored;
    if (p.ok) {
      return { variant: "ok", text: `Último guardado correcto · ${formatWhen(p.at)}` };
    }
    const msg = (p.code && getAdminSaveErrorMessage(p.code)) ?? "Error al guardar.";
    return { variant: "err", text: `Último intento falló · ${msg} · ${formatWhen(p.at)}` };
  } catch {
    return null;
  }
}

export function AdminSaveStatus({ flash }: { flash: AdminSaveFlash }) {
  const router = useRouter();
  const [banner, setBanner] = useState<{ variant: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (flash?.kind === "success") {
      const at = new Date().toISOString();
      const data: Stored = { ok: true, at };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setBanner({ variant: "ok", text: `Último guardado correcto · ${formatWhen(at)}` });
      router.replace("/admin", { scroll: false });
      return;
    }

    if (flash?.kind === "error") {
      const at = new Date().toISOString();
      const msg = getAdminSaveErrorMessage(flash.code) ?? "No se pudo guardar.";
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ok: false, at, code: flash.code }));
      setBanner({ variant: "err", text: `Último intento falló · ${msg} · ${formatWhen(at)}` });
      router.replace("/admin", { scroll: false });
      return;
    }

    setBanner(readStoredBanner());
  }, [flash, router]);

  if (!banner) return null;

  const box =
    banner.variant === "ok"
      ? "border-green-700/25 bg-green-700/10 text-brand-text"
      : "border-brand-accent/40 bg-brand-accent/10 text-brand-accent-strong";

  return (
    <p className={`mt-6 rounded-sm border px-4 py-3 text-sm ${box}`} role="status">
      {banner.text}
    </p>
  );
}
