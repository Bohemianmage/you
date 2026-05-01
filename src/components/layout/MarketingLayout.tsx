import type { ReactNode } from "react";

import { MarketingPageFrame } from "@/components/layout/MarketingPageFrame";
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
    <MarketingPageFrame locale={locale} fallback={{ homeCopy, contact }}>
      {children}
    </MarketingPageFrame>
  );
}
