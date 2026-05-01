import type { ReactNode } from "react";

/**
 * Se remonta en cada navegación — animación suave entre vistas marketing.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-transition-shell flex flex-1 flex-col">{children}</div>;
}
