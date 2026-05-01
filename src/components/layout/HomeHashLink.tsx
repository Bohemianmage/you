"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { canonicalHrefFromNavString, firstHashFragment } from "@/lib/browser-url";

const NAV_BASE = "https://yousoluciones.com";

type HomeHashLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Enlace interno al home con hash — mismo documento: scroll suave y URL canónica (un solo `#`).
 */
export function HomeHashLink({ href, className, children }: HomeHashLinkProps) {
  const pathname = usePathname();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const dest = new URL(href, NAV_BASE);
    const here = `${pathname}${window.location.search}`;
    const destLoc = `${dest.pathname}${dest.search}`;
    if (here !== destLoc) return;
    const frag = firstHashFragment(dest.hash);
    if (!frag) return;
    e.preventDefault();
    document.getElementById(frag)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(window.history.state, "", canonicalHrefFromNavString(href));
  }

  return (
    <Link href={href} className={className} onClick={handleClick} scroll={false}>
      {children}
    </Link>
  );
}
