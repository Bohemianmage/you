"use client";

import { useRef, useState } from "react";

import { uploadSiteAsset } from "@/app/actions/upload-site-asset";

type UploadKind = "pdf" | "image";

export function SiteAssetUploadButton({
  kind,
  subfolder,
  onUploaded,
  label,
}: {
  kind: UploadKind;
  subfolder: string;
  onUploaded: (publicPath: string) => void;
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

    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    fd.append("subfolder", subfolder);

    const res = await uploadSiteAsset(fd);
    setPending(false);

    if (res.ok) {
      onUploaded(res.publicPath);
      setMessage("Guardado en Git");
    } else {
      setMessage(res.error);
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
        {pending ? "Subiendo…" : label ?? (kind === "pdf" ? "Subir PDF a Git" : "Subir imagen a Git")}
      </button>
      {message ? (
        <span
          className={`max-w-[220px] text-[11px] leading-snug ${message.startsWith("Guardado") ? "text-brand-muted" : "text-brand-accent-strong"}`}
        >
          {message}
        </span>
      ) : null}
    </div>
  );
}
