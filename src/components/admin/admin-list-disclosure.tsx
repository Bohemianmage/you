"use client";

import type { ReactNode } from "react";

/**
 * Fila de lista admin: barra superior (drag + título + acciones) y cuerpo colapsable con animación.
 */
export function AdminListDisclosureRow({
  open,
  onToggle,
  dragHandle,
  title,
  actions,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  dragHandle: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 px-4 pt-4">
        {dragHandle}
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-sm px-2 py-1 text-left transition hover:bg-brand-surface/90"
          aria-expanded={open}
        >
          <span
            className={`inline-flex h-6 w-6 shrink-0 items-center justify-center text-brand-muted transition-transform duration-200 ease-out motion-reduce:transition-none ${open ? "rotate-90" : ""}`}
            aria-hidden
          >
            ▸
          </span>
          <span className="min-w-0 flex-1">{title}</span>
        </button>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        ) : null}
      </div>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 pb-4 pt-3">{children}</div>
        </div>
      </div>
    </>
  );
}
