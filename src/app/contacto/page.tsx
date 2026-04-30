import { ContactSection } from "@/components/home/ContactSection";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { resolveLocale } from "@/i18n/home";
import { CONTACT_FORM_COPY } from "@/i18n/marketing-pages";
import { normalizeContactTopic } from "@/lib/contact-url";
import type { Metadata } from "next";

interface ContactoPageProps {
  searchParams?: Promise<{ lang?: string; topic?: string; item?: string }>;
}

export async function generateMetadata({ searchParams }: ContactoPageProps): Promise<Metadata> {
  const params = searchParams ? await searchParams : undefined;
  const locale = resolveLocale(params?.lang);
  return {
    title: CONTACT_FORM_COPY[locale].sectionTitle,
    description:
      locale === "en"
        ? "Contact YOU Soluciones Inmobiliarias — Mexico City real estate."
        : "Contacto YOU Soluciones Inmobiliarias — CDMX.",
  };
}

export default async function ContactoPage({ searchParams }: ContactoPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const locale = resolveLocale(params?.lang);
  const downloadableId = params?.item;
  const defaultTopic = downloadableId ? "descargables" : normalizeContactTopic(params?.topic);

  return (
    <MarketingLayout locale={locale}>
      <ContactSection copy={CONTACT_FORM_COPY[locale]} defaultTopic={defaultTopic} downloadableId={downloadableId} />
    </MarketingLayout>
  );
}
