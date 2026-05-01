"use client";

import Link from "next/link";

import { AboutSection } from "@/components/home/AboutSection";
import { ContactSection } from "@/components/home/ContactSection";
import { DownloadablesSection } from "@/components/home/DownloadablesSection";
import { FeaturedPropertiesSection } from "@/components/home/FeaturedPropertiesSection";
import { HeroSection } from "@/components/home/HeroSection";
import { OfficeSearchSection } from "@/components/home/OfficeSearchSection";
import { OwnerCtaSection } from "@/components/home/OwnerCtaSection";
import { VirtualToursSection } from "@/components/home/VirtualToursSection";
import { ZonesSection } from "@/components/home/ZonesSection";
import { EditableSection } from "@/components/admin/editable-section";
import { useLiveSite } from "@/components/layout/MarketingPageFrame";
import { useSiteContentEditOptional } from "@/components/admin/site-content-edit-provider";
import type { DownloadableItem } from "@/data/downloadables";
import type { FeaturedProperty } from "@/data/properties";
import type { TeamMember } from "@/data/team";
import { ZONES_BY_LOCALE } from "@/data/zones";
import { CONTACT_FORM_COPY } from "@/i18n/marketing-pages";
import { mergeDownloadablesFromFile, mergeFeaturedFromFile, mergeTeamFromFile } from "@/lib/site-content/merge-public";

export function HomePageContent({
  catalogHref,
  contactHref,
  proposalHref,
  tourEmbed,
  serverTeam,
  serverFeatured,
  serverDownloadables,
}: {
  catalogHref: string;
  contactHref: string;
  proposalHref: string;
  tourEmbed?: string;
  serverTeam: TeamMember[];
  serverFeatured: FeaturedProperty[];
  serverDownloadables: DownloadableItem[];
}) {
  const { homeCopy: copy, contact, locale } = useLiveSite();
  const edit = useSiteContentEditOptional();
  const team = edit ? mergeTeamFromFile(edit.working) : serverTeam;
  const featured = edit ? mergeFeaturedFromFile(locale, edit.working) : serverFeatured;
  const downloadables = edit ? mergeDownloadablesFromFile(locale, edit.working) : serverDownloadables;

  return (
    <>
      <EditableSection sectionId="hero-modal" label="Editar">
        <HeroSection copy={copy.hero} modalCopy={copy.modal} catalogHref={catalogHref} contactHref={contactHref} />
      </EditableSection>

      <EditableSection sectionId="about" label="Editar">
        <AboutSection
          locale={locale}
          copy={copy.about}
          footerCopy={copy.footer}
          contact={contact}
          contactHref={contactHref}
          teamMembers={team}
        />
      </EditableSection>

      <EditableSection sectionId="zones" label="Editar">
        <ZonesSection title={copy.zones.title} zones={ZONES_BY_LOCALE[locale]} />
      </EditableSection>

      <EditableSection sectionId="featured" label="Editar">
        <>
          {edit ? (
            <p className="mx-auto mb-3 max-w-6xl px-4 text-center text-xs text-brand-muted sm:px-6 lg:px-8">
              <Link href="/admin/listas" className="font-semibold text-brand-accent no-underline hover:underline">
                Catálogo y orden de destacados
              </Link>{" "}
              (panel Listas).
            </p>
          ) : null}
          <FeaturedPropertiesSection
            locale={locale}
            copy={copy.featured}
            properties={featured}
            catalogHref={catalogHref}
            contactHref={contactHref}
          />
        </>
      </EditableSection>

      <EditableSection sectionId="virtualTours" label="Editar">
        <VirtualToursSection copy={copy.virtualTours} contactHref={contactHref} embedUrl={tourEmbed} />
      </EditableSection>

      <EditableSection sectionId="owner" label="Editar">
        <OwnerCtaSection copy={copy.owner} proposalHref={proposalHref} />
      </EditableSection>

      <EditableSection sectionId="offices" label="Editar">
        <OfficeSearchSection copy={copy.offices} proposalHref={proposalHref} />
      </EditableSection>

      <EditableSection sectionId="downloadables" label="Editar">
        <>
          {edit ? (
            <p className="mx-auto mb-3 max-w-6xl px-4 text-center text-xs text-brand-muted sm:px-6 lg:px-8">
              <Link href="/admin/listas" className="font-semibold text-brand-accent no-underline hover:underline">
                Archivos PDF e imágenes de tarjetas
              </Link>{" "}
              (panel → pestaña Descargables).
            </p>
          ) : null}
          <DownloadablesSection copy={copy.downloadables} items={downloadables} />
        </>
      </EditableSection>

      <EditableSection sectionId="contact" label="Editar contacto">
        <ContactSection copy={CONTACT_FORM_COPY[locale]} />
      </EditableSection>
    </>
  );
}
