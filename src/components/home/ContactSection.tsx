import { ContactForm } from "@/components/home/ContactForm";
import { CONTACT_FORM_COPY } from "@/i18n/marketing-pages";
import type { Locale } from "@/i18n/types";

type FormCopy = (typeof CONTACT_FORM_COPY)[Locale];

interface ContactSectionProps {
  copy: FormCopy;
  defaultTopic?: string;
  downloadableId?: string;
}

export function ContactSection({ copy, defaultTopic, downloadableId }: ContactSectionProps) {
  return (
    <section id="contact" className="border-b border-brand-border bg-brand-surface py-16 sm:py-20" aria-labelledby="contact-heading">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-2 text-center sm:text-left">
          <h2 id="contact-heading" className="font-heading text-2xl font-semibold text-brand-text sm:text-3xl">
            {copy.sectionTitle}
          </h2>
          <p className="text-sm leading-relaxed text-brand-muted">{copy.sectionSubtitle}</p>
        </div>
        <ContactForm labels={copy} defaultTopic={defaultTopic} downloadableId={downloadableId} />
      </div>
    </section>
  );
}
