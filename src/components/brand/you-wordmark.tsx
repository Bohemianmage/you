import type { ReactNode } from "react";

const YOU_SPLIT = /(\bYOU\b)/g;

/**
 * Marca corporativa en texto: cada "YOU" en negrita y color #1a1e61 (`text-brand-you`).
 */
export function withYouWordmark(text: string): ReactNode {
  if (!text.includes("YOU")) return text;
  const parts = text.split(YOU_SPLIT);
  return parts.map((part, i) =>
    part === "YOU" ? (
      <strong key={`you-${i}`} className="font-bold text-brand-you">
        YOU
      </strong>
    ) : (
      part
    ),
  );
}
