/** Valores guardados en JSON / admin. */
export type TeamImageFocusPreset = "center" | "top" | "face" | "bottom" | "left" | "right";

type FrameFields = {
  imageFocus?: TeamImageFocusPreset;
  imageObjectPosition?: string;
};

export const TEAM_IMAGE_FOCUS_OPTIONS: readonly {
  value: TeamImageFocusPreset;
  label: string;
  /** `object-position` */
  position: string;
  /** Origen del `scale()` al hacer zoom */
  origin: string;
}[] = [
  { value: "center", label: "Centro", position: "center center", origin: "50% 50%" },
  { value: "top", label: "Arriba (retratos)", position: "center top", origin: "50% 0%" },
  { value: "face", label: "Rostro (ligero arriba)", position: "center 28%", origin: "50% 28%" },
  { value: "bottom", label: "Abajo", position: "center bottom", origin: "50% 100%" },
  { value: "left", label: "Izquierda", position: "left center", origin: "0% 50%" },
  { value: "right", label: "Derecha", position: "right center", origin: "100% 50%" },
] as const;

export function clampTeamImageZoom(z: number | undefined): number {
  if (z == null || Number.isNaN(z)) return 100;
  return Math.min(140, Math.max(100, Math.round(z)));
}

/** `object-position` efectivo (personalizado gana sobre preset). */
export function teamImageObjectPosition(member: FrameFields): string {
  const custom = member.imageObjectPosition?.trim();
  if (custom) return custom;
  const preset = TEAM_IMAGE_FOCUS_OPTIONS.find((o) => o.value === (member.imageFocus ?? "center"));
  return preset?.position ?? "center center";
}

export function teamImageTransformOrigin(member: FrameFields): string {
  if (member.imageObjectPosition?.trim()) return "50% 50%";
  const preset = TEAM_IMAGE_FOCUS_OPTIONS.find((o) => o.value === (member.imageFocus ?? "center"));
  return preset?.origin ?? "50% 50%";
}
