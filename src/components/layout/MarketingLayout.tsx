import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { marketingNav } from "@/i18n/home";
import { getMergedSiteContext } from "@/lib/site-settings/merge";
import type { Locale } from "@/i18n/types";

interface MarketingLayoutProps {
  locale: Locale;
  children: ReactNode;
}

/** Shared chrome for marketing routes (`/propiedades`, `/nuestra-propuesta`, `/contacto`). */
export async function MarketingLayout({ locale, children }: MarketingLayoutProps) {
  const { homeCopy, contact } = await getMergedSiteContext(locale);
  return (
    <>
      <SiteHeader locale={locale} navItems={marketingNav(locale)} />
      <main className="flex-1">{children}</main>
      <SiteFooter navItems={marketingNav(locale)} footerCopy={homeCopy.footer} contact={contact} />
    </>
  );
}
