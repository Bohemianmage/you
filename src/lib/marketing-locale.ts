import "server-only";

import { cookies } from "next/headers";

import { MARKETING_LOCALE_COOKIE } from "@/constants/marketing-locale";
import { resolveLocale } from "@/i18n/home";
import type { Locale } from "@/i18n/types";

/**
 * Idioma marketing: gana `?lang=en` en URL; si no hay query, se usa la cookie
 * (tras login/logout o enlaces sin `lang`).
 */
export async function resolveMarketingLocale(searchParamsLang?: string | null): Promise<Locale> {
  const jar = await cookies();
  const fromCookie = jar.get(MARKETING_LOCALE_COOKIE)?.value;
  return resolveLocale(searchParamsLang ?? undefined, fromCookie);
}
