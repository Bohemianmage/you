"use client";

import { useActionState } from "react";

import { submitContact, type ContactState } from "@/app/actions/contact";

export interface ContactFormLabels {
  name: string;
  email: string;
  phone: string;
  topic: string;
  topicPlaceholder: string;
  topics: { value: string; label: string }[];
  message: string;
  submit: string;
  sending: string;
  success: string;
  errorValidation: string;
  errorNoConfig: string;
  errorSend: string;
  honeypotLabel: string;
}

const initialState: ContactState = { ok: false };

interface ContactFormProps {
  labels: ContactFormLabels;
  /** Pre-selected topic value (e.g. `descargables`). */
  defaultTopic?: string;
  /** When requesting a specific downloadable from `/contacto?item=`. */
  downloadableId?: string;
}

export function ContactForm({ labels, defaultTopic = "general", downloadableId }: ContactFormProps) {
  const [state, formAction, pending] = useActionState(submitContact, initialState);

  if (state.ok) {
    return (
      <p className="rounded-sm border border-brand-border bg-brand-surface px-4 py-3 text-sm font-medium text-brand-text">
        {labels.success}
      </p>
    );
  }

  const errorMessage =
    state.error === "validation"
      ? labels.errorValidation
      : state.error === "no_config"
        ? labels.errorNoConfig
        : state.error === "send_failed"
          ? labels.errorSend
          : null;

  const topicDefault =
    downloadableId || defaultTopic === "descargables"
      ? "descargables"
      : (defaultTopic ?? "general");

  return (
    <form action={formAction} className="space-y-5" key={`${defaultTopic}-${downloadableId ?? ""}`}>
      {errorMessage ? (
        <p className="rounded-sm border border-brand-accent/40 bg-brand-surface px-4 py-3 text-sm text-brand-accent-strong">
          {errorMessage}
        </p>
      ) : null}

      <p className="sr-only">
        <label>
          {labels.honeypotLabel}
          <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" />
        </label>
      </p>

      {downloadableId ? <input type="hidden" name="downloadableId" value={downloadableId} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">
          {labels.name}
          <input
            name="name"
            required
            autoComplete="name"
            className="mt-2 w-full rounded-sm border border-brand-border bg-brand-bg px-3 py-2.5 text-sm text-brand-text outline-none ring-brand-accent focus:border-brand-accent focus:ring-1"
          />
        </label>
        <label className="block text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">
          {labels.email}
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-2 w-full rounded-sm border border-brand-border bg-brand-bg px-3 py-2.5 text-sm text-brand-text outline-none ring-brand-accent focus:border-brand-accent focus:ring-1"
          />
        </label>
      </div>

      <label className="block text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">
        {labels.phone}
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          className="mt-2 w-full rounded-sm border border-brand-border bg-brand-bg px-3 py-2.5 text-sm text-brand-text outline-none ring-brand-accent focus:border-brand-accent focus:ring-1"
        />
      </label>

      <label className="block text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">
        {labels.topic}
        <select
          name="topic"
          defaultValue={topicDefault}
          className="mt-2 w-full rounded-sm border border-brand-border bg-brand-bg px-3 py-2.5 text-sm text-brand-text outline-none ring-brand-accent focus:border-brand-accent focus:ring-1"
        >
          <option value="" disabled>
            {labels.topicPlaceholder}
          </option>
          {labels.topics.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">
        {labels.message}
        <textarea
          name="message"
          required
          rows={5}
          className="mt-2 w-full resize-y rounded-sm border border-brand-border bg-brand-bg px-3 py-2.5 text-sm text-brand-text outline-none ring-brand-accent focus:border-brand-accent focus:ring-1"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-sm bg-brand-accent px-8 py-3.5 text-sm font-semibold text-brand-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition hover:bg-brand-accent-strong disabled:opacity-60 sm:w-auto"
      >
        {pending ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
