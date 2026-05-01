"use client";

import { useRef, useState } from "react";

import { upload } from "@vercel/blob/client";

function safeFilename(name: string): string {
  const base = name.replace(/^.*[/\\]/, "").replace(/[^a-zA-Z0-9._-]+/g, "-");
  return base.slice(0, 160) || "file";
}

type BlobUploadKind = "pdf" | "image";

export function BlobUploadButton({
  kind,
  subfolder,
  onUploaded,
  label,
}: {
  kind: BlobUploadKind;
  /** Carpeta lógica bajo `marketing/` (auditable en el storage). */
  subfolder: string;
  onUploaded: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setPending(true);
    setMessage(null);

    const pathname = `marketing/${subfolder}/${Date.now()}-${safeFilename(file.name)}`;

    try {
      const result = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/admin/blob-upload",
        clientPayload: JSON.stringify({ kind }),
        multipart: file.size > 4 * 1024 * 1024,
      });
      onUploaded(result.url);
      setMessage("OK");
    } catch (err) {
      const text = err instanceof Error ? err.message : "Error al subir";
      setMessage(text);
    } finally {
      setPending(false);
    }
  }

  const accept = kind === "pdf" ? "application/pdf" : "image/jpeg,image/png,image/webp,image/gif,image/svg+xml";

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(ev) => void onFileChange(ev)} />
      <button
        type="button"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className="rounded-sm border border-brand-border bg-brand-surface px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-accent transition hover:border-brand-accent hover:bg-brand-accent/10 disabled:opacity-45"
      >
        {pending ? "Subiendo…" : label ?? (kind === "pdf" ? "Subir PDF" : "Subir imagen")}
      </button>
      {message ? (
        <span className={`text-[11px] ${message === "OK" ? "text-brand-muted" : "text-brand-accent-strong"}`}>{message}</span>
      ) : null}
    </div>
  );
}
