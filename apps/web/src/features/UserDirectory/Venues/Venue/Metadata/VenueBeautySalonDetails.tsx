import { Calendar, Scissors } from "lucide-react";
import { useLocale } from "next-intl";
import { useCallback } from "react";

import { Checkbox, Separator } from "~/components/ui";
import { FormProps } from "~/hooks/form/useForm";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { VenueFormData, VenueSchema } from "~/lib/validation/venue";
import { Locale } from "~/types";

type VenueBeautySalonDetails = NonNullable<VenueFormData["venue_beauty_salon_details"]>;
type VenueBeautySalonDetailsProps = Pick<FormProps<VenueSchema["shape"]>, "setValues" | "values">;

export const VenueBeautySalonDetails = ({ setValues, values }: VenueBeautySalonDetailsProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  const beautyData = values.venue_beauty_salon_details ?? {};

  const updateBeautyData = useCallback(
    (updates: Partial<VenueBeautySalonDetails>) => {
      setValues((prev) => {
        const currentBeautySalonDetails = prev.venue_beauty_salon_details ?? {};

        return {
          ...prev,
          venue_beauty_salon_details: {
            ...currentBeautySalonDetails,
            ...updates,
          },
        };
      });
    },
    [setValues],
  );

  const toggleService = useCallback(
    (service: (typeof constants.options.BEAUTY_SERVICES)[number]["value"]) => {
      const currentServices = beautyData.services || [];
      const newServices = currentServices.includes(service)
        ? currentServices.filter((s) => s !== service)
        : [...currentServices, service];

      updateBeautyData({ services: newServices });
    },
    [beautyData.services, updateBeautyData],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Scissors size={20} />
          {i18n("Services offered")}
        </h3>

        <div className={`grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3`}>
          {constants.options.BEAUTY_SERVICES.map((service) => (
            <Checkbox
              checked={(beautyData.services || []).includes(service.value)}
              key={service.value}
              label={service.label[locale]}
              onChange={() => {
                toggleService(service.value);
              }}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Calendar size={20} />
          {i18n("Booking information")}
        </h3>

        <div className="space-y-3">
          <Checkbox
            checked={beautyData.appointment_required || false}
            label={i18n("Appointment required")}
            onChange={(e) => {
              updateBeautyData({ appointment_required: e.target.checked });
            }}
          />

          <Checkbox
            checked={beautyData.walk_ins_accepted || false}
            label={i18n("Walk-ins accepted")}
            onChange={(e) => {
              updateBeautyData({ walk_ins_accepted: e.target.checked });
            }}
          />
        </div>
      </div>
    </div>
  );
};
