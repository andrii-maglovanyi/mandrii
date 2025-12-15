"use client";

import { Accessibility, Info as InfoIcon, Languages, Users } from "lucide-react";

import { Separator } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { GetPublicEventsQuery, Locale } from "~/types";

import { InfoLine } from "../../../Venues/VenueCard/Components/InfoLine";

interface AdditionalInfoProps {
  event: GetPublicEventsQuery["events"][number];
  expanded?: boolean;
  locale: Locale;
}

export const AdditionalInfo = ({ event: evt, expanded = true }: AdditionalInfoProps) => {
  const i18n = useI18n();

  const capacity = evt.capacity as null | number;

  const hasAnyInfo = capacity || evt.language?.length || evt.age_restriction || evt.accessibility_info;

  if (!hasAnyInfo) {
    return null;
  }

  // Helper to render a section with optional separator
  const Section = ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div>
      {expanded && title && <Separator align="left" text={title} />}
      {children}
    </div>
  );

  return (
    <div className="text-on-surface -mx-4 mt-4 mb-2 flex flex-col text-sm">
      {capacity && (
        <Section>
          <InfoLine icon={<Users className="min-h-4 min-w-4" size={16} />} info={`${capacity} ${i18n("people")}`} />
        </Section>
      )}

      {evt.language && evt.language.length > 0 && (
        <Section>
          <InfoLine icon={<Languages className="min-h-4 min-w-4" size={16} />} info={evt.language.join(", ")} />
        </Section>
      )}

      {evt.age_restriction && (
        <Section>
          <InfoLine icon={<InfoIcon className="min-h-4 min-w-4" size={16} />} info={evt.age_restriction} />
        </Section>
      )}

      {evt.accessibility_info && (
        <Section>
          <InfoLine icon={<Accessibility className="min-h-4 min-w-4" size={16} />} info={evt.accessibility_info} />
        </Section>
      )}
    </div>
  );
};
