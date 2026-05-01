"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";

import { useSiteContentEditOptional } from "@/components/admin/site-content-edit-provider";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import type { SiteContact } from "@/constants/site-contact";
import type { HomeCopy } from "@/i18n/home";
import { HOME_COPY, marketingNav } from "@/i18n/home";
import type { Locale } from "@/i18n/types";
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

  useEffect(() => {
    edit?.setMarketingLocale(locale);
  }, [edit, locale]);

  const live: LiveSiteValue = edit
    ? {
        homeCopy: mergeHomeCopy(locale, HOME_COPY[locale], edit.working),
        contact: mergeSiteContact(edit.working),
        locale,
      }
    : { homeCopy: fallback.homeCopy, contact: fallback.contact, locale };

  return (
    <LiveSiteContext.Provider value={live}>
      <SiteHeader locale={locale} navItems={marketingNav(locale)} />
      <main className="flex-1">{children}</main>
      <SiteFooter navItems={marketingNav(locale)} footerCopy={live.homeCopy.footer} contact={live.contact} />
    </LiveSiteContext.Provider>
  );
}
