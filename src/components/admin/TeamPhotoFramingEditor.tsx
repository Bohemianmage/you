"use client";

import Image from "next/image";
import { useCallback, useRef } from "react";

import type { TeamMember } from "@/data/team";
import {
  clampTeamImageZoom,
  TEAM_IMAGE_FOCUS_OPTIONS,
  teamImageObjectPosition,
  teamImageTransformOrigin,
  type TeamImageFocusPreset,
} from "@/lib/team-image-framing";

function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function TeamPhotoFramingEditor({
  member,
  onPatch,
}: {
  member: TeamMember;
  onPatch: (patch: Partial<TeamMember>) => void;
}) {
  const zoomPct = clampTeamImageZoom(member.imageZoom);
  const scale = zoomPct / 100;
  const transformOrigin = teamImageTransformOrigin(member);
  const objectPosition = teamImageObjectPosition(member);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const applyPoint = useCallback(
    (clientX: number, clientY: number) => {
      const el = viewportRef.current;
      if (!el || !member.imageSrc) return;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      const x = ((clientX - r.left) / r.width) * 100;
      const y = ((clientY - r.top) / r.height) * 100;
      const px = Math.min(98, Math.max(2, Math.round(x)));
      const py = Math.min(98, Math.max(2, Math.round(y)));
      onPatch({ imageObjectPosition: `${px}% ${py}%` });
    },
    [member.imageSrc, onPatch],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!member.imageSrc) return;
      dragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      applyPoint(e.clientX, e.clientY);
    },
    [applyPoint, member.imageSrc],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      applyPoint(e.clientX, e.clientY);
    },
    [applyPoint],
  );

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  }, []);

  const applyPreset = useCallback(
    (preset: TeamImageFocusPreset) => {
      onPatch({ imageFocus: preset, imageObjectPosition: undefined });
    },
    [onPatch],
  );

  return (
    <div className="space-y-4 rounded-sm border border-brand-border bg-brand-surface/50 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Vista previa del encuadre</p>

      <div
        ref={viewportRef}
        aria-label={member.imageSrc ? "Arrastra para elegir qué parte de la foto se ve centrada" : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`relative aspect-[16/10] w-full max-w-sm overflow-hidden rounded-sm border border-brand-border bg-brand-surface ring-1 ring-brand-border/40 ${
          member.imageSrc ? "cursor-crosshair touch-none select-none" : ""
        }`}
      >
        {member.imageSrc ? (
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                transformOrigin,
                transform: scale !== 1 ? `scale(${scale})` : undefined,
              }}
            >
              <Image
                src={member.imageSrc}
                alt=""
                fill
                draggable={false}
                unoptimized={member.imageSrc.startsWith("http")}
                className="pointer-events-none object-cover"
                style={{ objectPosition }}
                sizes="320px"
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-accent/15 via-brand-surface to-brand-accent/10">
            <span className="font-heading text-xl font-semibold tracking-wide text-brand-accent">{memberInitials(member.name)}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="flex flex-col gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">
          Zoom ({zoomPct}%)
          <input
            type="range"
            min={100}
            max={140}
            step={1}
            value={zoomPct}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isFinite(n)) return;
              onPatch({ imageZoom: clampTeamImageZoom(n) });
            }}
            className="w-full accent-brand-accent"
          />
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Accesos rápidos</p>
        <div className="flex flex-wrap gap-2">
          {TEAM_IMAGE_FOCUS_OPTIONS.map((o) => {
            const active =
              !member.imageObjectPosition?.trim() && (member.imageFocus ?? "center") === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => applyPreset(o.value)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                  active
                    ? "border-brand-accent bg-brand-accent/15 text-brand-accent-strong"
                    : "border-brand-border bg-brand-bg text-brand-text hover:border-brand-accent/50"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      {member.imageObjectPosition?.trim() ? (
        <button
          type="button"
          className="text-xs font-semibold text-brand-accent underline-offset-2 hover:underline"
          onClick={() => onPatch({ imageObjectPosition: undefined })}
        >
          Usar solo preset (quitar ajuste fino)
        </button>
      ) : null}
    </div>
  );
}
