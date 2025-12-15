import { Calendar, Scissors } from "lucide-react";
import { useLocale } from "next-intl";

import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { GetPublicVenuesQuery, Locale } from "~/types";

import { MetadataChips, MetadataSection } from "./MetadataSection";

interface BeautyMetadataDisplayProps {
  beautySalonDetails: GetPublicVenuesQuery["venues"][number]["venue_beauty_salon_details"][number];
}

export const BeautyMetadataDisplay = ({ beautySalonDetails }: BeautyMetadataDisplayProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  const { appointment_required, services, walk_ins_accepted } = beautySalonDetails ?? {};

  const hasServices = services && services.length > 0;
  const hasAppointmentInfo = typeof appointment_required === "boolean" || typeof walk_ins_accepted === "boolean";

  if (!hasServices && !hasAppointmentInfo) return null;

  return (
    <div className="space-y-6">
      {hasServices && (
        <MetadataSection icon={Scissors} title={i18n("Services")}>
          <MetadataChips
            items={(services as (typeof constants.options.BEAUTY_SERVICES)[number]["value"][]).map(
              (service) =>
                constants.options.BEAUTY_SERVICES.find((option) => option.value === service)?.label[locale] || service,
            )}
          />
        </MetadataSection>
      )}

      {hasAppointmentInfo && (
        <MetadataSection icon={Calendar} title={i18n("Booking")}>
          <div className="space-y-2 text-sm">
            {appointment_required && (
              <div className="text-on-surface flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>{i18n("Appointment required")}</span>
              </div>
            )}
            {walk_ins_accepted && (
              <div className="text-on-surface flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>{i18n("Walk-ins accepted")}</span>
              </div>
            )}
          </div>
        </MetadataSection>
      )}
    </div>
  );
};
