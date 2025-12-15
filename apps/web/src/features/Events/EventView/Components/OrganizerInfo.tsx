"use client";

import { AtSign, User } from "lucide-react";

import { Separator } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { GetPublicEventsQuery, Locale } from "~/types";

import { InfoLine } from "../../../Venues/VenueCard/Components/InfoLine";

interface OrganizerInfoProps {
  event: GetPublicEventsQuery["events"][number];
  expanded?: boolean;
  locale: Locale;
}

/**
 * Event organizer information component showing name, email, and phone.
 * Uses InfoLine components for consistent display and interaction patterns.
 */
export const OrganizerInfo = ({ event: evt, expanded = true }: OrganizerInfoProps) => {
  const i18n = useI18n();

  // Check if we have any organizer info to display
  if (!evt.organizer_name) {
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
      <Section>
        <InfoLine icon={<User className="min-h-4 min-w-4" size={16} />} info={evt.organizer_name} />
      </Section>

      {evt.organizer_email && (
        <Section>
          <InfoLine
            icon={<AtSign className="min-h-4 min-w-4" size={16} />}
            info={evt.organizer_email}
            isEmail
            tooltipText={i18n("Copy organizer email")}
          />
        </Section>
      )}

      {evt.organizer_phone_number && (
        <Section>
          <InfoLine info={evt.organizer_phone_number} isPhoneNumber tooltipText={i18n("Copy organizer phone")} />
        </Section>
      )}
    </div>
  );
};
