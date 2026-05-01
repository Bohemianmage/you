export type ListingKindLabels = { rent: string; sale: string };

/**
 * Indicador discreto renta vs venta (catálogo, destacadas y ficha).
 */
export function ListingTypeBadge({
  kind,
  labels,
}: {
  kind: "rent" | "sale" | null | undefined;
  labels: ListingKindLabels;
}) {
  if (kind !== "rent" && kind !== "sale") return null;
  const text = kind === "rent" ? labels.rent : labels.sale;
  const tone =
    kind === "sale"
      ? "bg-brand-you/[0.07] text-brand-you ring-brand-you/18"
      : "bg-brand-accent/[0.09] text-brand-accent-strong ring-brand-accent/22";

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ring-1 ${tone}`}
    >
      {text}
    </span>
  );
}
