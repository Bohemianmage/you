"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { Locale } from "@/i18n/types";
import { PROPERTY_DETAIL_COPY } from "@/i18n/marketing-pages";

type DetailCopy = (typeof PROPERTY_DETAIL_COPY)["es"];

type SlotsOk = {
  ok: true;
  slotsIso: string[];
  advisorName: string;
};

type SlotsErr = {
  ok: false;
  code: string;
};

export function PropertyVisitBooking({
  locale,
  catalogId,
  segment,
  copy,
}: {
  locale: Locale;
  catalogId: string;
  segment: string;
  copy: DetailCopy;
}) {
  const [slotsRes, setSlotsRes] = useState<SlotsOk | SlotsErr | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [pick, setPick] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [hp, setHp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    setSlotsLoading(true);
    setSlotsRes(null);
    setPick(null);
    setDone(false);
    setFormErr(null);
    try {
      const q = new URLSearchParams({
        catalogId,
        segment,
        locale,
      });
      const res = await fetch(`/api/appointments/slots?${q}`, { cache: "no-store" });
      const data = (await res.json()) as SlotsOk | SlotsErr;
      if (!data || typeof data !== "object" || !("ok" in data)) {
        setSlotsRes({ ok: false, code: "bad_response" });
        return;
      }
      setSlotsRes(data);
    } catch {
      setSlotsRes({ ok: false, code: "network" });
    } finally {
      setSlotsLoading(false);
    }
  }, [catalogId, locale, segment]);

  useEffect(() => {
    void fetchSlots();
  }, [fetchSlots]);

  const unavailableMessage = useMemo(() => {
    if (!slotsRes || slotsRes.ok) return null;
    switch (slotsRes.code) {
      case "no_mapping":
        return copy.bookingUnavailableNoAdvisor;
      case "redis_off":
        return copy.bookingUnavailableNoRedis;
      case "no_email":
        return copy.bookingUnavailableAdvisorEmail;
      case "unknown_property":
        return copy.bookingUnavailableNoAdvisor;
      default:
        return copy.bookingErrServer;
    }
  }, [copy, slotsRes]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    if (hp.trim()) return;
    if (!pick || !name.trim() || !email.trim()) {
      setFormErr(copy.bookingErrValidation);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          catalogId,
          segment,
          startIso: pick,
          guestName: name.trim(),
          guestEmail: email.trim(),
          guestPhone: phone.trim(),
          locale,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; code?: string };
      if (!res.ok || !data.ok) {
        if (data.code === "slot_taken" || data.code === "slot_unavailable") {
          setFormErr(copy.bookingErrConflict);
          await fetchSlots();
        } else {
          setFormErr(copy.bookingErrServer);
        }
        return;
      }
      setDone(true);
      setPick(null);
      setName("");
      setEmail("");
      setPhone("");
      await fetchSlots();
    } catch {
      setFormErr(copy.bookingErrServer);
    } finally {
      setSubmitting(false);
    }
  }

  if (slotsLoading) {
    return (
      <section className="rounded-sm border border-brand-border bg-brand-surface/40 p-6 shadow-sm" aria-busy="true">
        <h2 className="font-heading text-lg font-semibold text-brand-text">{copy.bookingSectionTitle}</h2>
        <p className="mt-3 text-sm text-brand-muted">…</p>
      </section>
    );
  }

  if (!slotsRes || !slotsRes.ok) {
    return (
      <section className="rounded-sm border border-brand-border bg-brand-surface/40 p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold text-brand-text">{copy.bookingSectionTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-brand-muted">{unavailableMessage}</p>
      </section>
    );
  }

  if (slotsRes.slotsIso.length === 0) {
    return (
      <section className="rounded-sm border border-brand-border bg-brand-surface/40 p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold text-brand-text">{copy.bookingSectionTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-brand-muted">{copy.bookingUnavailableNoSlots}</p>
      </section>
    );
  }

  return (
    <section className="rounded-sm border border-brand-border bg-brand-surface/40 p-6 shadow-sm" aria-labelledby="booking-visita-heading">
      <h2 id="booking-visita-heading" className="font-heading text-lg font-semibold text-brand-text">
        {copy.bookingSectionTitle}
      </h2>
      <p className="mt-2 text-xs text-brand-muted">{copy.bookingTimezoneNote}</p>
      <p className="mt-3 text-sm leading-relaxed text-brand-muted">{copy.bookingSectionHint}</p>
      <p className="mt-2 text-xs font-semibold text-brand-text">
        {slotsRes.advisorName ? `${slotsRes.advisorName}` : null}
      </p>

      {done ? (
        <p className="mt-4 rounded-sm border border-brand-accent/30 bg-brand-accent/10 px-4 py-3 text-sm font-medium text-brand-accent-strong">
          {copy.bookingConfirmed}
        </p>
      ) : null}

      <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-6">
        <input type="text" name="website" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted">{copy.bookingPickSlot}</p>
          <div className="mt-3 grid max-h-52 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {slotsRes.slotsIso.map((iso) => {
              const d = new Date(iso);
              const label = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "America/Mexico_City",
              }).format(d);
              const active = pick === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setPick(iso)}
                  className={`rounded-sm border px-3 py-2 text-left text-xs font-semibold transition ${
                    active ? "border-brand-accent bg-brand-accent text-brand-white" : "border-brand-border bg-brand-bg text-brand-text hover:border-brand-accent/50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted">
            {copy.bookingNameLabel}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-2 w-full rounded-sm border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text outline-none ring-brand-accent focus:border-brand-accent focus:ring-1"
              autoComplete="name"
            />
          </label>
          <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted">
            {copy.bookingEmailLabel}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-sm border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text outline-none ring-brand-accent focus:border-brand-accent focus:ring-1"
              autoComplete="email"
            />
          </label>
          <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted sm:col-span-2">
            {copy.bookingPhoneLabel}
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full rounded-sm border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text outline-none ring-brand-accent focus:border-brand-accent focus:ring-1"
              autoComplete="tel"
            />
          </label>
        </div>

        {formErr ? <p className="text-sm font-medium text-brand-accent-strong">{formErr}</p> : null}

        <button
          type="submit"
          disabled={submitting || !pick}
          className="inline-flex w-full items-center justify-center rounded-sm bg-brand-accent px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-brand-white shadow-sm transition hover:bg-brand-accent-strong disabled:opacity-45 sm:w-auto"
        >
          {submitting ? copy.bookingWorking : copy.bookingSubmit}
        </button>
      </form>
    </section>
  );
}
