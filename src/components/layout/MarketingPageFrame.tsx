"use client";

import { createContext, useContext, useEffect, useLayoutEffect, type ReactNode } from "react";

import { EditableSection } from "@/components/admin/editable-section";
import { useSiteContentEditOptional } from "@/components/admin/site-content-edit-provider";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { HashUrlSanitizer } from "@/components/layout/HashUrlSanitizer";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import type { SiteContact } from "@/constants/site-contact";
import type { HomeCopy } from "@/i18n/home";
import { HOME_COPY, marketingNav } from "@/i18n/home";
import type { Locale } from "@/i18n/types";
import { MARKETING_LOCALE_COOKIE } from "@/constants/marketing-locale";
import { mergeHomeCopy, mergeSiteContact } from "@/lib/site-content/merge-public";

type LiveSiteValue = { homeCopy: HomeCopy; contact: SiteContact; locale: Locale };

const LiveSiteContext = createContext<LiveSiteValue | null>(null);

export function useLiveSite(): LiveSiteValue {
  const v = useContext(LiveSiteContext);
  if (!v) throw new Error("useLiveSite debe usarse dentro de MarketingPageFrame");
  return v;
}

export function MarketingPageFrame({
  locale,
  fallback,
  children,
}: {
  locale: Locale;
  fallback: { homeCopy: HomeCopy; contact: SiteContact };
  children: ReactNode;
}) {
  const edit = useSiteContentEditOptional();

  useLayoutEffect(() => {
    edit?.setMarketingLocale(locale);
  }, [edit, locale]);

  /** Persiste idioma para login/logout y enlaces sin `?lang=`. */
  useEffect(() => {
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${MARKETING_LOCALE_COOKIE}=${locale};path=/;max-age=${maxAge};samesite=lax`;
  }, [locale]);

  const live: LiveSiteValue = edit
    ? {
        homeCopy: mergeHomeCopy(locale, HOME_COPY[locale], edit.working),
        contact: mergeSiteContact(edit.working),
        locale,
      }
    : { homeCopy: fallback.homeCopy, contact: fallback.contact, locale };

  return (
    <LiveSiteContext.Provider value={live}>
      <AnalyticsTracker />
      <HashUrlSanitizer />
      <SiteHeader locale={locale} navItems={marketingNav(locale)} />
      <main className="flex-1">{children}</main>
      <EditableSection sectionId="footer" label="Editar pie y contacto">
        <SiteFooter locale={locale} navItems={marketingNav(locale)} footerCopy={live.homeCopy.footer} contact={live.contact} />
      </EditableSection>
    </LiveSiteContext.Provider>
  );
}
