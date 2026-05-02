"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { withYouWordmark } from "@/components/brand/you-wordmark";
import { localeQuery } from "@/i18n/home";
import type { Locale } from "@/i18n/types";
import { PROPERTY_DETAIL_COPY } from "@/i18n/marketing-pages";

const BOOKING_TZ = "America/Mexico_City";

function dayKeyInMexicoCity(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BOOKING_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function groupSlotsByDay(slotsIso: string[]): { orderedKeys: string[]; byDay: Map<string, string[]> } {
  const byDay = new Map<string, string[]>();
  for (const iso of slotsIso) {
    const k = dayKeyInMexicoCity(iso);
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k)!.push(iso);
  }
  for (const arr of byDay.values()) arr.sort((a, b) => a.localeCompare(b));
  const orderedKeys = [...byDay.keys()].sort();
  return { orderedKeys, byDay };
}

type DetailCopy = (typeof PROPERTY_DETAIL_COPY)["es"];

type SlotsOk = {
  ok: true;
  slotsIso: string[];
  advisorName: string | null;
  assignAdvisorAtConfirm: boolean;
};

type SlotsErr = {
  ok: false;
  code: string;
};

type BookingWizardStep = 1 | 2 | 3;

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
  const q = localeQuery(locale);
  const [slotsRes, setSlotsRes] = useState<SlotsOk | SlotsErr | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [pick, setPick] = useState<string | null>(null);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState<BookingWizardStep>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [docIne, setDocIne] = useState(false);
  const [docAddress, setDocAddress] = useState(false);
  const [docIncome, setDocIncome] = useState(false);
  const [docNotes, setDocNotes] = useState("");
  const [acceptLegal, setAcceptLegal] = useState(false);
  const [hp, setHp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const fetchSlots = useCallback(async (opts?: { resetWizard?: boolean }) => {
    const resetWizard = opts?.resetWizard !== false;
    setSlotsLoading(true);
    setSlotsRes(null);
    setPick(null);
    setDone(false);
    setFormErr(null);
    if (resetWizard) {
      setWizardStep(1);
      setSelectedDayKey(null);
    }
    try {
      const qParams = new URLSearchParams({
        catalogId,
        segment,
        locale,
      });
      const res = await fetch(`/api/appointments/slots?${qParams}`, { cache: "no-store" });
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

  const slotsByDay = useMemo(() => {
    if (!slotsRes || !slotsRes.ok || slotsRes.slotsIso.length === 0) {
      return { orderedKeys: [] as string[], byDay: new Map<string, string[]>() };
    }
    return groupSlotsByDay(slotsRes.slotsIso);
  }, [slotsRes]);

  useEffect(() => {
    void fetchSlots();
  }, [fetchSlots]);

  useEffect(() => {
    const keys = slotsByDay.orderedKeys;
    if (!slotsRes?.ok || keys.length === 0) return;
    setSelectedDayKey((prev) => {
      if (!prev) return null;
      return keys.includes(prev) ? prev : null;
    });
  }, [slotsRes, slotsByDay]);

  const unavailableMessage = useMemo(() => {
    if (!slotsRes || slotsRes.ok) return null;
    switch (slotsRes.code) {
      case "no_mapping":
        return copy.bookingUnavailableNoAdvisor;
      case "redis_off":
        return copy.bookingUnavailableNoRedis;
      case "docs_encryption_off":
        return copy.bookingUnavailableNoEncryption;
      case "no_email":
        return copy.bookingUnavailableAdvisorEmail;
      case "unknown_property":
        return copy.bookingUnavailableNoAdvisor;
      default:
        return copy.bookingErrServer;
    }
  }, [copy, slotsRes]);

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: BOOKING_TZ,
      }),
    [locale],
  );
  const timeFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", {
        hour: "numeric",
        ...(locale === "en" ? { hour12: true } : { hour12: false }),
        timeZone: BOOKING_TZ,
      }),
    [locale],
  );

  const timesForDay = useMemo(() => {
    if (!selectedDayKey) return [] as string[];
    return slotsByDay.byDay.get(selectedDayKey) ?? [];
  }, [selectedDayKey, slotsByDay]);

  const summaryDayLabel = useMemo(() => {
    if (!selectedDayKey) return null;
    const firstIso = slotsByDay.byDay.get(selectedDayKey)?.[0];
    return firstIso ? dateFmt.format(new Date(firstIso)) : null;
  }, [selectedDayKey, slotsByDay, dateFmt]);

  const summaryTimeLabel = pick ? timeFmt.format(new Date(pick)) : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (wizardStep !== 3) return;
    setFormErr(null);
    if (hp.trim()) return;
    if (!pick || !name.trim() || !email.trim()) {
      setFormErr(copy.bookingErrValidation);
      return;
    }
    if (!docIne && !docAddress && !docIncome) {
      setFormErr(copy.bookingErrDocsPickOne);
      return;
    }
    if (!acceptLegal) {
      setFormErr(copy.bookingErrLegalAccept);
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
          docIne,
          docProofAddress: docAddress,
          docProofIncome: docIncome,
          docNotes: docNotes.trim(),
          acceptTerms: true as const,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; code?: string };
      if (!res.ok || !data.ok) {
        if (data.code === "slot_taken" || data.code === "slot_unavailable") {
          setFormErr(copy.bookingErrConflict);
          await fetchSlots({ resetWizard: false });
          setWizardStep(2);
        } else if (data.code === "docs_required") {
          setFormErr(copy.bookingErrDocsPickOne);
        } else if (data.code === "validation") {
          setFormErr(copy.bookingErrLegalAccept);
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
      setDocIne(false);
      setDocAddress(false);
      setDocIncome(false);
      setDocNotes("");
      setAcceptLegal(false);
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
        <div className="mt-5 flex flex-col items-start gap-3" role="status" aria-live="polite">
          <div className="h-1.5 w-44 rounded-full bg-brand-border">
            <div className="h-full w-full rounded-full bg-brand-accent-strong/65 motion-safe:animate-pulse" />
          </div>
          <p className="text-sm font-medium text-brand-muted">{copy.bookingLoading}</p>
        </div>
      </section>
    );
  }

  if (!slotsRes || !slotsRes.ok) {
    return (
      <section className="rounded-sm border border-brand-border bg-brand-surface/40 p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold text-brand-text">{copy.bookingSectionTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-brand-muted">
          {unavailableMessage ? withYouWordmark(unavailableMessage) : null}
        </p>
      </section>
    );
  }

  if (slotsRes.slotsIso.length === 0) {
    return (
      <section className="rounded-sm border border-brand-border bg-brand-surface/40 p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold text-brand-text">{copy.bookingSectionTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-brand-muted">{withYouWordmark(copy.bookingUnavailableNoSlots)}</p>
      </section>
    );
  }

  const checkboxClass =
    "mt-1 size-4 shrink-0 rounded border-brand-border text-brand-accent focus:ring-brand-accent";

  return (
    <section className="rounded-sm border border-brand-border bg-brand-surface/40 p-6 shadow-sm" aria-labelledby="booking-visita-heading">
      <h2 id="booking-visita-heading" className="font-heading text-lg font-semibold text-brand-text">
        {copy.bookingSectionTitle}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-brand-muted">{withYouWordmark(copy.bookingSectionHint)}</p>
      <p className="mt-1.5 text-xs text-brand-muted">{copy.bookingTimezoneNote}</p>
      {slotsRes.advisorName ? (
        <p className="mt-2 text-xs font-semibold text-brand-text">{slotsRes.advisorName}</p>
      ) : null}

      {done ? (
        <p className="mt-4 rounded-sm border border-brand-accent/30 bg-brand-accent/10 px-4 py-3 text-sm font-medium text-brand-accent-strong">
          {withYouWordmark(copy.bookingPendingNotice)}
        </p>
      ) : null}

      <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-6">
        <input type="text" name="website" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />

        {wizardStep === 1 ? (
          <div id="booking-days" className="space-y-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted">{copy.bookingPickDay}</p>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] sm:flex-wrap sm:overflow-visible">
                {slotsByDay.orderedKeys.map((key) => {
                  const firstIso = slotsByDay.byDay.get(key)?.[0];
                  const label = firstIso ? dateFmt.format(new Date(firstIso)) : key;
                  const active = selectedDayKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedDayKey(key);
                        setPick(null);
                        setWizardStep(2);
                      }}
                      className={`shrink-0 rounded-sm border px-4 py-2.5 text-left text-xs font-semibold transition sm:min-w-0 ${
                        active
                          ? "border-brand-accent bg-brand-accent text-brand-white shadow-sm"
                          : "border-brand-border bg-brand-bg text-brand-text hover:border-brand-accent/50"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {wizardStep === 2 && selectedDayKey && timesForDay.length > 0 ? (
          <div className="space-y-5">
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted">{copy.bookingPickTime}</p>
                <button
                  type="button"
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-accent hover:underline"
                  onClick={() => {
                    setWizardStep(1);
                    setPick(null);
                    requestAnimationFrame(() => {
                      document.getElementById("booking-days")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                    });
                  }}
                >
                  {copy.bookingChangeDay}
                </button>
              </div>
              {summaryDayLabel ? (
                <p className="mt-1.5 text-sm font-medium text-brand-text">{summaryDayLabel}</p>
              ) : null}
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted">{copy.bookingPickSlot}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {timesForDay.map((iso) => {
                  const active = pick === iso;
                  const label = timeFmt.format(new Date(iso));
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => {
                        setPick(iso);
                        setWizardStep(3);
                      }}
                      className={`rounded-sm border px-2 py-2 text-center text-xs font-semibold transition ${
                        active
                          ? "border-brand-accent bg-brand-accent text-brand-white"
                          : "border-brand-border bg-brand-bg text-brand-text hover:border-brand-accent/50"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {wizardStep === 3 ? (
          <div className="space-y-6">
            <div className="rounded-sm border border-brand-border/80 bg-brand-bg/70 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted">{copy.bookingSummaryHeading}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {summaryDayLabel ? (
                  <span className="rounded-sm border border-brand-border bg-brand-surface/80 px-3 py-1.5 text-xs font-semibold text-brand-text">
                    {summaryDayLabel}
                  </span>
                ) : null}
                {summaryTimeLabel ? (
                  <span className="rounded-sm border border-brand-accent/35 bg-brand-accent/10 px-3 py-1.5 text-xs font-semibold text-brand-accent-strong">
                    {summaryTimeLabel}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                <button
                  type="button"
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-accent hover:underline"
                  onClick={() => {
                    setWizardStep(1);
                    setPick(null);
                  }}
                >
                  {copy.bookingChangeDay}
                </button>
                <button
                  type="button"
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-accent hover:underline"
                  onClick={() => setWizardStep(2)}
                >
                  {copy.bookingChangeTime}
                </button>
              </div>
            </div>

            <div className="rounded-sm border border-brand-border/70 bg-brand-bg/60 px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted">{copy.bookingDocHeading}</p>
              <p className="mt-2 text-xs leading-relaxed text-brand-muted">{copy.bookingDocLead}</p>
              <ul className="mt-4 space-y-3">
                <li>
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-brand-text">
                    <input type="checkbox" checked={docIne} onChange={(e) => setDocIne(e.target.checked)} className={checkboxClass} />
                    <span>{copy.bookingDocIne}</span>
                  </label>
                </li>
                <li>
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-brand-text">
                    <input type="checkbox" checked={docAddress} onChange={(e) => setDocAddress(e.target.checked)} className={checkboxClass} />
                    <span>{copy.bookingDocAddressProof}</span>
                  </label>
                </li>
                <li>
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-brand-text">
                    <input type="checkbox" checked={docIncome} onChange={(e) => setDocIncome(e.target.checked)} className={checkboxClass} />
                    <span>{copy.bookingDocIncomeProof}</span>
                  </label>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted">{copy.bookingContactHeading}</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
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
            </div>

            <div className="rounded-sm border border-brand-border/70 bg-brand-bg/40 px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted">{copy.bookingAdditionalHeading}</p>
              <label className="mt-3 block text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted">
                {copy.bookingDocNotesLabel}
                <textarea
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  rows={3}
                  placeholder={copy.bookingDocNotesPlaceholder}
                  className="mt-2 w-full rounded-sm border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-text outline-none ring-brand-accent focus:border-brand-accent focus:ring-1"
                />
              </label>
              <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm leading-snug text-brand-text">
                <input type="checkbox" checked={acceptLegal} onChange={(e) => setAcceptLegal(e.target.checked)} className={checkboxClass} />
                <span>
                  {copy.bookingLegalIntro}{" "}
                  <Link href={`/terminos${q}`} className="font-semibold text-brand-accent underline-offset-2 hover:underline">
                    {copy.bookingLegalTermsLink}
                  </Link>{" "}
                  {copy.bookingLegalMid}{" "}
                  <Link href={`/privacidad${q}`} className="font-semibold text-brand-accent underline-offset-2 hover:underline">
                    {copy.bookingLegalPrivacyLink}
                  </Link>
                  .
                </span>
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
          </div>
        ) : null}

        {wizardStep !== 3 && formErr ? <p className="text-sm font-medium text-brand-accent-strong">{formErr}</p> : null}
      </form>
    </section>
  );
}
