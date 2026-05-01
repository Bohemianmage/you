"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { replaceStateIfHashAccumulated } from "@/lib/browser-url";

/**
 * Depura fragmentos encadenados (`#a#b`) en cualquier ruta, en montaje, cambio de ruta y `hashchange`/`popstate`.
 */
export function HashUrlSanitizer() {
  const pathname = usePathname();

  useEffect(() => {
    replaceStateIfHashAccumulated();
  }, [pathname]);

  useEffect(() => {
    replaceStateIfHashAccumulated();

    const run = () => {
      replaceStateIfHashAccumulated();
    };

    window.addEventListener("hashchange", run);
    window.addEventListener("popstate", run);
    return () => {
      window.removeEventListener("hashchange", run);
      window.removeEventListener("popstate", run);
    };
  }, []);

  return null;
}
